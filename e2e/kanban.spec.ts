
import { test, expect } from '@playwright/test';

test.describe('Kanban Board Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('e2e_bypass', 'true');
        });
        await page.goto('/e2e-kanban');
    });

    test('should display Kanban columns', async ({ page }) => {
        // Wait for board to load and columns to be visible
        await expect(page.getByRole('heading', { name: 'Nuevos' })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Contactados' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Ventas Cerradas' })).toBeVisible();
    });

    test('should render lead cards with Glassmorphism', async ({ page }) => {
        // Check for at least one lead card
        const leadCard = page.locator('.glass-card').first();
        await expect(leadCard).toBeVisible();

        // Check for badges
        await expect(leadCard.locator('span', { hasText: 'Alta Prioridad' }).first()).toBeVisible();
    });
});
