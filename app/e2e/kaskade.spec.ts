import { expect, test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const TMP = join(process.cwd(), '.e2e-data', 'fixtures')

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
  await page.goto('/')
  await expect(page.getByTestId('heute')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible()
  // Server clock: Tuesday, week 1 → speaking task p01
  await expect(page.getByText('Woche 1 · Wohnen und Nachbarn')).toBeVisible()
  await expect(page.getByTestId('block-pruefung')).toContainText('Ein Hoffest für das Haus')

  await page.getByTestId('start-lesen').click()
  await expect(page.getByTestId('header-timer')).toContainText('Freies Lesen')
  await page.getByTestId('stop-lesen').click()
  await expect(page.getByTestId('header-timer')).toHaveCount(0)

  await page.getByTestId('done-input').click()
  await expect(page.getByTestId('done-input')).toContainText('Erledigt')
  expect(errors).toEqual([])
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

test('Fahrplan shows forecast, phases and checks', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/fahrplan')
  await expect(page.getByText('Prognose B2')).toBeVisible()
  await expect(page.getByText('Stunden bis B2')).toBeVisible()
  await expect(page.getByTestId('phase-2')).toContainText('Jetzt')
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
  for (const path of ['/', '/karten', '/einstufung', '/satz-check', '/wortschatz', '/fahrplan']) {
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
  await page.getByTestId('upload-media').setInputFiles(testClip())
  await page.getByTestId('upload-subs').setInputFiles({ name: 'test.srt', mimeType: 'application/x-subrip', buffer: Buffer.from(SRT) })
  await page.getByTestId('upload-title').fill('E2E-Clip')
  await page.getByTestId('upload-submit').click()
  await expect(page.getByText('4 Sätze in diesen 3 Minuten')).toBeVisible()
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
  expect(errors).toEqual([])
})
