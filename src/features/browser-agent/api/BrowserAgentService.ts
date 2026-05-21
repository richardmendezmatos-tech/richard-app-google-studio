import type { Page, Browser } from 'playwright-core';

interface BrowseTask {
  instruction: string;
  url?: string;
}

interface BrowseActionResult {
  action: string;
  url: string;
  summary: string;
  data?: Record<string, unknown>;
}

interface BrowseResult {
  success: boolean;
  data?: Record<string, unknown>;
  pagesVisited: string[];
  actions: string[];
  summary: string;
  error?: string;
  rawContent?: string;
}

const MAX_STEPS = 10;
const MAX_DURATION_MS = 45000;

async function extractPageContent(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const text = main.innerText || '';
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({ text: (a as HTMLAnchorElement).textContent?.trim(), href: (a as HTMLAnchorElement).href }))
      .filter((l) => l.text && l.href)
      .slice(0, 50);
    const forms = Array.from(document.querySelectorAll('form, [data-mcp-role]')).map((f) => ({
      tag: f.tagName,
      action: (f as HTMLFormElement).action || '',
      role: f.getAttribute('data-mcp-role') || f.getAttribute('mcp:role') || '',
      fields: Array.from(f.querySelectorAll('input, select, textarea')).map((i) => ({
        name: (i as HTMLInputElement).name || (i as HTMLInputElement).id || '',
        type: (i as HTMLInputElement).type || 'text',
        placeholder: (i as HTMLInputElement).placeholder || '',
      })),
    }));
    const images = Array.from(document.querySelectorAll('img[src]'))
      .map((img) => ({
        src: (img as HTMLImageElement).src,
        alt: (img as HTMLImageElement).alt || '',
      }))
      .filter((i) => i.src.startsWith('http'))
      .slice(0, 20);
    return {
      title: document.title,
      text: text.substring(0, 8000),
      links,
      forms,
      images,
    };
  });
}

class BrowserAgentService {
  async execute(task: BrowseTask): Promise<BrowseResult> {
    let browser: Browser | null = null;
    const startTime = Date.now();
    const pagesVisited: string[] = [];
    const actions: string[] = [];

    try {
      const { chromium } = await import('playwright-core');
      const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

      if (isProd) {
        const sparticuzChromium = await import('@sparticuz/chromium');
        browser = await chromium.launch({
          args: sparticuzChromium.default.args,
          executablePath: await sparticuzChromium.default.executablePath(),
          headless: true,
        });
      } else {
        browser = await chromium.launch({
          headless: true,
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        });
      }

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
      });

      const page = await context.newPage();

      const targetUrl = task.url || 'https://www.richard-automotive.com';
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
      pagesVisited.push(targetUrl);
      actions.push(`navigate: ${targetUrl}`);

      let content = await extractPageContent(page);
      let stepCount = 0;
      let extractedData: Record<string, unknown> = {};

      while (stepCount < MAX_STEPS && Date.now() - startTime < MAX_DURATION_MS) {
        stepCount++;

        const decision = await this.analyzeWithAI(task.instruction, content, actions, stepCount);

        if (decision.action === 'done' || decision.action === 'extract') {
          extractedData = decision.data || {};
          if (decision.summary) {
            actions.push(`extracted: ${decision.summary}`);
          }
          break;
        }

        if (decision.action === 'click' && decision.selector) {
          try {
            await page.click(decision.selector, { timeout: 5000 });
            await page.waitForTimeout(1000);
            actions.push(`click: ${decision.selector}`);
            content = await extractPageContent(page);
          } catch {
            actions.push(`click_failed: ${decision.selector}`);
          }
        } else if (decision.action === 'navigate' && decision.url) {
          try {
            await page.goto(decision.url, { waitUntil: 'networkidle', timeout: 15000 });
            pagesVisited.push(decision.url);
            actions.push(`navigate: ${decision.url}`);
            content = await extractPageContent(page);
          } catch {
            actions.push(`navigate_failed: ${decision.url}`);
          }
        } else if (decision.action === 'search' && decision.query) {
          try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(decision.query)}`;
            await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 });
            pagesVisited.push(searchUrl);
            actions.push(`search: ${decision.query}`);
            content = await extractPageContent(page);
          } catch {
            actions.push(`search_failed: ${decision.query}`);
          }
        } else if (decision.action === 'scroll') {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight));
          await page.waitForTimeout(500);
          actions.push('scroll');
          content = await extractPageContent(page);
        } else {
          actions.push(`unknown_action: ${decision.action}`);
          break;
        }
      }

      const summary = Object.keys(extractedData).length > 0
        ? `Extraídos ${Object.keys(extractedData).length} campos de datos`
        : `Visitas: ${pagesVisited.length} páginas en ${stepCount} pasos`;

      return {
        success: true,
        data: extractedData,
        pagesVisited,
        actions,
        summary,
        rawContent: content.text.substring(0, 2000),
      };
    } catch (error: any) {
      return {
        success: false,
        pagesVisited,
        actions,
        summary: 'Error durante la navegación',
        error: error.message,
      };
    } finally {
      if (browser) await browser.close();
    }
  }

  private async analyzeWithAI(
    instruction: string,
    pageContent: { title: string; text: string; links: { text?: string; href: string }[]; forms: { tag: string; action: string; role: string; fields: { name: string; type: string; placeholder: string }[] }[]; images: { src: string; alt: string }[] },
    actions: string[],
    step: number,
  ): Promise<{ action: string; selector?: string; url?: string; query?: string; summary?: string; data?: Record<string, unknown> }> {
    const systemPrompt = `Eres Navigator, un agente de navegación web autónomo de Richard Automotive.
Analizas páginas web y decides la siguiente acción para completar la tarea del usuario.
Debes responder SOLO con JSON.`;

    const prompt = `INSTRUCCIÓN: ${instruction}

CONTENIDO DE LA PÁGINA ACTUAL:
Título: ${pageContent.title}
Texto visible: ${pageContent.text.substring(0, 3000)}

LINKS DISPONIBLES (${pageContent.links.length}):
${pageContent.links.slice(0, 15).map((l) => `- "${l.text}" → ${l.href}`).join('\n')}

FORMULARIOS DISPONIBLES (${pageContent.forms.length}):
${pageContent.forms.slice(0, 5).map((f) => `- [${f.tag}] role="${f.role}" action="${f.action}"`).join('\n')}

ACCIONES REALIZADAS (${actions.length}):
${actions.join('\n')}

PASO ACTUAL: ${step}

Responde UNICAMENTE con JSON en este formato exacto. Elige la mejor acción para completar la instrucción:

Para finalizar y entregar datos:
{"action":"done","data":{"key":"value",...},"summary":"resumen de lo encontrado"}

Para hacer click en un link:
{"action":"click","selector":"a:text-is('Texto Exacto')"}

Para navegar a una URL:
{"action":"navigate","url":"https://..."}

Para buscar en Google:
{"action":"search","query":"término de búsqueda"}

Para scrollear:
{"action":"scroll"}`;

    try {
      const { google } = await import('@ai-sdk/google');
      const { generateText } = await import('ai');
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: systemPrompt,
        prompt,
        temperature: 0.1,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { action: 'done', summary: 'No se pudo analizar la respuesta' };
      }
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { action: 'done', summary: 'Error analizando página con AI' };
    }
  }
}

export const browserAgentService = new BrowserAgentService();
export type { BrowseTask, BrowseResult };
