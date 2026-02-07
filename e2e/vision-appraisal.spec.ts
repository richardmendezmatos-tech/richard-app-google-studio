import { test, expect } from '@playwright/test';

test.describe('Vision AI Appraisal Engine', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/crm'); // Vision integration is key in CRM/Sales Copilot
    });

    test('should handle photo upload and trigger AI analysis', async ({ page }) => {
        // Navigate to a lead with appraisal pending or the Sales Copilot photo area
        // This is a simplified test structure
        const appraisalTab = page.locator('text=Appraisal');
        if (await appraisalTab.isVisible()) {
            await appraisalTab.click();

            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.click('.dropzone-trigger');
            const fileChooser = await fileChooserPromise;

            // Upload a mock image
            await fileChooser.setFiles('public/images/mock-car-appraisal.jpg');

            const aiStatus = page.locator('text=Analizando con Vision AI...');
            await expect(aiStatus).toBeVisible();

            const results = page.locator('.vision-results-card');
            await expect(results).toBeVisible({ timeout: 20000 });
        }
    });
});
