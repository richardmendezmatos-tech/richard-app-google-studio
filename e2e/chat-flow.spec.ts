import { test, expect } from '@playwright/test';

test.describe('Chat Flow & AI Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open chat and greet the user', async ({ page }) => {
    const chatButton = page.locator('#chat-trigger');
    await chatButton.click();

    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();

    await chatInput.fill('Hola, estoy buscando un SUV premium');
    await chatInput.press('Enter');

    // Check for AI streaming response
    const aiMessage = page.locator('.message-assistant').first();
    await expect(aiMessage).toBeVisible({ timeout: 10000 });
  });

  test('should send a user message to the chat log', async ({ page }) => {
    const chatButton = page.locator('#chat-trigger');
    await chatButton.click();

    const chatInput = page.getByTestId('chat-input');
    await chatInput.fill('Quisiera tasar mi auto actual');
    await chatInput.press('Enter');

    // Verify the user message is visible in the chat log
    const userMessage = page.getByText('Quisiera tasar mi auto actual');
    await expect(userMessage).toBeVisible({ timeout: 5000 });
  });
});
