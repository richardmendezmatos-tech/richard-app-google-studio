// src/features/inventory-sync/infrastructure/scrapers/PlaywrightWebExtractorAdapter.ts
import { WebExtractorPort, ExtractorConfig } from './WebExtractorPort';
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';
import { chromium, Browser, Page } from '@playwright/test'; // O puppeteer

export class PlaywrightWebExtractorAdapter implements WebExtractorPort {
  async extractFullInventory(config: ExtractorConfig): Promise<Vehicle[]> {
    let browser: Browser | null = null;
    
    try {
      browser = await chromium.launch({
        headless: true,
        args: config.useStealthMode ? [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ] : []
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
        }
      });

      const page = await context.newPage();

      // Estrategia: Intercepción de XHR es más limpia y menos frágil que el DOM.
      const inventoryData = await this.interceptXhrOrFallbackToDom(page, config.baseUrl);
      
      // Mapeo (Parsing sucio a Entidad Pura)
      return inventoryData.map(data => 
        Vehicle.create(data.vin, {
          make: data.make || 'Ford',
          model: data.model,
          year: parseInt(data.year),
          price: this.parseCleanPrice(data.price),
          mileage: data.mileage || 0,
          images: data.images || [],
          status: 'AVAILABLE',
          lastScrapedAt: new Date()
        })
      );

    } catch (error: any) {
      throw new Error(`Scraper Error [${config.baseUrl}]: ${error.message}`, { cause: error });
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

    // Extraer datos del DOM
    const rawVehicles = await page.$$eval('.inv360VehicleCard', cards => {
      return cards.map(card => {
        const titleEl = card.querySelector('.inv360VehicleCard__title');
        const priceEl = card.querySelector('.inv360VehicleCard__price');
        const mileageEl = card.querySelector('.inv360VehicleCard__mileage');
        const imgEl = card.querySelector('.inv360VehicleCard__image img') as HTMLImageElement;
        const linkEl = card.querySelector('a.inv360VehicleCard__goDetail') as HTMLAnchorElement;

        // Parseo de Título (Ej. "Ford Bronco Sport Big Bend 2025")
        const fullTitle = titleEl?.textContent?.trim() || '';
        const yearMatch = fullTitle.match(/\b(202[4-6])\b/);
        const year = yearMatch ? yearMatch[1] : '2026';
        const make = 'Ford'; // Sabemos el origen
        // Remover el año y la marca para dejar solo el modelo
        const model = fullTitle.replace(make, '').replace(year, '').trim();

        // Extracción y sanitización de VIN del URL
        // Ej: .../nuevo-2025-ford-bronco-sport-3fmcr9bn5srf45559-573762/
        let vin = 'UNKNOWN';
        if (linkEl && linkEl.href) {
            const parts = linkEl.href.split('-');
            if (parts.length > 2) {
                vin = parts[parts.length - 2].toUpperCase(); 
            }
        }

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
