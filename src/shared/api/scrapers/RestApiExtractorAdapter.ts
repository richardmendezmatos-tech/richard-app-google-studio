import { WebExtractorPort, ExtractorConfig } from './WebExtractorPort';
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';

interface Inv360Response {
  message: string;
  status: number;
  data: any[];
  pagination: {
    total_results: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export class RestApiExtractorAdapter implements WebExtractorPort {
  private readonly API_BASE_URL = 'https://centralfordpr.com/wp-json/inv360/v1/vehicles';

  async extractFullInventory(config: ExtractorConfig): Promise<Vehicle[]> {
    console.log('[RestApiExtractor] Iniciando extracción masiva vía API...');
    
    // El endpoint de Inv360 devuelve tanto nuevos como usados si no se filtra,
    // pero para seguridad seguiremos el patrón de URLs si se proveen filtros,
    // o simplemente traeremos todo el universo disponible.
    
    const allVehicles: Vehicle[] = [];
    
    try {
      // 1. Obtener primera página para conocer el total_pages
      const firstPage = await this.fetchPage(1);
      if (!firstPage) return [];

      console.log(`[RestApiExtractor] Detectadas ${firstPage.pagination.total_pages} páginas (${firstPage.pagination.total_results} unidades).`);
      
      // 2. Procesar primera página
      this.processResponse(firstPage, allVehicles);

      // 3. Iterar por las páginas restantes
      for (let p = 2; p <= firstPage.pagination.total_pages; p++) {
        const pageData = await this.fetchPage(p);
        if (pageData) {
          this.processResponse(pageData, allVehicles);
        }
      }

      console.log(`[RestApiExtractor] Extracción completada: ${allVehicles.length} vehículos procesados.`);
      return allVehicles;

    } catch (error: any) {
      console.error('[RestApiExtractor] Error fatal en la API:', error.message);
      throw error;
    }
  }

  private async fetchPage(page: number): Promise<Inv360Response | null> {
    const url = `${this.API_BASE_URL}?current_page=${page}&per_page=20`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`[RestApiExtractor] Error en página ${page}:`, error.message);
      return null;
    }
  }

  private processResponse(response: Inv360Response, target: Vehicle[]): void {
    const vehicles = response.data.map(item => {
      // Mapeo defensivo de campos
      const vin = item.vin || item.id?.toString() || 'UNKNOWN';
      const condition = (item.condition?.toLowerCase() === 'nuevo' || item.condition?.toLowerCase() === 'new') ? 'NEW' : 'USED';
      
      return Vehicle.create(vin, {
        make: item.attributes?.make || 'Ford',
        model: item.attributes?.model || item.title || 'Unknown',
        year: parseInt(item.attributes?.year || item.title?.match(/\d{4}/)?.[0] || '2025'),
        price: parseFloat(item.price || '0'),
        mileage: parseInt(item.mileage || '0'),
        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
        status: 'AVAILABLE',
        condition: condition as any,
        lastScrapedAt: new Date(),
        exteriorColor: item.attributes?.exterior_color || item.attributes?.color,
        interiorColor: item.attributes?.interior_color,
        trim: item.attributes?.trim,
        engine: item.attributes?.engine,
        transmission: item.attributes?.transmission,
        driveTrain: item.attributes?.drive_train || item.attributes?.drivetrain,
        bodyStyle: item.attributes?.body_style || item.attributes?.body
      });
    });

    target.push(...vehicles.filter(v => v.vin !== 'UNKNOWN'));
  }
}
