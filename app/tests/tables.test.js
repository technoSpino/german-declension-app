import { test, expect } from '@playwright/test';

test.describe('German Declension Tables Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/tables');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.getByText('German Declension Tables')).toBeVisible();
    await expect(page.getByText('Color-coded reference for A2 learners')).toBeVisible();
  });

  test('should display all 5 table options', async ({ page }) => {
    await expect(page.getByText('Definite Article (der/die/das)')).toBeVisible();
    await expect(page.getByText('Indefinite Article (ein/eine)')).toBeVisible();
    await expect(page.getByText('Adjective - Weak Declension')).toBeVisible();
    await expect(page.getByText('Adjective - Strong Declension')).toBeVisible();
    await expect(page.getByText('Adjective - Mixed Declension')).toBeVisible();
  });

  test('should have definite article selected by default', async ({ page }) => {
    const radio = page.locator('input[type="radio"][value="definiteArticle"]');
    await expect(radio).toBeChecked();
  });

  test('should display table headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Case' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'M' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'F' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'N' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Pl' })).toBeVisible();
  });

  test('should display all four cases in table', async ({ page }) => {
    await expect(page.getByText('Nom', { exact: true })).toBeVisible();
    await expect(page.getByText('Akk', { exact: true })).toBeVisible();
    await expect(page.getByText('Dat', { exact: true })).toBeVisible();
    await expect(page.getByText('Gen', { exact: true })).toBeVisible();
  });

  test('should display correct forms for definite article', async ({ page }) => {
    // Check some key cells
    const cells = page.locator('td.table-cell');
    await expect(cells).toContainText(['der', 'die', 'das', 'den', 'dem', 'des']);
  });

  test('should switch tables when radio button is clicked', async ({ page }) => {
    // Click indefinite article radio
    await page.locator('input[type="radio"][value="indefiniteArticle"]').click();

    // Wait for transition
    await page.waitForTimeout(300);

    // Check that indefinite article table is displayed
    await expect(page.getByText('Indefinite Article (ein/eine)')).toBeVisible();
    await expect(page.locator('td.table-cell')).toContainText(['ein', 'eine', 'einen']);
  });

  test('should open modal when cell is clicked', async ({ page }) => {
    // Click on a table cell
    const cell = page.locator('td.table-cell').first();
    await cell.click();

    // Wait for modal to appear
    await page.waitForTimeout(300);

    // Check modal is visible
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();
  });

  test('should display examples in modal', async ({ page }) => {
    // Click on the "der" cell (Nominativ Masculine)
    const derCell = page.locator('td.table-cell').filter({ hasText: 'der' }).first();
    await derCell.click();

    // Wait for modal
    await page.waitForTimeout(300);

    // Check for examples
    await expect(page.getByText('Examples:')).toBeVisible();
    await expect(page.locator('.modal-content')).toContainText('Der Mann');
  });

  test('should close modal with X button', async ({ page }) => {
    // Open modal
    const cell = page.locator('td.table-cell').first();
    await cell.click();
    await page.waitForTimeout(300);

    // Click close button
    await page.locator('button[aria-label="Close modal"]').click();
    await page.waitForTimeout(300);

    // Modal should be gone
    const modal = page.locator('.modal-overlay');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal with Close button', async ({ page }) => {
    // Open modal
    const cell = page.locator('td.table-cell').first();
    await cell.click();
    await page.waitForTimeout(300);

    // Click Close button
    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForTimeout(300);

    // Modal should be gone
    const modal = page.locator('.modal-overlay');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal with ESC key', async ({ page }) => {
    // Open modal
    const cell = page.locator('td.table-cell').first();
    await cell.click();
    await page.waitForTimeout(300);

    // Press ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Modal should be gone
    const modal = page.locator('.modal-overlay');
    await expect(modal).not.toBeVisible();
  });

  test('should display color legend', async ({ page }) => {
    await expect(page.getByText('Case Colors:')).toBeVisible();
    await expect(page.getByText('Nominativ')).toBeVisible();
    await expect(page.getByText('Akkusativ')).toBeVisible();
    await expect(page.getByText('Dativ')).toBeVisible();
    await expect(page.getByText('Genitiv')).toBeVisible();
  });

  test('should have colored cells', async ({ page }) => {
    // Check that cells have case-specific classes
    const nomCell = page.locator('td.cell-nom').first();
    await expect(nomCell).toBeVisible();

    const akkCell = page.locator('td.cell-akk').first();
    await expect(akkCell).toBeVisible();

    const datCell = page.locator('td.cell-dat').first();
    await expect(datCell).toBeVisible();

    const genCell = page.locator('td.cell-gen').first();
    await expect(genCell).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that table is still visible and scrollable
    await expect(page.getByText('German Declension Tables')).toBeVisible();

    // Check table container has overflow-x-auto
    const tableContainer = page.locator('.overflow-x-auto');
    await expect(tableContainer).toBeVisible();
  });

  test('should switch between all 5 tables', async ({ page }) => {
    const tables = [
      'definiteArticle',
      'indefiniteArticle',
      'adjectiveWeak',
      'adjectiveStrong',
      'adjectiveMixed'
    ];

    for (const tableId of tables) {
      await page.locator(`input[type="radio"][value="${tableId}"]`).click();
      await page.waitForTimeout(300);

      // Check that a table is visible
      const tableElement = page.locator('table');
      await expect(tableElement).toBeVisible();
    }
  });

  test('should show correct case and gender in modal', async ({ page }) => {
    // Click on "den" cell (Akkusativ Masculine)
    const denCell = page.locator('td.table-cell').filter({ hasText: /^den$/ }).first();
    await denCell.click();
    await page.waitForTimeout(300);

    // Check modal shows correct case and gender
    await expect(page.locator('.modal-content')).toContainText('Akkusativ');
    await expect(page.locator('.modal-content')).toContainText('Masculine');
  });
});
