import { test, expect } from '@playwright/test';

test.describe('Chat Flow & AI Interaction', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should open chat and greet the user', async ({ page }) => {
        const chatButton = page.locator('#chat-trigger');
        await chatButton.click();

        const chatInput = page.locator('input[placeholder*="Pregúntame"]');
        await expect(chatInput).toBeVisible();

        await chatInput.fill('Hola, estoy buscando un SUV premium');
        await chatInput.press('Enter');

        // Check for AI streaming response
        const aiMessage = page.locator('.message-assistant').first();
        await expect(aiMessage).toBeVisible({ timeout: 10000 });
    });

    test('should trigger progressive profiling form', async ({ page }) => {
        const chatButton = page.locator('#chat-trigger');
        await chatButton.click();

        const chatInput = page.locator('input[placeholder*="Pregúntame"]');
        await chatInput.fill('Quisiera tasar mi auto actual');
        await chatInput.press('Enter');

        // Form should appear after AI processes the request
        const appraisalForm = page.locator('.progressive-form-container');
        await expect(appraisalForm).toBeVisible({ timeout: 15000 });
    });
});
