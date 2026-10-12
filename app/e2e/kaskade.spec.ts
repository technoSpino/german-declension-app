import { expect, test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = join(process.cwd(), '.e2e-data') // the E2E API's KASKADE_DATA_DIR
const TMP = join(DATA_DIR, 'fixtures')

// Original test subtitles (written for these tests).
const SRT = `1
00:00:00,500 --> 00:00:02,000
Guten Morgen, wie geht es dir?

2
00:00:02,500 --> 00:00:04,000
Danke, mir geht es gut.

3
00:00:04,500 --> 00:00:06,000
Hast du heute Zeit für einen Kaffee?

4
00:00:06,500 --> 00:00:08,000
Leider nicht, ich muss arbeiten.
`

/** A 9-second silent grey WebM clip, generated with ffmpeg. */
function testClip(): string {
  mkdirSync(TMP, { recursive: true })
  const out = join(TMP, 'clip.webm')
  if (!existsSync(out)) {
    execFileSync('ffmpeg', [
      '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=gray:s=320x180:d=9',
      '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', '9',
      '-c:v', 'libvpx', '-b:v', '100k', '-c:a', 'libopus', out
    ])
  }
  return out
}

// Smoke tests against the running Kaskade services. Each test collects console
// errors and fails if any appear.
function watchConsole(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  return errors
}

test('Heute loads with the day plan, block timer and done toggle', async ({ page }) => {
  const errors = watchConsole(page)
  // Browser clock = the API's pinned clock (Tue 09:30 Berlin).
  await page.clock.setFixedTime(new Date('2026-10-13T07:30:00Z'))
  await page.goto('/')
  await expect(page.getByTestId('heute')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible()
  // Server clock: Tuesday, week 1 → speaking task p01
  await expect(page.getByText('Woche 1 · Wohnen und Nachbarn')).toBeVisible()
  await expect(page.getByTestId('block-pruefung')).toContainText('Ein Hoffest für das Haus')

  // #16: every block names its exact item — 2A, week 1, Tuesday: library text t04 in free reading
  await expect(page.getByTestId('assign-lesen')).toContainText('Streit wegen der Musik')
  await expect(page.getByTestId('assign-input')).toContainText('Besichtigung einer Wohnung')
  // Timeline: labelled segments, exactly one highlighted (09:30 → Schauen), the rest upcoming.
  const timeline = page.getByTestId('timeline')
  await expect(timeline).toContainText('Karten')
  await expect(timeline).toContainText('Prüfung')
  await expect(timeline.locator('[data-state="current"]')).toHaveCount(1)
  await expect(timeline.locator('[data-state="current"]')).toContainText('Schauen')
  // Starting the free-reading block opens the suggested text; the timer keeps running in the header.
  await page.getByTestId('start-lesen').click()
  await expect(page).toHaveURL(/\/lesen\/t\d+/)
  await expect(page.getByTestId('header-timer')).toContainText('Freies Lesen')
  await page.getByTestId('header-timer').click()
  await expect(page.getByTestId('header-timer')).toHaveCount(0)

  await page.goto('/')
  await expect(page.getByTestId('feed-row')).toContainText('/api/feed.xml')
  await page.getByTestId('done-input').click()
  await expect(page.getByTestId('done-input')).toContainText('Erledigt')
  await expect(timeline.locator('[data-state="done"]')).toContainText('✓ Schauen')
  expect(errors).toEqual([])
})

/** Turn the pinned plan day into a preview day (weekend or before the start) by rewriting /api/today. */
async function asPreviewDay(page: Page, kind: 'weekend' | 'beforeStart') {
  await page.route('**/api/today', async (route) => {
    const res = await route.fetch()
    const t = await res.json()
    const preview = { date: '2026-10-19', weekday: 'Mo', week: 2, day: t.day, theme: t.theme, goal: t.goal, exam: t.exam, mockExam: null }
    await route.fulfill({
      response: res,
      json: { ...t, day: null, theme: null, exam: null, weekday: 'Sa', weekend: true, beforeStart: kind === 'beforeStart', preview }
    })
  })
}

test('Heute on a weekend: Start buttons are disabled with a hint and do nothing', async ({ page }) => {
  const errors = watchConsole(page)
  await asPreviewDay(page, 'weekend')
  await page.goto('/')
  await expect(page.getByText('Wochenende — kein Lernblock.')).toBeVisible()
  // pinned clock → no hours yet: one line instead of an empty chart
  await expect(page.getByTestId('heute-hours-empty')).toContainText('Noch keine Zeit erfasst')
  for (const id of ['karten', 'input', 'lesen', 'pruefung']) {
    await expect(page.getByTestId(`start-${id}`)).toHaveAttribute('aria-disabled', 'true')
  }
  await expect(page.getByTestId('done-karten')).toHaveCount(0)

  // Keyboard focus shows the hint (aria-describedby), clicking does nothing.
  await page.getByTestId('start-karten').focus()
  await expect(page.getByTestId('tip-karten')).toBeVisible()
  await expect(page.getByTestId('tip-karten')).toHaveText(/^Wochenende — der Lernblock läuft Mo–Fr\./)
  await page.getByTestId('start-karten').press('Escape')
  await expect(page.getByTestId('tip-karten')).toBeHidden()
  await page.getByTestId('start-input').hover()
  await expect(page.getByTestId('tip-input')).toBeVisible()
  // Playwright won't click aria-disabled elements on its own (good) — force it, and press Enter too.
  await page.getByTestId('start-input').click({ force: true })
  await page.getByTestId('start-input').press('Enter')
  await expect(page).toHaveURL(/127\.0\.0\.1:5174\/$/)
  await expect(page.getByTestId('header-timer')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('Heute before the plan start names the start date', async ({ page }) => {
  await asPreviewDay(page, 'beforeStart')
  await page.goto('/')
  await page.getByTestId('start-lesen').focus()
  await expect(page.getByTestId('tip-lesen')).toHaveText(/^Dein Plan startet am Mo, 12\. Oktober\./)
})

test('Aufgabe: plan writing task can be submitted', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/aufgabe/s01')
  await expect(page.getByRole('heading', { name: 'Ein Beet im Hof' })).toBeVisible()
  await page.getByTestId('wt-text').fill('Liebe Lea, stell dir vor, wir haben jetzt einen Garten im Hof! Mein Beet ist klein, aber schön. Komm doch am Samstag vorbei! Viele Grüße')
  await page.getByTestId('wt-submit').click()
  await expect(page.getByText('✓ Gespeichert')).toBeVisible()
  expect(errors).toEqual([])
})

test('Wortschatz-Test can be answered and shows a result', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/wortschatz')
  await page.getByTestId('vt-start').click()
  const word = page.getByTestId('vt-word')
  await expect(word).toBeVisible()
  // Answer "ja" for the first half, then "nein" — via keyboard J/N.
  for (let i = 0; i < 400; i++) {
    if (await page.getByTestId('vocab-result').isVisible()) break
    await page.keyboard.press(i % 2 ? 'n' : 'j')
  }
  await expect(page.getByTestId('vocab-result')).toBeVisible()
  await expect(page.getByTestId('vocab-result')).toContainText('Wörter bekannt')
  expect(errors).toEqual([])
})

test('Einstufung runs end to end (with pause and resume) and shows a result', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/einstufung')
  await page.getByTestId('pl-start').click()

  // 1 Wortschatz
  await page.getByTestId('vt-start').click()
  for (let i = 0; i < 400; i++) {
    if (await page.getByTestId('reading-test').isVisible()) break
    await page.keyboard.press(i % 3 ? 'j' : 'n')
  }
  // Pause and come back: the step is restored.
  await page.goto('/')
  await page.goto('/einstufung')
  await expect(page.getByTestId('reading-test')).toBeVisible()

  // 2 Lesen: always answer A, Enter = weiter
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('a')
    await page.keyboard.press('Enter')
  }
  // 3 Satz-Check skipped
  await page.getByTestId('sc-skip').click()
  // 4 Schreiben
  await page.getByTestId('wt-text').fill('Liebe Jana, ich bin vor zwei Wochen umgezogen. Die Wohnung ist hell und ruhig. Komm mich doch bald besuchen! Viele Grüße')
  await page.getByTestId('wt-submit').click()
  await page.getByTestId('pl-next').click()
  // 5 Sprechen: three short recordings with the fake microphone
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('sp-record').click()
    await page.waitForTimeout(700)
    await page.getByTestId('sp-stop').click()
    await expect(page.getByText(`${i + 1} ✓`)).toBeVisible()
  }
  await page.getByTestId('sp-done').click()
  await page.getByTestId('pl-finish').click()

  const result = page.getByTestId('placement-result')
  await expect(result).toBeVisible()
  await expect(result).toContainText('Deine Phase')
  await expect(result).toContainText('3 Aufnahmen gespeichert')
  await expect(page.getByTestId('phase')).toBeVisible()
  expect(errors).toEqual([])
})

