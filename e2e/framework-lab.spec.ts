
import { test, expect } from '@playwright/test';

test.describe('Framework Lab Polyglot Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/framework-lab');
    });

    test('should render all 5 frameworks', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Multi-Framework Core' })).toBeVisible();

        // Check React
        await expect(page.getByText('React Host Connected')).toBeVisible();

        // Check Vue (Glassmorphism card)
        await expect(page.getByText('Vue Layer')).toBeVisible();

        // Check Angular
        await expect(page.getByText('Angular Core')).toBeVisible();

        // Check Svelte
        await expect(page.getByText('Svelte Cyber')).toBeVisible();

        // Check Solid
        await expect(page.getByText('Solid Flux')).toBeVisible();
    });

    test('should synchronize state across frameworks', async ({ page }) => {
        // Initial state check - assume starts at 0 or consistent value
        // We'll increment from Vue and check React/Solid

        // Locate the global count display in React (Header) or Stats
        const initialCount = await page.getByText('Total Framework Interaction').locator('..').locator('p.text-2xl').innerText();

        // Click "Push State" in Vue component
        await page.getByRole('button', { name: 'Push State' }).click();

        // Verify Global Count updated in React Stat Card
        // Note: State updates might be async/fast, Playwright auto-waits/retries assertions
        const newCount = String(Number(initialCount) + 1);
        await expect(page.getByText('Total Framework Interaction').locator('..').locator('p.text-2xl')).toHaveText(newCount);

        // Verify Solid Flux component also updated
        // Solid component shows the count in the large h3
        await expect(page.getByText('Solid Flux').locator('..').locator('..').locator('h3')).toHaveText(newCount);
    });
});
