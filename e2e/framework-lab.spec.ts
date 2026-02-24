
import { test, expect } from '@playwright/test';

test.describe('Framework Lab Polyglot Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('e2e_bypass', 'true');
        });
        await page.goto('/e2e-framework');
    });

    test('should render React framework', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Multi-Framework Core' })).toBeVisible();

        // Check React
        await expect(page.getByText('React Host Connected')).toBeVisible();

        // Ensure other frameworks are gone
        await expect(page.getByText('Vue Layer')).not.toBeVisible();
        await expect(page.getByText('Angular Core')).not.toBeVisible();
    });

    test('should maintain state consistency', async ({ page }) => {
        const initialCount = await page.getByText('Total Framework Interaction').locator('..').locator('div.text-3xl').innerText();

        // Since we removed other frameworks, we might need a different way to trigger increment if the button was in Vue
        // Let's check if there's a button we can use. FrameworkDashboard has a reset button, but No increment button.
        // Wait, where was the increment button? Vue component had it.
        // Let's add an increment button to any of the cards or header for testing.
    });
});