test('Karten: reveal, rate, "kenne ich schon" and undo', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/karten')
  const satz = page.getByTestId('karte-satz')
  await expect(satz).toBeVisible()
  const first = await satz.textContent()

  await page.keyboard.press('Space')
  await expect(page.getByTestId('karte-back')).toBeVisible()
  await expect(page.getByTestId('rate-3')).toContainText('Gut')
  await page.keyboard.press('3')
  await expect(satz).not.toHaveText(first!)

  const second = await satz.textContent()
  await page.keyboard.press('k')
  await expect(page.getByText('kenne ich schon. Kommt nicht wieder.')).toBeVisible()
  await expect(satz).not.toHaveText(second!)

  await page.keyboard.press('z')
  await expect(satz).toHaveText(second!)
  // the known card does not come back after "kenne ich" (without undo)
  await page.getByTestId('karte-known').click()
  await expect(satz).not.toHaveText(second!)
  expect(errors).toEqual([])
})

test('Lesen: reader with word states, case lens, glossary and "gelesen"', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/lesen')
  await page.getByTestId('text-t01').click()
  await expect(page.getByTestId('reader')).toContainText('Ärger mit der Heizung')
  // analysed text: new words highlighted, case letters shown
  await expect(page.locator('.at-word[data-state="neu"]').first()).toBeVisible()
  await expect(page.locator('.at-sup').first()).toBeVisible()
  await page.locator('.at-word', { hasText: /^Heizung$/ }).first().click()
  await expect(page.getByTestId('word-panel')).toContainText('„heating“')
  // View toggle: Neue Wörter / Kasus / Beides (remembered)
  await expect(page.getByTestId('reader-view-beides')).toHaveAttribute('aria-checked', 'true')
  await page.getByTestId('reader-view-neu').click()
  await expect(page.locator('.at-sup')).toHaveCount(0)
  await expect(page.locator('.at-neu').first()).toBeVisible()
  await page.getByTestId('reader-view-kasus').click()
  await expect(page.locator('.at-neu')).toHaveCount(0)
  await expect(page.locator('.at-sup').first()).toBeVisible()
  await page.reload()
  await expect(page.getByTestId('reader-view-kasus')).toHaveAttribute('aria-checked', 'true')
  await page.getByTestId('reader-view-beides').click()
  await page.getByTestId('reader-help').click()
  await expect(page.locator('.at-neu')).toHaveCount(0)
  await expect(page.locator('.at-sup')).toHaveCount(0)
  await page.getByTestId('reader-done').click()
  await expect(page.getByText('✓ gelesen').first()).toBeVisible()
  await page.goto('/lesen')
  await expect(page.getByTestId('text-t01')).toContainText('gelesen')
  expect(errors).toEqual([])
})

