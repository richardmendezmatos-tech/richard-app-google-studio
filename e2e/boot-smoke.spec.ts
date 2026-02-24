import { test, expect } from '@playwright/test';

test.describe('Boot Smoke', () => {
  test('home should boot without blank screen or startup overlay', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Richard Automotive/);
    // Updated to match current hero/authority section text
    await expect(page.getByText(/Asesoría que/i)).toBeVisible({ timeout: 15_000 });

    await expect(page.locator('#startup-error-overlay')).toHaveCount(0);

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(50);
  });
});
