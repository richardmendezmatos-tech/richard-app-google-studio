import { test, expect } from '@playwright/test';

test.describe('Critical Path: User Journey', () => {
    test('should allow user to browse inventory and view vehicle details', async ({ page }) => {
        // 1. Visit Homepage
        await page.goto('/');
        await expect(page).toHaveTitle(/Richard Automotive/);

        // 2. Click "VER INVENTARIO" (Explorar Showroom)
        // Using a specific text locator for the button content
        const inventoryButton = page.getByRole('button', { name: /ver inventario/i });
        await expect(inventoryButton).toBeVisible();
        await inventoryButton.click();

        // 3. Verify Inventory Page Loads
        // Expect URL to be /inventory or the section to be visible if it's a single page app scroll
        // Assuming it navigates to /inventory based on "onBrowseInventory" usually navigating
        // OR it might scroll. Let's check if URL changes or if we see cars.
        // If it's a scroll, we might not see URL change immediately, but let's assume standard routing for now.
        // Inspecting Storefront.tsx would confirm, but let's try assuming /inventory or #inventory

        // Wait for at least one car card to be visible
        // Let's assume there is some text indicating a price or "Ver Detalles"

        // Changing strategy: Wait for text that appears on cards like "MPG" or "$"
        await expect(page.getByText('$').first()).toBeVisible({ timeout: 10000 });

        // 4. Click on a Vehicle
        // The card itself is clickable. We target the car name (h3) and force click to avoid interception
        const carTitle = page.locator('h3').first();
        await expect(carTitle).toBeVisible();
        await carTitle.click({ force: true });

        // 5. Verify Vehicle Detail Modal (No URL change)
        // Wait for unique text inside the modal first
        await expect(page.getByText('Pago Mensual Estimado')).toBeVisible({ timeout: 10000 });

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        // Check for specific modal content
        await expect(modal.getByText('Pago Mensual Estimado')).toBeVisible();
        await expect(modal.getByRole('heading', { level: 2 })).toBeVisible();

        // Check for "Especificaciones" or "Potencia" which are likely in the detail view
        // Check for "Potencia" or "Motor" which are likely in the detail view
        // Also check for the "Agendar Test Drive" button which is critical
        await expect(page.getByText('Motor').or(page.getByText('Potencia'))).toBeVisible();
        await expect(page.getByRole('button', { name: /test drive/i })).toBeVisible();

        // Check that the title is not empty
        const title = await page.title();
        expect(title).not.toBe('Richard Automotive'); // Should have specific car name now due to our SEO work
    });
});