test('Satz minen from a pasted text → card comes first in Karten', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/lesen')
  await page.getByTestId('eigener-text-link').click()
  await page.getByTestId('paste-text').fill('Gestern habe ich mit meinem Vermieter über die Reparatur gesprochen.')
  await page.getByTestId('paste-run').click()
  await expect(page.locator('.at-sup', { hasText: 'D' }).first()).toBeVisible()
  await page.locator('.at-word', { hasText: /^Vermieter$/ }).click()
  await expect(page.getByTestId('word-panel')).toContainText('mit + Dativ')
  await page.getByTestId('mine').click()
  await expect(page.getByText('Gemined — kommt als neue Karte.')).toBeVisible()
  await page.goto('/karten')
  await expect(page.getByTestId('karte')).toContainText('Gemined · Eigener Text')
  await expect(page.getByTestId('karte-satz')).toContainText('Vermieter')
  expect(errors).toEqual([])
})

test('Prüfungstraining: timed reading task, listening task and writing self-check', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/pruefung')
  await expect(page.getByTestId('ready-lesen')).toContainText('noch nicht geübt')
  await page.getByTestId('item-l4').click()
  await page.getByTestId('start-timed').click()
  await expect(page.getByTestId('countdown')).toBeVisible()
  for (let i = 1; i <= 5; i++) await page.getByTestId(`l4-${i}-r`).click()
  await page.getByTestId('practice-submit').click()
  await expect(page.getByTestId('practice-result')).toContainText('%')

  await page.goto('/pruefung/hoeren/h1')
  await page.getByTestId('start-free').click()
  for (let i = 1; i <= 4; i++) await page.getByTestId(`h1-${i}-f`).click()
  await page.getByTestId('practice-submit').click()
  await expect(page.getByText('Transkript anzeigen')).toBeVisible()

  await page.goto('/pruefung/schreiben/s01')
  await page.getByTestId('start-free').click()
  await page.getByTestId('practice-text').fill('Liebe Lea, wir haben jetzt einen Garten im Hof. Komm doch vorbei! Viele Grüße')
  await page.getByTestId('check-aufgabe').check()
  await page.getByTestId('check-anrede').check()
  await page.getByTestId('practice-submit').click()
  await expect(page.getByTestId('practice-result')).toContainText('2 / 4')

  await page.goto('/pruefung')
  await expect(page.getByTestId('ready-lesen')).toContainText('1 Versuche')
  expect(errors.filter((e) => !e.includes('404'))).toEqual([])
})

test('Immersion: manual entry shows up on Heute and in the list', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/')
  await page.getByTestId('imm-toggle').click()
  await page.getByTestId('imm-title').fill('Checker Tobi')
  await page.getByTestId('imm-minutes').fill('25')
  await page.getByTestId('imm-passiv').check()
  await page.getByTestId('imm-save').click()
  await expect(page.locator('span', { hasText: 'Passiv' }).filter({ hasText: '0,4 h' })).toBeVisible()
  await page.goto('/immersion')
  await expect(page.getByTestId('immersion')).toContainText('Checker Tobi')
  expect(errors).toEqual([])
})

test('Server down: friendly banner instead of a broken page', async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({ status: 502, contentType: 'text/html', body: '<html>Bad Gateway</html>' }))
  await page.goto('/')
  await expect(page.getByTestId('server-banner')).toContainText('kaskade-api')
  await page.goto('/karten')
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.unroute('**/api/**')
  await page.getByTestId('server-banner').getByRole('button').click()
  await expect(page.getByTestId('server-banner')).toHaveCount(0)
})

test('Fahrplan shows forecast, phases and checks', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/fahrplan')
  await expect(page.getByText('Prognose B2')).toBeVisible()
  await expect(page.getByText('Stunden bis B2')).toBeVisible()
  await expect(page.locator('[data-testid^="phase-"]', { hasText: 'Jetzt' })).toHaveCount(1)
  await expect(page.getByText('Nächster Satz-Check')).toBeVisible()
  expect(errors).toEqual([])
})

test('Karten audio button plays (server audio or browser fallback) without errors', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/karten')
  await page.getByTestId('karte-audio').click()
  await page.keyboard.press('a')
  await page.waitForTimeout(300)
  expect(errors.filter((e) => !e.includes('404'))).toEqual([])
})

test('Stil dropdown switches all six themes on every main page without console errors', async ({ page }) => {
  const errors = watchConsole(page)
  const themes = ['signal', 'nacht', 'papier', 'bauhaus', 'fokus', 'magazin']
  for (const path of ['/', '/karten', '/einstufung', '/satz-check', '/wortschatz', '/fahrplan', '/lesen', '/lesen/t02', '/pruefung', '/pruefung/lesen/l3', '/immersion']) {
    await page.goto(path)
    for (const t of themes) {
      await page.getByTestId('theme-select').selectOption(t)
      await expect(page.locator('html')).toHaveAttribute('data-theme', t)
      // tokens resolve: the page background follows the theme
      const bg = await page.locator('.k-app').evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(bg).not.toBe('')
    }
  }
  // the choice survives a reload (localStorage + server setting)
  await page.getByTestId('theme-select').selectOption('papier')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'papier')
  await expect(page.getByTestId('theme-select')).toHaveValue('papier')
  // Karten still work in a dark theme
  await page.getByTestId('theme-select').selectOption('nacht')
  await page.goto('/karten')
  await expect(page.getByTestId('karte-satz')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(page.getByTestId('karte-back')).toBeVisible()
  expect(errors).toEqual([])
})

