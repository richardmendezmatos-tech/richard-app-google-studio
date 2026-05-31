import { WebExtractorPort, ExtractorConfig } from './WebExtractorPort';
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';

interface AjaxInventoryResponse {
  success: boolean;
  data: {
    vehicles: string;
    pagination: {
      total: number;
      total_pages: number;
      current_page: number;
      per_page: number;
    };
  };
}

const BASE_CDN = 'https://apicdn.inventario360.com';

export class RestApiExtractorAdapter implements WebExtractorPort {
  private readonly AJAX_URL = 'https://centralfordpr.com/wp-admin/admin-ajax.php';
  private detailUrls: Map<string, string> = new Map();

  async extractFullInventory(config: ExtractorConfig): Promise<Vehicle[]> {
    console.log('[RestApiExtractor] Iniciando extracción masiva vía AJAX...');

    const allVehicles: Vehicle[] = [];
    const perPage = 100;
    const conditions = ['New', 'Used'];

    try {
      for (const condition of conditions) {
        console.log(`[RestApiExtractor] Procesando condición: ${condition}...`);

        const firstPage = await this.fetchPage(1, perPage, condition);
        if (!firstPage || !firstPage.success) {
          console.warn(
            `[RestApiExtractor] No se pudo obtener la respuesta para ${condition}. Saltando...`,
          );
          continue;
        }

        const totalItems = firstPage.data.pagination?.total || 0;
        if (totalItems === 0) {
          console.log(`[RestApiExtractor] No se encontraron unidades para ${condition}.`);
          continue;
        }

        const totalPages = Math.ceil(totalItems / perPage);
        console.log(
          `[RestApiExtractor] Detectadas ${totalPages} páginas para ${condition} (${totalItems} unidades).`,
        );

        this.processHtml(
          firstPage.data.vehicles,
          allVehicles,
          condition.toUpperCase() as 'NEW' | 'USED',
        );

        for (let p = 2; p <= totalPages; p++) {
          console.log(
            `[RestApiExtractor] Esperando 1s antes de procesar página ${p} de ${condition}...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const pageData = await this.fetchPage(p, perPage, condition);
          if (pageData && pageData.success) {
            this.processHtml(
              pageData.data.vehicles,
              allVehicles,
              condition.toUpperCase() as 'NEW' | 'USED',
            );
          }
        }
      }

      console.log(
        `[RestApiExtractor] Extracción completada: ${allVehicles.length} vehículos. Enriqueciendo imágenes desde páginas de detalle...`,
      );

      await this.enrichVehicleImages(allVehicles);

      console.log(
        `[RestApiExtractor] Proceso completado: ${allVehicles.length} vehículos procesados.`,
      );
      return allVehicles;
    } catch (error: any) {
      console.error('[RestApiExtractor] Error fatal en la extracción:', error.message);
      throw error;
    }
  }

  private async enrichVehicleImages(vehicles: Vehicle[]): Promise<void> {
    const CONCURRENCY = 5;
    let enriched = 0;
    let failed = 0;

    for (let i = 0; i < vehicles.length; i += CONCURRENCY) {
      const batch = vehicles.slice(i, i + CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map((v) => this.fetchVehicleImages(v.vin)),
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.length >= 5) {
          batch[idx].updateImages(result.value);
          enriched++;
        } else if (result.status === 'rejected') {
          failed++;
        }
      });

      if (i + CONCURRENCY < vehicles.length) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    console.log(
      `[RestApiExtractor] Imágenes enriquecidas: ${enriched} vehículos, ${failed} fallos.`,
    );
  }

  private async fetchVehicleImages(vin: string): Promise<string[]> {
    const detailUrl = this.detailUrls.get(vin);
    if (!detailUrl) return [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(detailUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-419,es;q=0.9',
        },
      });

      if (!res.ok) return [];
      const html = await res.text();

      const images = this.parseImagesFromJsonLd(html) || this.parseImagesFromHtml(html);

      if (images.length >= 5) return images;
      return [];
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseImagesFromJsonLd(html: string): string[] | null {
    const ldRegex =
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
    let match;

    while ((match = ldRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const graph = parsed['@graph'] || [parsed];
        const carEntry = graph.find((g: any) => g['@type'] === 'Car');
        if (carEntry?.image && Array.isArray(carEntry.image)) {
          return carEntry.image.map((url: string) => {
            const srcMatch = url.match(/[?&]src=([^&]+)/);
            return srcMatch ? decodeURIComponent(srcMatch[1]) : url;
          });
        }
      } catch {
        // skip invalid JSON-LD blocks
      }
    }

    return null;
  }

  private parseImagesFromHtml(html: string): string[] {
    const imgRegex = new RegExp(
      `src="https://${BASE_CDN.replace(/https?:\/\//, '').replace(/\./g, '\\.')}\\/img\\?src=([^"&]+)`,
      'g',
    );
    const urls = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = imgRegex.exec(html)) !== null) {
      try {
        const decoded = decodeURIComponent(m[1]);
        urls.add(decoded);
      } catch {
        // skip invalid URLs
      }
    }
    return [...urls];
  }

  private async fetchPage(
    page: number,
    perPage: number,
    condition: string,
  ): Promise<AjaxInventoryResponse | null> {
    const formData = new URLSearchParams();
    formData.append('action', 'get_inventory_results_v2');
    formData.append('allFilters[current_page]', page.toString());
    formData.append('allFilters[per_page]', perPage.toString());
    formData.append('allFilters[sort]', 'updated_at');
    formData.append('allFilters[sort_direction]', 'desc');
    formData.append('allFilters[make]', '19');
    formData.append('allFilters[condition]', condition);

    try {
      const response = await fetch(this.AJAX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
          Referer: 'https://centralfordpr.com/inventario-nuevos/',
          Accept: '*/*',
          'Accept-Language': 'es-419,es;q=0.9',
          Origin: 'https://centralfordpr.com',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: 'cookieadmin_consent={"accept":"true"}',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return (await response.json()) as AjaxInventoryResponse;
    } catch (error: any) {
      console.error(`[RestApiExtractor] Error fetching page ${page}:`, error.message);
      return null;
    }
  }

  private processHtml(
    html: string,
    target: Vehicle[],
    defaultCondition: 'NEW' | 'USED' = 'USED',
  ): void {
    if (!html) return;

    const articleRegex =
      /<article[^>]*class="[^"]*inv360VehicleCard[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      const articleHtml = match[0];
      const content = match[1];

      try {
        const vehicleId = this.extractAttr(articleHtml, 'data-vehicle-id');
        const vin = this.extractAttr(articleHtml, 'data-vin');
        const engine = this.extractAttr(articleHtml, 'data-engine');
        const transmission = this.extractAttr(articleHtml, 'data-transmission');
        const exteriorColor = this.extractAttr(articleHtml, 'data-color');
        const mpgCity = this.extractAttr(articleHtml, 'data-mpg-city');
        const mpgHighway = this.extractAttr(articleHtml, 'data-mpg-highway');

        const titleMatch = content.match(
          /<h5[^>]*class=['"][^'"]*inv360VehicleCard__title[^'"]*['"][^>]*>\s*([\s\S]*?)\s*<\/h5>/,
        );
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown';

        const priceMatch = content.match(
          /<span[^>]*class=['"][^'"]*inv360VehicleCard__price[^'"]*['"][^>]*>\$([\d,]+)<\/span>/,
        );
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

        const mileageMatch = content.match(/<span>\s*([\d,]+)\s*millas\s*<\/span>/i);
        const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : 0;

        const imgMatch = content.match(
          /src=['"]([^'"]+apicdn\.inventario360\.com\/img\?src=([^&'"]+)[^'"]*)['"]/,
        );
        const imageUrl = imgMatch ? decodeURIComponent(imgMatch[2]) : '';

        if (!vin || vin === 'UNKNOWN') continue;

        const detailUrl = this.extractDetailUrl(articleHtml);
        if (vin && detailUrl) {
          this.detailUrls.set(vin, detailUrl);
        }

        const vehicle = Vehicle.create(vin, {
          make: 'Ford',
          model: title,
          year: parseInt(title.match(/\d{4}/)?.[0] || '2025'),
          price: price,
          mileage: mileage,
          images: imageUrl ? [imageUrl] : [],
          status: 'AVAILABLE',
          condition: defaultCondition,
          lastScrapedAt: new Date(),
          exteriorColor: exteriorColor !== '-' ? exteriorColor : undefined,
          engine: engine !== '-' ? engine : undefined,
          transmission: transmission !== '-' ? transmission : undefined,
          driveTrain: undefined,
          bodyStyle: undefined,
        });

        target.push(vehicle);
      } catch (e: any) {
        console.warn(`[RestApiExtractor] Saltando vehículo inválido: ${e.message}`);
      }
    }
  }

  private extractDetailUrl(html: string): string {
    const match = html.match(/href="([^"]*\/vehicles\/[^"]+)"/i);
    return match ? match[1] : '';
  }

  private extractAttr(html: string, attr: string): string {
    const regex = new RegExp(`${attr}="([^"]*)"`);
    const match = html.match(regex);
    return match ? match[1] : '';
  }
}
