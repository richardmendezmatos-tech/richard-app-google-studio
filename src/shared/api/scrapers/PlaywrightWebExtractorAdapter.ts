import { WebExtractorPort, ExtractorConfig } from './WebExtractorPort';
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';
import { chromium, Page } from 'playwright-core'; 
import sparticuzChromium from '@sparticuz/chromium';

export class PlaywrightWebExtractorAdapter implements WebExtractorPort {
  async extractFullInventory(config: ExtractorConfig): Promise<Vehicle[]> {
    let browser: any = null;
    
    try {
      const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

      if (isProd) {
        // Configuración para Vercel Serverless
        browser = await chromium.launch({
          args: sparticuzChromium.args,
          executablePath: await sparticuzChromium.executablePath(),
          headless: true,
        });
      } else {
        // Configuración para Desarrollo Local
        browser = await chromium.launch({
          headless: true,
          args: config.useStealthMode ? [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ] : []
        });
      }

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
        }
      });

      const page = await context.newPage();
      const allVehicles: Vehicle[] = [];

      for (const url of config.targetUrls) {
        const condition = url.includes('nuevos') ? 'NEW' : 'USED';

        // Disparar extracción para esta URL
        const inventoryData = await this.interceptXhrOrFallbackToDom(page, url);

        if (inventoryData && inventoryData.length > 0) {
          const vehicles = inventoryData.map(data => 
            Vehicle.create(data.vin, {
              make: data.make || 'Ford',
              model: data.model,
              year: parseInt(data.year),
              price: this.parseCleanPrice(data.price),
              mileage: data.mileage || 0,
              images: data.images || [],
              status: 'AVAILABLE',
              condition: condition,
              lastScrapedAt: new Date()
            })
          );
          allVehicles.push(...vehicles);
        }
      }

      return allVehicles;

    } catch (error: any) {
      throw new Error(`Scraper Error [${config.targetUrls.join(', ')}]: ${error.message}`, { cause: error });
    } finally {
      if (browser) await browser.close();
    }
  }

  private async interceptXhrOrFallbackToDom(page: Page, url: string): Promise<any[]> {
    console.log(`[Extrayendo] Navegando a ${url}...`);
    
    // Configurar timeout realista (red del dealer puede ser lenta)
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    
    // Esperar a que el motor de Inventario360 inyecte las tarjetas
    await page.waitForSelector('.inv360VehicleCard', { timeout: 15000 }).catch(() => {
        console.warn('Inventario360 Cards no encontradas en 15s. Posible bloqueo o página vacía.');
    });

    // Extraer datos del DOM usando los Data Attributes de Inventario360 (Más robusto)
    const rawVehicles = await page.$$eval('.inv360VehicleCard', cards => {
      return cards.map(card => {
        const vin = (card as HTMLElement).dataset.vin || 'UNKNOWN';
        const titleEl = card.querySelector('.inv360VehicleCard__title');
        const priceEl = card.querySelector('.inv360VehicleCard__price');
        const mileageEl = card.querySelector('.inv360VehicleCard__info span:last-child'); // Basado en "Nuevo - 0 millas"
        const imgEl = card.querySelector('.inv360VehicleCard__img') as HTMLImageElement;

        // Parseo de Título (Ej. "Ford Ranger STX Canopy 2025")
        const fullTitle = titleEl?.textContent?.trim() || '';
        const yearMatch = fullTitle.match(/\b(202[4-6])\b/);
        const year = yearMatch ? yearMatch[1] : '2025';
        const make = 'Ford';
        const model = fullTitle.replace(make, '').replace(year, '').trim();

        return {
          vin,
          make,
          model,
          year,
          price: priceEl?.textContent?.trim() || '0',
          mileage: mileageEl?.textContent?.trim() || '0',
          images: imgEl?.src ? [imgEl.src] : []
        };
      });
    });

    // Filtramos cualquier error garrafal de parseo donde el VIN no se haya atrapado
    return rawVehicles.filter(v => v.vin !== 'UNKNOWN');
  }

  private parseCleanPrice(rawPrice: string | number): number {
    if (typeof rawPrice === 'number') return rawPrice;
    
    // Caso especial "Call for Price" o similar
    if (rawPrice.toLowerCase().includes('call') || rawPrice === '') return 0;

    const clean = rawPrice.replace(/[^0-9]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  }
}