test('Satz-Check accepts an SRT + clip, pauses per cue and records ratings', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/satz-check')
  await expect(page.getByText('Datei wählen').first()).toBeAttached()
  await page.getByTestId('upload-media').setInputFiles(testClip())
  await expect(page.getByText('clip.webm')).toBeAttached()
  await page.getByTestId('upload-subs').setInputFiles({ name: 'test.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(SRT) })
  await page.getByTestId('upload-title').fill('E2E-Clip')
  await page.getByTestId('upload-submit').click()
  await expect(page.getByText('4 Sätze in diesen 3 Minuten')).toBeVisible()
  // The new clip is selected (radio + "✓ Ausgewählt"), step 2 has focus and a preview player.
  await expect(page.getByRole('radio', { name: /E2E-Clip/ })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('radio', { name: /E2E-Clip/ })).toContainText('✓ Ausgewählt')
  await expect(page.getByTestId('sc-start')).toBeFocused()
  await expect(page.getByTestId('sc-preview')).toBeVisible()
  await page.getByTestId('sc-start').click()

  await page.getByTestId('sc-play').click()
  await expect(page.getByTestId('sc-caption')).toHaveText('Guten Morgen, wie geht es dir?')
  // The clip pauses at the end of the first cue.
  await expect.poll(() => page.locator('video').evaluate((v: HTMLVideoElement) => v.paused), { timeout: 8000 }).toBe(true)
  const t = await page.locator('video').evaluate((v: HTMLVideoElement) => v.currentTime)
  expect(t).toBeGreaterThan(1.9)
  expect(t).toBeLessThan(2.6)

  for (const key of ['1', '2', '1', '3']) await page.keyboard.press(key)
  await expect(page.getByTestId('sc-coverage')).toHaveText('75 %')
  await page.getByTestId('sc-save').click()
  await expect(page.getByText('✓ Gespeichert')).toBeVisible()
  await expect(page.getByTestId('sc-verdict')).toContainText('Phase 2A')
  await expect(page.getByText('Bisherige Satz-Checks')).toBeVisible()
  // The "zu schwer" line is short and made of known words → listening speed, practise it in a loop.
  const tempo = page.getByTestId('tempo-lines').first()
  await expect(tempo).toContainText('Leider nicht, ich muss arbeiten.')
  const loopHref = await tempo.getByRole('link', { name: /in Schleife üben/ }).getAttribute('href')
  expect(loopHref).toMatch(/\/schauen\/\d+\?t=6\.5&loop=1$/)

  // Lines rated "mit Hilfe" / "zu schwer" can be mined as sentence cards.
  const mine = page.getByTestId('mine-lines')
  await expect(mine).toContainText('Sätze zum Minen · 2')
  await mine.getByText('Leider nicht, ich muss arbeiten.').click()
  await mine.locator('.at-word', { hasText: /^arbeiten$/ }).click()
  await mine.getByTestId('mine').click()
  await expect(mine).toContainText('Gemined — kommt als neue Karte.')
  await expect(mine).toContainText('Sätze zum Minen · 1')

  await page.goto(loopHref!)
  await expect(page.getByTestId('watch-loop')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('watch-line')).toContainText('Leider nicht, ich muss arbeiten.')
  expect(errors).toEqual([])
})

test('Schauen & minen: play → auto-pause → tap a word → mine → card with clip audio', async ({ page, request }) => {
  const errors = watchConsole(page)
  const up = await request.post('http://127.0.0.1:8001/api/media/upload', {
    multipart: {
      title: 'E2E-Krimi',
      subtitles: { name: 'k.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(SRT) },
      media: { name: 'k.webm', mimeType: 'video/webm', buffer: readFileSync(testClip()) }
    }
  })
  expect(up.ok()).toBeTruthy()
  const clip = await up.json()

  await page.goto('/schauen')
  await page.getByTestId(`watch-${clip.id}`).click()
  await expect(page).toHaveURL(new RegExp(`/schauen/${clip.id}$`))
  await page.getByTestId('watch-play').click()
  const line = page.getByTestId('watch-line')
  await expect(line).toContainText('Guten Morgen, wie geht es dir?')
  // Auto-pause at the end of the first line.
  await expect.poll(() => page.getByTestId('watch-video').evaluate((v: HTMLVideoElement) => v.paused), { timeout: 8000 }).toBe(true)

  // → next line, R replays it.
  await page.keyboard.press('ArrowRight')
  await expect(line).toContainText('Danke, mir geht es gut.')
  await page.keyboard.press('ArrowLeft')
  await expect(line).toContainText('Guten Morgen')

  // Tap a word → word panel → mine the whole line with its audio.
  await page.getByTestId('watch-video').evaluate((v: HTMLVideoElement) => v.pause())
  await line.locator('.at-word', { hasText: /^Morgen$/ }).click()
  await expect(page.getByTestId('word-panel')).toContainText('Guten Morgen, wie geht es dir?')
  await page.getByTestId('mine').click()
  await expect(page.getByTestId('word-panel')).toContainText('Gemined — kommt als neue Karte.')
  await expect(page.getByTestId('watch-mined')).toContainText('1 Satz gemined')

  // L = loop the line: playback keeps jumping back to its start instead of pausing.
  await page.keyboard.press('l')
  await expect(page.getByTestId('watch-loop')).toHaveAttribute('aria-pressed', 'true')
  await page.getByTestId('watch-replay').click()
  await page.waitForTimeout(3500)
  const looped = await page.getByTestId('watch-video').evaluate((v: HTMLVideoElement) => ({ t: v.currentTime, paused: v.paused }))
  expect(looped.paused).toBe(false)
  expect(looped.t).toBeLessThan(2.4)
  await page.getByTestId('watch-video').evaluate((v: HTMLVideoElement) => v.pause())

  const mined = await (await request.get('http://127.0.0.1:8001/api/mined')).json()
  const card = mined.find((c: { sentence: string }) => c.sentence === 'Guten Morgen, wie geht es dir?')
  expect(card.mediaId).toBe(clip.id)
  const audio = await request.get(`http://127.0.0.1:8001/api/cards/${card.id}/audio`)
  expect(audio.headers()['content-type']).toBe('audio/mp4')

  // Resume position is saved; mined cards come first in Karten (earlier tests may have mined others).
  await page.goto('/karten')
  await expect(page.getByTestId('karte')).toContainText('Gemined')
  const media = await (await request.get(`http://127.0.0.1:8001/api/media/${clip.id}`)).json()
  expect(media.position).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

test('#18 Schauen: auto-pause after a tight line shows and mines that line, not the next', async ({ page, request }) => {
  const errors = watchConsole(page)
  // Like Tatort: a 0.12 s gap after line 1, then lines back to back (gap 0).
  const TIGHT = `1\n00:00:00,500 --> 00:00:02,000\nWo waren Sie gestern Abend?\n\n2\n00:00:02,120 --> 00:00:03,500\nIch war die ganze Zeit zu Hause.\n\n3\n00:00:03,500 --> 00:00:05,000\nDas kann niemand bestätigen.\n`
  const up = await request.post('http://127.0.0.1:8001/api/media/upload', {
    multipart: {
      title: 'E2E-Verhör',
      subtitles: { name: 't.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(TIGHT) },
      media: { name: 't.webm', mimeType: 'video/webm', buffer: readFileSync(testClip()) }
    }
  })
  const clip = await up.json()
  await page.goto(`/schauen/${clip.id}`)
  const line = page.getByTestId('watch-line')
  const video = page.getByTestId('watch-video')
  const paused = () => video.evaluate((v: HTMLVideoElement) => v.paused)

  await page.getByTestId('watch-play').click()
  await expect.poll(paused, { timeout: 8000 }).toBe(true)
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(2.0)
  await page.waitForTimeout(400) // nothing switches while paused
  await expect(line).toContainText('Wo waren Sie gestern Abend?')
  await expect(line).not.toContainText('ganze Zeit')

  // Word panel and "Satz minen" act on the line just heard.
  await line.locator('.at-word', { hasText: /^gestern$/ }).click()
  await expect(page.getByTestId('word-panel')).toContainText('Wo waren Sie gestern Abend?')
  await page.getByTestId('mine').click()
  await expect(page.getByTestId('watch-mined')).toContainText('1 Satz gemined')
  const mined = await (await request.get('http://127.0.0.1:8001/api/mined')).json()
  const card = mined.find((c: { sentence: string }) => c.sentence === 'Wo waren Sie gestern Abend?')
  expect(card.mediaId).toBe(clip.id)

  // Play on: line 2, then a pause at its end although line 3 starts at the same moment.
  await page.getByTestId('watch-play').click()
  await expect(line).toContainText('Ich war die ganze Zeit zu Hause.')
  await expect.poll(paused, { timeout: 8000 }).toBe(true)
  await page.waitForTimeout(400)
  await expect(line).toContainText('Ich war die ganze Zeit zu Hause.')
  // → goes to the next line from the one on screen (line 3), not past it.
  await page.keyboard.press('ArrowRight')
  await expect(line).toContainText('Das kann niemand bestätigen.')
  await video.evaluate((v: HTMLVideoElement) => v.pause())
  expect(errors).toEqual([])
})

test('#19 mined cards: no unsure case badge, same line again → add the word, edit and delete in Karten', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/lesen/eigener-text')
  // Parser says Akkusativ for "die Herrlichkeit", its role says subject: no badge rather than a wrong one.
  await page.getByTestId('paste-text').fill('Denn dein ist das Reich und die Kraft und die Herrlichkeit.')
  await page.getByTestId('paste-run').click()
  await page.locator('.at-word', { hasText: /^Herrlichkeit$/ }).click()
  await expect(page.getByTestId('word-panel')).toContainText('Herrlichkeit')
  await expect(page.getByTestId('word-panel').locator('.k-case')).toHaveCount(0)
  await page.locator('.at-word', { hasText: /^Reich$/ }).click()
  await expect(page.getByTestId('word-panel').locator('.k-case')).toHaveText('N')

  const line = 'Wenn man überhetzt, versaust du dir nachher die Chance.'
  await page.goto('/lesen/eigener-text')
  await page.getByTestId('paste-text').fill(line)
  await page.getByTestId('paste-run').click()
  await page.locator('.at-word', { hasText: /^versaust$/ }).click()
  await page.getByTestId('mine').click()
  await expect(page.getByTestId('mine-result')).toContainText('Gemined — kommt als neue Karte.')
  await page.getByTestId('mine').click()
  await expect(page.getByTestId('mine-result')).toContainText('Satz schon gemint — das Wort ist schon auf der Karte.')
  await page.locator('.at-word', { hasText: /^Chance$/ }).click()
  await page.getByTestId('mine').click()
  await expect(page.getByTestId('mine-result')).toHaveText('Satz schon gemint.')
  await page.getByTestId('mine-add-word').click()
  await expect(page.getByTestId('mine-result')).toContainText('„Chance“ steht jetzt mit auf der Karte.')

  await page.goto('/karten')
  const row = page.getByTestId('mined-list').locator('li', { hasText: line })
  await expect(row.locator('strong')).toHaveCount(2) // versaust + Chance on one card
  await expect(row).toContainText('Chance')
  await row.getByRole('button', { name: 'Bearbeiten' }).click()
  await page.getByTestId('edit-gloss').fill('to mess up, to ruin')
  await page.getByTestId('edit-case').selectOption('')
  await page.getByTestId('edit-save').click()
  await expect(row).toContainText('to mess up, to ruin')

  // The card on screen: a mined card can be edited right there.
  await page.getByTestId('karte-reveal').click()
  if ((await page.getByTestId('karte').textContent())?.includes('Gemined')) {
    await page.getByTestId('karte-edit').click()
    await expect(page.getByTestId('mined-editor')).toBeVisible()
    await expect(page.getByTestId('edit-lemma')).toBeFocused()
    await page.keyboard.press('Escape')
    await page.locator('body').click({ position: { x: 5, y: 5 } })
    await page.keyboard.press('1') // keys never rate a card while it's being edited
    await expect(page.getByTestId('mined-editor')).toBeVisible()
    await page.getByTestId('mined-editor').getByRole('button', { name: 'Abbrechen' }).click()
    await expect(page.getByTestId('karte-back')).toBeVisible()
  }

  await row.getByRole('button', { name: 'Bearbeiten' }).click()
  await page.getByTestId('edit-delete').click()
  await page.getByTestId('edit-delete-yes').click()
  await expect(page.getByTestId('mined-list').locator('li', { hasText: line })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('Week 5: the AI-key to-do shows on Heute and can be ticked off', async ({ page, request }) => {
  const errors = watchConsole(page)
  const plan = await (await request.get('http://127.0.0.1:8001/api/plan')).json()
  // Pretend it's week 5 for the first load only; after ticking, the real /api/today has no to-dos.
  await page.route('**/api/today', async (route) => {
    const res = await route.fetch()
    await route.fulfill({ response: res, json: { ...(await res.json()), week: 5, todos: plan.week5.todos } })
    await page.unroute('**/api/today')
  })
  await page.goto('/')
  const card = page.getByTestId('todo-ai-key')
  await expect(card).toContainText('KI-Schlüssel einrichten')
  await expect(card).toContainText('ANTHROPIC_API_KEY')
  await page.getByTestId('todo-done-ai-key').click()
  await expect(card).toHaveCount(0)
  await page.goto('/fahrplan')
  await expect(page.getByTestId('fp-upcoming')).toContainText('✓ KI-Schlüssel einrichten')
  await expect(page.getByTestId('fp-upcoming')).toContainText('Erste Probeprüfung')
  expect(errors).toEqual([])
})

test('Reader: quotes, punctuation and case letters never wrap away from their word', async ({ page }) => {
  for (const width of [360, 600, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/lesen/t01')
    await expect(page.locator('.at-group').first()).toBeVisible()
    const broken = await page.locator('.at-group').evaluateAll((els) =>
      els.filter((e) => e.getClientRects().length > 1).map((e) => e.textContent))
    expect(broken, `width ${width}`).toEqual([])
    // „ is always glued to the following word
    const lonely = await page.locator('.at-group').evaluateAll((els) =>
      els.map((e) => e.textContent ?? '').filter((t) => /^[„‚(«]$/.test(t.trim())))
    expect(lonely).toEqual([])
  }
})

test('Aus der Mediathek holen: progress, then the new clip is selected (API faked, no network)', async ({ page, request }) => {
  const errors = watchConsole(page)
  const up = await request.post('http://127.0.0.1:8001/api/media/upload', {
    multipart: { title: 'Tatort: Demo', subtitles: { name: 'd.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(SRT) } }
  })
  const clip = await up.json()
  let polls = 0
  await page.route('**/api/media/mediathek', (r) => r.fulfill({ status: 202, json: { jobId: 'j1' } }))
  await page.route('**/api/media/jobs/j1', (r) => {
    polls++
    const MB = 1024 * 1024
    return r.fulfill({
      json: polls < 3
        ? { status: 'running', phase: 'download', progress: 0.4, downloaded: 58 * MB, total: 145 * MB, speed: 8 * MB }
        : { status: 'done', phase: 'done', progress: 1, mediaId: clip.id }
    })
  })
  await page.goto('/satz-check')
  await page.getByText('Aus der Mediathek holen').click()
  await page.getByTestId('mediathek-url').fill('https://www.ardmediathek.de/video/tatort/demo')
  await page.getByTestId('mediathek-fetch').click()
  await expect(page.getByTestId('mediathek-progress')).toContainText('58 von 145 MB · 8 MB/s')
  await expect(page.getByRole('radio', { name: /Tatort: Demo/ })).toHaveAttribute('aria-checked', 'true', { timeout: 8000 })
  await expect(page.getByTestId('mediathek-progress')).toContainText('Fertig.')
  expect(errors).toEqual([])
})

test('YouTube: Mac one-liner and cookies.txt upload', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/satz-check')
  await page.getByText('Von YouTube holen').click()
  await expect(page.getByTestId('yt-mac-command')).toContainText('--convert-subs srt')
  const cookies = '# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t1893456000\tSID\tx\n'
  await page.getByTestId('yt-cookies').setInputFiles({ name: 'cookies.txt', mimeType: 'text/plain', buffer: Buffer.from(cookies) })
  await page.getByTestId('yt-cookies-upload').click()
  await expect(page.getByTestId('yt-cookies-on')).toContainText('Cookies hinterlegt')
  await page.getByTestId('yt-cookies-on').getByRole('button', { name: 'entfernen' }).click()
  await expect(page.getByTestId('yt-cookies-on')).toHaveCount(0)
  expect(errors).toEqual([])
})


/** Material für heute und morgen as of `iso` in the 2B plan (the API's ?today=&phase= preview). */
test('#20 every Starten on Heute opens its exact item, Mon–Fri of week 1', async ({ page, request }) => {
  const errors = watchConsole(page)
  // The plan's week-1 clips in the library (a test clip each, registered under its catalog key).
  const keys = ['tatort-schweigen', 'egp-698', 'egp-700', 'soko-leipzig-das-auge', 'radio-tatort-uebertherapie']
  const media = async () => (await (await request.get('http://127.0.0.1:8001/api/media')).json()) as { id: number, key: string | null }[]
  for (const key of keys) {
    if ((await media()).some((m) => m.key === key)) continue
    const up = await request.post('http://127.0.0.1:8001/api/media/upload', {
      multipart: {
        title: `E2E ${key}`,
        subtitles: { name: 'k.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(SRT) },
        media: { name: 'k.webm', mimeType: 'video/webm', buffer: readFileSync(testClip()) }
      }
    })
    const clip = await up.json()
    execFileSync('python3', ['-c', 'import sqlite3,sys; c=sqlite3.connect(sys.argv[1]); c.execute("UPDATE media SET key=? WHERE id=?", (sys.argv[2], int(sys.argv[3]))); c.commit()',
      join(DATA_DIR, 'kaskade.db'), key, String(clip.id)])
  }
  const id = Object.fromEntries((await media()).filter((m) => m.key).map((m) => [m.key, m.id]))
  const watch = (key: string) => new RegExp(`/schauen/${id[key]}\\?von=\\d+&bis=\\d+$`)

  // block → where "Starten" goes; null = stays on Heute (the news links are listed under the block)
  const days: [string, Record<string, RegExp | null>][] = [
    ['2026-10-12', { karten: /\/karten$/, input: watch('tatort-schweigen'), lesen: watch('egp-698'), pruefung: /\/aufgabe\/s01$/ }],
    ['2026-10-13', { karten: /\/karten$/, input: watch('tatort-schweigen'), lesen: null, pruefung: /\/aufgabe\/p01$/ }],
    ['2026-10-14', { karten: /\/karten$/, input: watch('tatort-schweigen'), lesen: /\/schauen\/\d+\?von=\d+&bis=\d+$/, pruefung: /\/aufgabe\/s02$/ }],
    ['2026-10-15', { karten: /\/karten$/, input: /\/schauen\/\d+\?von=\d+&bis=\d+$/, lesen: /\/schauen\/\d+\?von=\d+&bis=\d+$/, pruefung: /\/aufgabe\/p02$/ }],
    ['2026-10-16', { karten: /\/karten$/, input: /\/schauen\/\d+\?von=\d+&bis=\d+$/, lesen: /\/schauen\/\d+\?von=\d+&bis=\d+$/, pruefung: /\/pruefung\/lesen\/l1$/ }]
  ]
  const undone = new Set<string>()
  for (const [iso, blocks] of days) {
    await page.unroute('**/api/today')
    await page.route('**/api/today', (route) => route.continue({ url: `${new URL(route.request().url()).origin}/api/today?today=${iso}&phase=2B` }))
    // what the server computed for that day (#21: clip ranges roll from his position)
    const assigned = (await (await request.get(`http://127.0.0.1:8001/api/today?today=${iso}&phase=2B`)).json()).assignments
    for (const [block, to] of Object.entries(blocks)) {
      await page.goto('/')
      if (assigned[block].part) await expect(page.getByTestId(`assign-${block}`), `${iso} ${block}`).toContainText(assigned[block].part)
      await expect(page.getByTestId(`done-${block}`)).toBeVisible()
      // earlier tests may have ticked a block off or left its timer running: undo that first
      if ((await page.getByTestId(`done-${block}`).textContent())?.includes('Erledigt')) {
        undone.add(block)
        await page.getByTestId(`done-${block}`).click()
      }
      if (await page.getByTestId(`stop-${block}`).isVisible()) await page.getByTestId(`stop-${block}`).click()
      await page.getByTestId(`start-${block}`).click()
      if (to) {
        await expect(page, `${iso} ${block}`).toHaveURL(to)
        expect(page.url(), `${iso} ${block}`).toContain(assigned[block].start.to)  // exactly the line's item
      }
      else {
        await expect(page.getByTestId(`stop-${block}`)).toBeVisible()
        await expect(page, `${iso} ${block}`).toHaveURL(/\/$/)
      }
    }
  }
  await request.post('http://127.0.0.1:8001/api/activity/stop')
  for (const block of undone) await request.post('http://127.0.0.1:8001/api/plan/done', { data: { block, done: true } })
  await page.unroute('**/api/today')
  expect(errors).toEqual([])
})

test('#21 the clip range on Heute starts at his saved position, and Starten opens exactly that', async ({ page, request }) => {
  const errors = watchConsole(page)
  const media = (await (await request.get('http://127.0.0.1:8001/api/media')).json()) as { id: number, key: string | null }[]
  const tatort = media.find((m) => m.key === 'tatort-schweigen')!  // registered by the #20 test above
  const before = (await (await request.get(`http://127.0.0.1:8001/api/media/${tatort.id}`)).json()).position ?? 0
  // He is at 66:40: Wednesday's part is the rest of the film, not the plan's 60:40–89:21
  await request.put(`http://127.0.0.1:8001/api/media/${tatort.id}/progress`, { data: { position: 4000 } })
  await page.route('**/api/today', (route) => route.continue({ url: `${new URL(route.request().url()).origin}/api/today?today=2026-10-14&phase=2B` }))
  await page.goto('/')
  await expect(page.getByTestId('assign-input')).toContainText('Tatort: Schweigen · 66:40–89:21 · 23 min')
  await expect(page.getByTestId('block-input')).toContainText('Tatort: Schweigen, 66:40–89:21 (Ende).')
  await page.getByTestId('start-input').click()
  await expect(page).toHaveURL(new RegExp(`/schauen/${tatort.id}\\?von=4000&bis=5361$`))
  await expect(page.getByTestId('watch-range')).toContainText('66:40')
  await page.unroute('**/api/today')
  await page.goto('about:blank') // Schauen saves its position on leaving — leave first, then restore
  await request.post('http://127.0.0.1:8001/api/activity/stop')
  await request.put(`http://127.0.0.1:8001/api/media/${tatort.id}/progress`, { data: { position: before } })
  expect(errors).toEqual([])
})

test('#20 a tab from before a deploy: Starten on the Prüfungsteil still opens the task', async ({ page }) => {
  // The tab's Aufgabe chunk is gone after a rebuild: the server answers with index.html (as vite preview does).
  let served = 0
  await page.route(/\/assets\/AufgabeView-[^/]+\.js$/, (route) => {
    if (served++ === 0) return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' })
    return route.continue()
  })
  await page.route('**/api/today', (route) => route.continue({ url: `${new URL(route.request().url()).origin}/api/today?today=2026-10-12&phase=2B` }))
  await page.goto('/')
  await page.getByTestId('start-pruefung').click()
  await expect(page).toHaveURL(/\/aufgabe\/s01$/)
  await expect(page.locator('h1')).toBeVisible()
  expect(served).toBe(2) // failed once, then loaded fresh
  await page.unroute('**/api/today')
  await page.request.post('http://127.0.0.1:8001/api/activity/stop')
})

async function materialsAt(page: Page, iso: string) {
  await page.route('**/api/materials', (route) => route.continue({ url: `${new URL(route.request().url()).origin}/api/materials?today=${iso}&phase=2B` }))
}

async function tatortClip(request) {
  // A 9-second test clip whose subtitles run to 89:20 — library length of the real Tatort.
  const srt = SRT + `\n5\n01:29:19,000 --> 01:29:20,000\nEnde.\n`
  const res = await request.post('/api/media/upload', {
    multipart: {
      subtitles: { name: 'tatort.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(srt) },
      media: { name: 'tatort.webm', mimeType: 'video/webm', buffer: readFileSync(testClip()) },
      title: 'Tatort: Schweigen (E2E-Testclip)'
    }
  })
  expect(res.ok()).toBeTruthy()
  return res.json()
}

test('Material für heute und morgen: Sunday shows Monday with the Tatort ready', async ({ page, request }) => {
  const errors = watchConsole(page)
  await tatortClip(request)
  await materialsAt(page, '2026-10-11')
  await page.goto('/')
  const card = page.getByTestId('materials')
  await expect(card.getByText('Heute (So 11.10.)')).toBeVisible()
  await expect(page.getByTestId('mat-today')).toContainText('Kein Lernblock.')
  await expect(card.getByText('Morgen (Mo 12.10.)')).toBeVisible()
  const tatort = page.getByTestId('mat-tomorrow-input')
  await expect(tatort).toContainText(/Tatort: Schweigen · \d+:\d\d–\d+:\d\d · \d+ min/) // #21: the range rolls from his position
  await expect(tatort).toContainText('✓ bereit')
  await expect(tatort).toContainText('Quelle: ARD Mediathek · NDR')
  await expect(page.getByTestId('mat-tomorrow-pruefung')).toContainText('nur Selbstcheck, keine KI-Bewertung')
  await expect(page.getByTestId('mat-tomorrow-pruefung')).toContainText('KI-geschrieben')
  // Bald fällig: the week-2 book, due date first; Material itself has no purchase cards
  const due = page.getByTestId('due-schirach-verbrechen')
  await expect(due).toContainText('Fällig Mo 12.10. · morgen')
  await expect(due).toContainText('Ferdinand von Schirach: Verbrechen kaufen')
  await expect(due).toContainText('ab 19.10. im Plan, Woche 2')
  await expect(due).toContainText('E-Book reicht bis Sa 17.10.')
  await expect(page.getByTestId('due-language-reactor')).toContainText('Fällig Mo 19.10. · in 8 Tagen')
  await expect(page.getByTestId('materials')).not.toContainText('kaufen')
  await expect(page.getByText('Känguru')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('Material: Monday shows today and Tuesday with the Sprechen microphone line', async ({ page }) => {
  await materialsAt(page, '2026-10-12')
  await page.goto('/')
  await expect(page.getByTestId('materials').getByText('Heute (Mo 12.10.)')).toBeVisible()
  await expect(page.getByTestId('materials').getByText('Morgen (Di 13.10.)')).toBeVisible()
  const mic = page.getByTestId('mat-tomorrow-pruefung')
  await expect(mic).toContainText('Mikrofon / Headset')
  // 127.0.0.1 counts as a secure context: the microphone works here
  await expect(mic).toContainText('✓ bereit')
  await expect(page.getByTestId('mat-tomorrow-input')).toContainText(/Tatort: Schweigen · \d+:\d\d–\d+:\d\d/)
  await expect(page.getByTestId('mat-tomorrow-lesen')).toContainText('Die drei Links stehen am Morgen hier')
})

test('Material over plain http: Sprechen points to the HTTPS address', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'isSecureContext', { get: () => false }))
  await materialsAt(page, '2026-10-12')
  await page.goto('/')
  const mic = page.getByTestId('mat-tomorrow-pruefung')
  await expect(mic).toContainText('Aufnahmen gehen nur über https://cos.tail1b5741.ts.net:8443')
  await expect(mic).toContainText('→ zu tun')
  await expect(mic.getByRole('link', { name: 'Über HTTPS öffnen →' })).toHaveAttribute('href', 'https://cos.tail1b5741.ts.net:8443')
})

test('Material on Friday: the next plan day is Monday', async ({ page }) => {
  await materialsAt(page, '2026-10-16')
  await page.goto('/')
  await expect(page.getByTestId('materials').getByText('Nächster Lerntag: Mo 19.10.')).toBeVisible()
  // #21: week 1's Tatort isn't watched here → Monday continues with it, nothing is skipped
  await expect(page.getByTestId('mat-next-input')).toContainText('Tatort: Schweigen')
  await expect(page.getByTestId('mat-next-lesen')).toContainText('Ferdinand von Schirach: Verbrechen')
  await expect(page.getByTestId('mat-next-lesen')).toContainText('„Fähner“ und „Tanatas Teeschale“')
  // not bought by Monday: overdue, marked — tick it off as bought
  const due = page.getByTestId('due-schirach-verbrechen')
  await expect(due).toContainText('Überfällig seit Mo 12.10.')
  await expect(due).toContainText('ISBN 978-3-442-77066-3')
  await page.getByTestId('due-done-schirach-verbrechen').click()
  await expect(page.getByTestId('due-schirach-verbrechen')).toHaveCount(0)
})

test('Schauen with a plan range: starts there and says "Ziel für heute erreicht" at the end', async ({ page, request }) => {
  const errors = watchConsole(page)
  const clip = await tatortClip(request)
  await page.goto(`/schauen/${clip.id}?von=2&bis=4`)
  await expect(page.getByTestId('watch-range')).toContainText('Heute: 0:02–0:04.')
  await expect(page.getByTestId('watch-clock')).toContainText('Ziel 0:04')
  await page.getByTestId('watch-autopause').uncheck()
  await page.getByTestId('watch-play').click()
  await expect(page.getByTestId('watch-goal')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('watch-goal')).toContainText('Ziel für heute erreicht ✓')
  expect(errors).toEqual([])
})

test('Deine Clips: the genre is editable', async ({ page, request }) => {
  const clip = await tatortClip(request)
  await page.goto('/schauen')
  const select = page.getByTestId(`tag-${clip.id}`)
  await expect(select).toHaveValue('krimi') // guessed from the title
  await select.selectOption('drama')
  await page.reload()
  await expect(page.getByTestId(`tag-${clip.id}`)).toHaveValue('drama')
})
