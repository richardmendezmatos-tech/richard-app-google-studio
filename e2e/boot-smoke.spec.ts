import { test, expect } from '@playwright/test';

test.describe('Next.js Migration Route Audit', () => {
  const routes = [
    { path: '/', title: /Richard Automotive/ },
    { path: '/blog', title: /Blog/ },
    { path: '/consultant', title: /Consultante/i },
    { path: '/precualificacion', title: /Pre-Cualificación/i },
    { path: '/financiamiento', title: /Financiamiento/i },
    { path: '/contacto', title: /Contacto/i },
    { path: '/ai-lab', title: /AI Lab/i },
  ];

  for (const route of routes) {
    test(`route ${route.path} should load properly`, async ({ page }) => {
      await page.goto(route.path);
      // Wait for the startup overlay to clear (it shouldn't be there)
      await expect(page.locator('#startup-error-overlay')).toHaveCount(0);
      
      const bodyText = (await page.locator('body').innerText()).trim();
      expect(bodyText.length).toBeGreaterThan(100);
      
      // Basic check for title or main heading
      if (route.title) {
        // We'll check for partial text match as well to handle i18n
        const content = await page.content();
        expect(content).toMatch(route.title);
      }
    });
  }

  test('home should show main CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Asesoría que/i)).toBeVisible({ timeout: 15_000 });
  });
});
