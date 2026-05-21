#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "browser-agent-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

interface BrowseResult {
  success: boolean;
  data?: Record<string, unknown>;
  pagesVisited: string[];
  actions: string[];
  summary: string;
  error?: string;
  rawContent?: string;
}

async function runBrowse(instruction: string, url?: string): Promise<BrowseResult> {
  const { chromium } = await import('playwright-core');
  let browser: any = null;

  try {
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
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    const targetUrl = url || 'https://www.richard-automotive.com';
    const pagesVisited: string[] = [targetUrl];

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 20000 });

    const content = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      const text = main.innerText || '';
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => ({ text: (a as HTMLAnchorElement).textContent?.trim(), href: (a as HTMLAnchorElement).href }))
        .filter((l) => l.text && l.href)
        .slice(0, 30);
      return {
        title: document.title,
        text: text.substring(0, 6000),
        links,
        url: window.location.href,
      };
    });

    await browser.close();

    return {
      success: true,
      pagesVisited,
      actions: [`navigated to ${targetUrl}`, `extracted ${content.links.length} links`],
      summary: `Página: ${content.title} — ${content.text.substring(0, 100)}...`,
      rawContent: content.text.substring(0, 3000),
    };
  } catch (error: any) {
    if (browser) await browser.close().catch(() => {});
    return {
      success: false,
      pagesVisited: [],
      actions: [],
      summary: 'Error durante navegación',
      error: error.message,
    };
  }
}

async function runSearch(query: string): Promise<BrowseResult> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${query} automotive Puerto Rico`)}`;
  return runBrowse(query, searchUrl);
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "browse_web",
        description: "Navega a una URL y extrae el contenido textual y enlaces de la página. Útil para investigar precios de vehículos, leer páginas de concesionarios, o verificar información automotriz.",
        inputSchema: {
          type: "object",
          properties: {
            instruction: {
              type: "string",
              description: "Instrucción de lo que se busca (ej: 'busca el precio de una Ford Explorer 2025')",
            },
            url: {
              type: "string",
              description: "URL específica a navegar (opcional — si no se provee, se usa richard-automotive.com)",
            },
          },
          required: ["instruction"],
        },
      },
      {
        name: "search_web",
        description: "Busca información en la web usando Google. Ideal para investigar precios de competencia, especificaciones técnicas, reseñas de vehículos y noticias automotrices en Puerto Rico.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Término de búsqueda (ej: 'Ford F-150 2025 precio Puerto Rico')",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "extract_page",
        description: "Extrae contenido estructurado de una página web específica (título, texto, enlaces).",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL completa de la página a extraer",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "browse_web": {
        const instruction = args.instruction as string;
        const url = args.url as string | undefined;
        const result = await runBrowse(instruction, url);

        const text = result.success
          ? `✅ Navegación exitosa\n\n📄 **Páginas visitadas:** ${result.pagesVisited.join(', ')}\n📝 **Resumen:** ${result.summary}\n\n**Contenido extraído:**\n${result.rawContent?.substring(0, 2000)}`
          : `❌ Error: ${result.error}`;

        return {
          content: [{ type: "text", text }],
          isError: !result.success,
        };
      }

      case "search_web": {
        const query = args.query as string;
        const result = await runSearch(query);

        const text = result.success
          ? `🔍 Resultados de búsqueda para: "${query}"\n\n📄 **Páginas visitadas:** ${result.pagesVisited.join(', ')}\n📝 **Resumen:** ${result.summary}\n\n**Contenido extraído:**\n${result.rawContent?.substring(0, 2000)}`
          : `❌ Error en búsqueda: ${result.error}`;

        return {
          content: [{ type: "text", text }],
          isError: !result.success,
        };
      }

      case "extract_page": {
        const url = args.url as string;
        const result = await runBrowse(`Extraer contenido de ${url}`, url);

        const text = result.success
          ? `📄 **URL:** ${result.pagesVisited[0]}\n📝 **Resumen:** ${result.summary}\n\n**Enlaces encontrados (${result.rawContent ? 'ver contenido' : 'N/A'}):**\n${result.rawContent?.substring(0, 2000)}`
          : `❌ Error extrayendo página: ${result.error}`;

        return {
          content: [{ type: "text", text }],
          isError: !result.success,
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error en Browser Agent MCP: ${error.message}` }],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🌐 Browser Agent MCP Server running on stdio");
}

runServer().catch(console.error);
