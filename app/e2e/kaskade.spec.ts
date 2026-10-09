import { expect, test, type Page } from '@playwright/test'

// Smoke tests against the running Kaskade services. Each test collects console
// errors and fails if any appear.
function watchConsole(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  return errors
}

test('Heute loads', async ({ page }) => {
  const errors = watchConsole(page)
  await page.goto('/')
  await expect(page.getByTestId('heute')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible()
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
