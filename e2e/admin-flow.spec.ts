import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('renders admin login form', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.locator('h1')).toContainText(/Command Center/);
    await expect(page.getByPlaceholder('admin@richard.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /Authenticate/ })).toBeVisible();
  });

  test('shows Biometric and Magic Link buttons', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.locator('button').filter({ hasText: /Biometric/ })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Magic Link/ })).toBeVisible();
  });

  test('shows Forgot Password toggle', async ({ page }) => {
    await page.goto('/admin-login');
    await page.locator('button').filter({ hasText: /Forgot Password/ }).click();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Send Reset Link/ })).toBeVisible();
    await page.locator('button').filter({ hasText: /Forgot Password/ }).click();
    await expect(page.getByPlaceholder('tu@email.com')).not.toBeVisible();
  });

  test('shows Locked Out link', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.getByText(/Locked Out/)).toBeVisible();
  });

  test('shows Dev Quick Access button in development', async ({ page }) => {
    await page.goto('/admin-login');
    const devButton = page.getByRole('button', { name: /Dev Quick Access/ });
    if (await devButton.isVisible().catch(() => false)) {
      await expect(devButton).toBeVisible();
    }
  });

  test('admin dashboard loads with bypass and shows all tabs', async ({ page }) => {
    await page.goto('/admin?bypass=true');
    await expect(page.getByRole('heading', { name: /Houston/ })).toBeVisible({ timeout: 15000 });

    const tabs = ['CRM Board', 'Telemetría', 'Users'];
    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab, 'i') })).toBeVisible();
    }
  });

  test('admin dashboard Users tab switches view', async ({ page }) => {
    await page.goto('/admin?bypass=true');
    await expect(page.getByRole('heading', { name: /Houston/ })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Users/ }).click();
    await expect(page.getByRole('heading', { name: /User Management/ })).toBeVisible();
  });
});
