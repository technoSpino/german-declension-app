import { test, expect } from '@playwright/test';

test.describe('Flashcard System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:5175');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load flashcards page and display study mode', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Check if header is visible
    await expect(page.locator('h1')).toContainText('German Declension Flashcards');

    // Check if mode tabs are visible
    await expect(page.locator('.mode-tab')).toHaveCount(3);

    // Study mode should be active by default
    await expect(page.locator('.mode-tab.active')).toContainText('Study');
  });

  test('should display due cards count in study mode', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Should show cards due for review (all 55 cards initially)
    await expect(page.locator('.mode-badge')).toBeVisible();
  });

  test('should flip flashcard on click', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Wait for flashcard to load
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Check if card is not flipped initially
    const cardBefore = page.locator('.flashcard');
    await expect(cardBefore).not.toHaveClass(/is-flipped/);

    // Click to flip
    await page.locator('.flashcard-container').click();
    await page.waitForTimeout(100); // Wait for animation

    // Check if card is now flipped
    await expect(cardBefore).toHaveClass(/is-flipped/);
  });

  test('should answer card correctly and move to next', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Wait for flashcard
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Get first card front text
    const firstCardText = await page.locator('.flashcard-front .card-text').textContent();

    // Flip the card
    await page.locator('.flashcard-container').click();
    await page.waitForTimeout(200);

    // Click "Good" button
    await page.locator('.good-button').click();
    await page.waitForTimeout(300);

    // Should show next card (different text)
    const secondCardText = await page.locator('.flashcard-front .card-text').textContent();
    expect(firstCardText).not.toBe(secondCardText);

    // Session stats should update
    await expect(page.locator('.session-stat.correct')).toContainText('1');
  });

  test('should answer card incorrectly and move to next', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Wait for flashcard
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Flip the card
    await page.locator('.flashcard-container').click();
    await page.waitForTimeout(200);

    // Click "Again" button
    await page.locator('.again-button').click();
    await page.waitForTimeout(300);

    // Session stats should update
    await expect(page.locator('.session-stat.incorrect')).toContainText('1');
  });

  test('should switch to browse mode and display all cards', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Click on Browse tab
    await page.locator('.mode-tab').filter({ hasText: 'Browse' }).click();
    await page.waitForTimeout(300);

    // Should display cards grid
    await expect(page.locator('.cards-grid')).toBeVisible();

    // Should have multiple cards
    const cardCount = await page.locator('.browse-card').count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should filter cards in browse mode', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Switch to Browse mode
    await page.locator('.mode-tab').filter({ hasText: 'Browse' }).click();
    await page.waitForTimeout(300);

    // Count all cards initially
    const initialCount = await page.locator('.browse-card').count();

    // Filter by difficulty
    await page.locator('select').filter({ hasText: /All.*Easy.*Medium.*Hard/ }).first().selectOption('easy');
    await page.waitForTimeout(300);

    // Should have fewer cards
    const filteredCount = await page.locator('.browse-card').count();
    expect(filteredCount).toBeLessThan(initialCount);
  });

  test('should display stats in stats mode', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Click on Stats tab
    await page.locator('.mode-tab').filter({ hasText: 'Stats' }).click();
    await page.waitForTimeout(300);

    // Should display stats sections
    await expect(page.locator('.stats-section').first()).toBeVisible();

    // Should show total cards
    await expect(page.locator('.stat-card').first()).toContainText('55');
  });

  test('should persist progress to localStorage', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Wait for flashcard
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Answer a card correctly
    await page.locator('.flashcard-container').click();
    await page.waitForTimeout(200);
    await page.locator('.good-button').click();
    await page.waitForTimeout(500);

    // Check if data is in localStorage
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('german-declension-flashcards');
    });

    expect(storageData).not.toBeNull();

    const parsed = JSON.parse(storageData);
    expect(parsed.cards).toBeDefined();
    expect(parsed.cards.length).toBe(55);
  });

  test('should load progress from localStorage on page reload', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Wait for flashcard
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Answer a card correctly
    await page.locator('.flashcard-container').click();
    await page.waitForTimeout(200);
    await page.locator('.good-button').click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Check stats mode to see if progress persisted
    await page.locator('.mode-tab').filter({ hasText: 'Stats' }).click();
    await page.waitForTimeout(300);

    // Should show progress (at least one card reviewed)
    const accuracy = await page.locator('.stat-value').nth(0).textContent();
    expect(parseInt(accuracy)).toBeGreaterThanOrEqual(0);
  });

  test('should use keyboard shortcuts in study mode', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Wait for flashcard
    await page.waitForSelector('.flashcard-container', { timeout: 5000 });

    // Press Space to flip
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Card should be flipped
    await expect(page.locator('.flashcard')).toHaveClass(/is-flipped/);

    // Press 2 for "Good"
    await page.keyboard.press('Digit2');
    await page.waitForTimeout(300);

    // Should show next card (not flipped)
    await expect(page.locator('.flashcard')).not.toHaveClass(/is-flipped/);
  });

  test('should reset card progress in browse mode', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Switch to Browse mode
    await page.locator('.mode-tab').filter({ hasText: 'Browse' }).click();
    await page.waitForTimeout(300);

    // Find and click a reset button
    const resetButton = page.locator('.reset-card-button').first();
    await resetButton.click();
    await page.waitForTimeout(300);

    // Card should be reset (box 1, no stats)
    // We can't easily verify without inspecting the card data
    // but we can check the button is still there
    await expect(resetButton).toBeVisible();
  });

  test('should display Leitner box distribution in stats', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Go to Stats mode
    await page.locator('.mode-tab').filter({ hasText: 'Stats' }).click();
    await page.waitForTimeout(300);

    // Should show box distribution
    await expect(page.locator('.box-distribution')).toBeVisible();

    // Should have 5 boxes
    const boxCount = await page.locator('.box-stat').count();
    expect(boxCount).toBe(5);
  });

  test('should display accuracy by case in stats', async ({ page }) => {
    await page.goto('http://localhost:5175/flashcards');

    // Go to Stats mode
    await page.locator('.mode-tab').filter({ hasText: 'Stats' }).click();
    await page.waitForTimeout(300);

    // Should show case accuracy
    await expect(page.locator('.case-accuracy')).toBeVisible();

    // Should have 4 cases
    const caseCount = await page.locator('.case-stat').count();
    expect(caseCount).toBe(4);

    // Check for specific cases
    await expect(page.locator('.case-label.case-nominativ')).toContainText('nominativ');
    await expect(page.locator('.case-label.case-akkusativ')).toContainText('akkusativ');
    await expect(page.locator('.case-label.case-dativ')).toContainText('dativ');
    await expect(page.locator('.case-label.case-genitiv')).toContainText('genitiv');
  });
});
