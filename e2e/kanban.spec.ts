
import { test, expect } from '@playwright/test';

test.describe('Kanban Board Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication if strictly required, but for now assuming public/dev access or default route
        await page.goto('/kanban-demo'); // Using demo route for E2E stability
    });

    test('should display Kanban columns', async ({ page }) => {
        // Navigate to Leads/Kanban view if necessary. 
        // Assuming it's visible on the main dashboard for this test or we need to click a tab.
        // Let's assume there is a way to see it. If RichardAIControl is there, maybe the board is below.

        // Wait for board to load
        await expect(page.getByText('Nuevos', { exact: true })).toBeVisible();
        await expect(page.getByText('Contactados')).toBeVisible();
        await expect(page.getByText('Ventas Cerradas')).toBeVisible();
    });

    test('should render lead cards with Glassmorphism', async ({ page }) => {
        // Check for at least one lead card
        const leadCard = page.locator('.glass-card').first();
        await expect(leadCard).toBeVisible();

        // Check for badges
        await expect(leadCard.locator('span', { hasText: 'Alta Prioridad' }).first()).toBeVisible();
    });
});
