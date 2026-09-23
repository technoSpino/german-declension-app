import { test, expect } from '@playwright/test';

test.describe('German Declension Tables Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tables');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('German Declension with Adjectives');
    await expect(page.getByText('shows articles and adjective endings')).toBeVisible();
  });

  test('should display table headers in M / N / F / Pl order', async ({ page }) => {
    await expect(page.locator('thead th')).toHaveText(['Case', 'M', 'N', 'F', 'Pl']);
  });

  test('should display all four cases in table', async ({ page }) => {
    for (const label of ['Nom', 'Akk', 'Dat', 'Gen']) {
      await expect(page.getByRole('cell', { name: label, exact: true })).toBeVisible();
    }
  });

  test('should show definite and indefinite forms in each cell', async ({ page }) => {
    const cells = page.locator('td.table-cell');
    await expect(cells).toHaveCount(16);
    // Nominativ masculine: der nette Mann / ein netter Mann
    await expect(cells.first()).toContainText('der');
    await expect(cells.first()).toContainText('ein');
    // Genitiv masculine ends the table's first column
    await expect(page.locator('tr').last().locator('td.table-cell').first()).toContainText('des');
  });

  test('should have colored cells for every case', async ({ page }) => {
    for (const cls of ['cell-nom', 'cell-akk', 'cell-dat', 'cell-gen']) {
      await expect(page.locator(`td.${cls}`)).toHaveCount(4);
    }
  });

  test('should highlight adjective endings', async ({ page }) => {
    await expect(page.locator('.ending-e').first()).toBeVisible();
    await expect(page.locator('.ending-en').first()).toBeVisible();
    await expect(page.locator('.ending-er').first()).toBeVisible();
    await expect(page.locator('.ending-es').first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The wide table scrolls inside its own container, not the page.
    await expect(page.locator('.overflow-x-auto', { has: page.locator('table') })).toBeVisible();
    const pageScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageScrollWidth).toBeLessThanOrEqual(375);
  });

  test('should have no console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.reload();
    await expect(page.locator('table')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
