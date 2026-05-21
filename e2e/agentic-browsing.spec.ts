import { test, expect } from '@playwright/test';

test.describe('Fase 1: Agentic Browsing - Accesibilidad y WebMCP', () => {
  test('agent-accessibility-tree: botones deben tener texto discernible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button');
    const count = await buttons.count();
    const sinAccesibilidad: string[] = [];

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const ariaLabel = await btn.getAttribute('aria-label');
      const title = await btn.getAttribute('title');
      const text = (await btn.textContent())?.trim() || '';
      const hasVisibleText = text.length > 0;

      if (!ariaLabel && !title && !hasVisibleText) {
        const outerHtml = await btn.evaluate((el) => {
          const clone = el.cloneNode(true) as HTMLElement;
          const classList = Array.from(clone.classList).slice(0, 3).join('.');
          return `<${clone.tagName.toLowerCase()} class="${classList}">`;
        });
        sinAccesibilidad.push(outerHtml);
      }
    }

    expect(sinAccesibilidad).toEqual([]);
  });

  test('agent-accessibility-tree: links con icono deben tener aria-label', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('a');
    const count = await links.count();
    const sinAccesibilidad: string[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const ariaLabel = await link.getAttribute('aria-label');
      const text = (await link.textContent())?.trim() || '';

      const isExternal = href?.startsWith('http') && !href?.includes('richard-automotive.com');
      const hasIconOnly = text.length === 0 || text.includes('svg');

      if (isExternal && hasIconOnly && !ariaLabel) {
        sinAccesibilidad.push(href || 'unknown');
      }
    }

    expect(sinAccesibilidad).toEqual([]);
  });

  test('llms.txt debe estar accesible y tener links', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain('# Richard Automotive');
    expect(text).toContain('http');
  });

  test('WebMCP: meta tags deben existir en el head', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metaTags = page.locator('meta[name="mcp:tool"]');
    const count = await metaTags.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('WebMCP: JSON-LD schema debe existir', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const jsonld = page.locator('#webmcp-jsonld');
    await expect(jsonld).toHaveCount(1);

    const textContent = await jsonld.evaluate((el) => el.textContent);
    expect(textContent).toContain('schema.webmcp.dev');
    expect(textContent).toContain('pre-qualify');
    expect(textContent).toContain('bono-300');
    expect(textContent).toContain('trade-in');
  });

  test('WebMCP: form /bono-300 debe tener atributos mcp', async ({ page }) => {
    await page.goto('/bono-300');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form[data-mcp-role="lead-capture"]');
    await expect(form).toHaveCount(1);

    const purpose = await form.getAttribute('data-mcp-purpose');
    expect(purpose).toBe('bono-300');
  });
});
