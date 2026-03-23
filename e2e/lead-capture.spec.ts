import { test, expect } from '@playwright/test';

test.describe('Lead Capture Flow', () => {
    test('should allow a user to calculate payments and request approval', async ({ page }) => {
        // 1. Visit Homepage
        await page.goto('/');

        // 2. Open Inventory
        const inventoryButton = page.getByRole('button', { name: /explorar inventario/i });
        await inventoryButton.click();

        // Wait for inventory items to appear
        await expect(page.getByText('$').first()).toBeVisible({ timeout: 10000 });

        // 3. Click on the first vehicle
        const carTitle = page.locator('h3').first();
        await expect(carTitle).toBeVisible();
        await carTitle.click({ force: true });

        // 4. Wait for Vehicle Detail Modal
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible({ timeout: 10000 });
        await expect(modal.getByText('Pago Mensual Estimado')).toBeVisible();

        // 5. Fill out the Calculator Form
        const downPaymentInput = modal.locator('input#downPaymentInput');
        await expect(downPaymentInput).toBeVisible();
        await downPaymentInput.fill('2500');

        const tradeInInput = modal.locator('input#tradeInInput');
        await expect(tradeInInput).toBeVisible();
        await tradeInInput.fill('1500');

        // Note: The "Solicitar Aprobación" button opens a new tab to WhatsApp.
        // We will mock the window.open to test the interaction without actually opening a new tab.
        await page.evaluate(() => {
            window.open = function(url, target) {
                (window as any).__lastOpenedUrl = url;
                return null;
            };
        });

        const targetBtn = modal.getByRole('button', { name: /solicitar aprobación/i });
        await expect(targetBtn).toBeVisible();
        await targetBtn.click();

        // Verify the mock was called with the correct WhatsApp URL format
        const lastOpenedUrl = await page.evaluate(() => (window as any).__lastOpenedUrl);
        expect(lastOpenedUrl).toContain('wa.me');
        expect(lastOpenedUrl).toContain('Pronto:%20$2500');
        expect(lastOpenedUrl).toContain('TradeIn:%20$1500');
    });
});
