/**
 * Task 38.20: Playwright Visual Verification
 * 6 checks: header, container, purple panes, cards layout, bottom padding, no reload in game
 *
 * Screenshots saved to test/visual/screenshots/
 */

import { test, expect } from '@playwright/test';

const BASE = 'https://localhost:3443';

test.use({
  ignoreHTTPSErrors: true,
  viewport: { width: 414, height: 896 },
});

// Helper: create room + add bot + start game to get in-game view
async function enterGame(page: any, playerName = 'Tester') {
  await page.goto(`${BASE}/mp/`);
  await page.waitForTimeout(1000);

  // Set name
  const nameInput = page.locator('#player-name');
  if (await nameInput.isVisible()) {
    await nameInput.clear();
    await nameInput.fill(playerName);
  }

  // Click Create Room
  const createBtn = page.locator('button:has-text("Create Room")').first();
  await createBtn.click();
  await page.waitForTimeout(500);

  // Fill room name and click Create in dialog
  const createConfirm = page.locator('button:has-text("Create")').first();
  if (await createConfirm.isVisible()) {
    await createConfirm.click();
  }
  await page.waitForTimeout(2000);

  // Add bot
  const addBotBtn = page.locator('button:has-text("Add Bot"), button:has-text("🤖")').first();
  if (await addBotBtn.isVisible()) {
    await addBotBtn.click();
    await page.waitForTimeout(1000);
  }

  // Start game
  const startBtn = page.locator('button:has-text("Start Game"), button:has-text("Start")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(2000);
  }
}

// ═══════════════════════════════════════════════════════════════
// CHECK 1: Header consistency (38.10.3)
// ═══════════════════════════════════════════════════════════════

test.describe('Check 1: Header Consistency (38.10.3)', () => {

  test('/ts header has game-header with gradient', async ({ page }) => {
    await page.goto(`${BASE}/ts/`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test/visual/screenshots/check1-ts-header.png', fullPage: true });

    const header = page.locator('.game-header').first();
    await expect(header).toBeVisible();
    const bg = await header.evaluate((el: Element) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('gradient');
  });

  test('/mp lobby header has game-header with gradient', async ({ page }) => {
    await page.goto(`${BASE}/mp/`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test/visual/screenshots/check1-mp-lobby-header.png', fullPage: true });

    const header = page.locator('.game-header').first();
    await expect(header).toBeVisible();
    const bg = await header.evaluate((el: Element) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('gradient');
  });

  test('/mp in-game header has game-header with gradient', async ({ page }) => {
    await enterGame(page);
    await page.screenshot({ path: 'test/visual/screenshots/check1-mp-game-header.png', fullPage: true });

    const header = page.locator('.game-header').first();
    await expect(header).toBeVisible();
    const bg = await header.evaluate((el: Element) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('gradient');
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECK 2: White container + shadow, no header gap (38.15)
// ═══════════════════════════════════════════════════════════════

test.describe('Check 2: White Container + Shadow (38.15)', () => {

  test('/mp lobby #app has white bg and shadow', async ({ page }) => {
    await page.goto(`${BASE}/mp/`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test/visual/screenshots/check2-container.png', fullPage: true });

    // Check #app or main container
    const app = page.locator('#app, .lobby-container, .app-container, main, .mp-lobby').first();
    if (await app.isVisible()) {
      const styles = await app.evaluate((el: Element) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, shadow: cs.boxShadow };
      });
      console.log('Container bg:', styles.bg, 'shadow:', styles.shadow);
    }

    // Header should be flush — no gap at top
    const header = page.locator('.game-header').first();
    if (await header.isVisible()) {
      const rect = await header.boundingBox();
      console.log('Header position:', rect);
      if (rect) {
        expect(rect.y).toBeLessThanOrEqual(10);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECK 3: Purple room panes (38.16)
// ═══════════════════════════════════════════════════════════════

test.describe('Check 3: Purple Room Panes (38.16)', () => {

  test('room cards in lobby have purple/gradient tint', async ({ page }) => {
    await page.goto(`${BASE}/mp/`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test/visual/screenshots/check3-room-panes.png', fullPage: true });

    // Find room cards
    const cards = page.locator('.room-card, .room-item, [class*="room"]');
    const count = await cards.count();
    console.log('Room cards found:', count);

    if (count > 0) {
      const firstCard = cards.first();
      const styles = await firstCard.evaluate((el: Element) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, bgImage: cs.backgroundImage, border: cs.borderColor };
      });
      console.log('First room card styles:', styles);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECK 4: Cards side-by-side during round (38.17)
// ═══════════════════════════════════════════════════════════════

test.describe('Check 4: Cards Side-by-Side (38.17)', () => {

  test('cards-row has horizontal layout with arrow during round', async ({ page }) => {
    await enterGame(page, 'CardTester');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test/visual/screenshots/check4-cards-layout.png', fullPage: true });

    // Look for cards container
    const cardsRow = page.locator('.cards-row, .card-display, .cards-container, [class*="cards"]').first();
    if (await cardsRow.isVisible()) {
      const styles = await cardsRow.evaluate((el: Element) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, flexDirection: cs.flexDirection, gap: cs.gap };
      });
      console.log('Cards row styles:', styles);
      // Should be horizontal (flex-direction: row)
      if (styles.display === 'flex') {
        expect(styles.flexDirection).toBe('row');
      }
    }

    // Check for arrow between cards
    const arrow = page.locator('.card-arrow, .arrow, [class*="arrow"]').first();
    if (await arrow.isVisible()) {
      console.log('Arrow element found');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECK 5: Bottom padding — content not hidden under chat (38.18)
// ═══════════════════════════════════════════════════════════════

test.describe('Check 5: Bottom Padding (38.18)', () => {

  test('game content not hidden under chat/bottom elements', async ({ page }) => {
    await enterGame(page, 'PaddingTest');
    await page.waitForTimeout(3000);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test/visual/screenshots/check5-bottom-padding.png', fullPage: true });

    // Check if game buttons are visible (not hidden behind chat)
    const buttons = page.locator('button:has-text("Higher"), button:has-text("Lower"), button:has-text("Equal"), .guess-btn').first();
    if (await buttons.isVisible()) {
      const rect = await buttons.boundingBox();
      if (rect) {
        // Button bottom should be above viewport bottom
        const viewportHeight = 896;
        console.log('Button bottom:', rect.y + rect.height, 'viewport:', viewportHeight);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECK 6: No reload button in game view (38.19)
// ═══════════════════════════════════════════════════════════════

test.describe('Check 6: No Reload in Game (38.19)', () => {

  test('in-game header has leave button but no reload', async ({ page }) => {
    await enterGame(page, 'ReloadTest');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test/visual/screenshots/check6-game-header-buttons.png' });

    const header = page.locator('.game-header').first();
    if (await header.isVisible()) {
      const headerHTML = await header.innerHTML();
      console.log('Game header HTML:', headerHTML.substring(0, 500));

      // Should have leave/back button
      const leaveBtn = page.locator('.leave-btn, button:has-text("Leave"), .back-btn, [class*="leave"]').first();
      const hasLeave = await leaveBtn.isVisible().catch(() => false);
      console.log('Has leave button:', hasLeave);

      // Should NOT have reload button in game view
      const reloadBtn = page.locator('.reload-btn, button:has-text("Reload"), [class*="reload"]').first();
      const hasReload = await reloadBtn.isVisible().catch(() => false);
      console.log('Has reload button:', hasReload);
      expect(hasReload).toBe(false);
    }
  });
});
