import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  const protectedRoutes = [
    { path: '/admin', label: 'Admin' },
    { path: '/garage', label: 'Garage' },
    { path: '/profile', label: 'Profile' },
    { path: '/command-center', label: 'Command Center' },
  ];

  for (const route of protectedRoutes) {
    test(`${route.label} redirects unauthenticated users to /login`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForURL('**/login**');
      expect(page.url()).toContain('/login');
      expect(decodeURIComponent(page.url())).toContain(`from=${route.path}`);
    });
  }

  test('/login is accessible without auth', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText(/Bienvenido/);
  });

  test('/admin-login is accessible without auth', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.locator('h1')).toContainText(/Command Center/);
  });

  test('bypass query param allows access to protected routes', async ({ page }) => {
    await page.goto('/admin?bypass=true');
    await expect(page.getByRole('heading', { name: /Houston/ })).toBeVisible({ timeout: 15000 });
  });
});
