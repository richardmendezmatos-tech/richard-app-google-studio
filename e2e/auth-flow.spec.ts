import { test, expect } from '@playwright/test';

test.describe('Auth Flow — User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText(/Bienvenido/);
  });

  test('renders login form with email and password fields', async ({ page }) => {
    await expect(page.locator('input#login-email')).toBeVisible();
    await expect(page.locator('input#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Acceso Autorizado/ })).toBeVisible();
  });

  test('shows register form when toggling', async ({ page }) => {
    const toggleBtn = page.locator('button').filter({ hasText: /Solicitar Acceso/ });
    await toggleBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h2')).toContainText(/Crear Perfil/);
    await expect(page.getByRole('button', { name: /Crear Cuenta Segura/ })).toBeVisible();
    await expect(page.getByText(/Ya estás registrado/)).toBeVisible();
  });

  test('toggle back to login form', async ({ page }) => {
    const toggleBtn = page.locator('button').filter({ hasText: /Solicitar Acceso/ });
    await toggleBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h2')).toContainText(/Crear Perfil/);
    const backBtn = page.locator('button').filter({ hasText: /Iniciar Sesión/ });
    await backBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h2')).toContainText(/Bienvenido/);
  });

  test('social login buttons are visible in login mode', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Continuar con Google/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continuar con Facebook/ })).toBeVisible();
  });

  test('shows error on empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /Acceso Autorizado/ }).click();
    await expect(page.locator('input#login-email')).toBeFocused();
  });

  test('has link back to home', async ({ page }) => {
    await expect(page.getByText(/Volver a la Terminal/)).toBeVisible();
  });
});
