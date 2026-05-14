import { analyzeImageWithPrompt } from '@/shared/api/ai';
import { Car } from '@/entities/inventory';
import { raSentinel } from '@/shared/lib/monitoring/raSentinelService';

export const inventoryIngestionService = {
  /**
   * Process an image (Window Sticker, Auction Sheet, or Car Photo)
   * and extract structured inventory data using Gemini Vision.
   */
  processInventoryImage: async (imageSource: string, retries = 2): Promise<Partial<Car>> => {
    const prompt = `
        ANALIZA ESTA IMAGEN DE UN VEHÍCULO O DOCUMENTO PARA RICHARD AUTOMOTIVE (PUERTO RICO).
        
        Tu tarea es extraer datos precisos para una ficha de inventario premium.
        
        NIVEL 16 - NEURO-PERSUASION:
        Identifica el perfil cognitivo dominante sugerido por el vehículo y genera una "marketingDescription" corta pero poderosa (máximo 3 oraciones) que resalte el valor emocional del auto.

        EXTRAE ESTOS CAMPOS:
        - VIN exacto.
        - Año, Marca, Modelo, Trim.
        - Transmisión (Manual/Automática).
        - Motor (Ej: 2.0L I4, 3.5L V6).
        - Kilometraje (Mileage) si es visible.
        - Color Exterior e Interior.
        
        RETORNA SOLO JSON (sin markdown) con este esquema:
        {
            "vin": "string",
            "year": number,
            "make": "string",
            "model": "string",
            "trim": "string",
            "price": number,
            "color": "string",
            "interiorColor": "string",
            "mileage": number,
            "transmission": "string",
            "engine": "string",
            "type": "suv" | "sedan" | "luxury" | "pickup" | "otros",
            "fuelType": "gasolina" | "hibrido" | "electrico" | "diesel",
            "keyFeatures": ["string"],
            "marketingDescription": "string",
            "suggestedCognitiveProfile": "analytical" | "impulsive" | "conservative"
        }
        `;

    try {
      const data = (await analyzeImageWithPrompt(imageSource, prompt)) as any;

      // Report activity to Sentinel
      await raSentinel.reportActivity({
        type: 'vision_intake_attempt',
        data: { vin: data.vin, make: data.make, model: data.model },
        operationalScore: data.vin ? 100 : 40,
        metadata: { profile: data.suggestedCognitiveProfile }
      });

      // Sanitización de tipos y alineación con la interfaz Car
      const sanitized: Partial<Car> = {
        vin: data.vin || '',
        make: data.make || '',
        model: data.model || '',
        trim: data.trim || '',
        year: data.year ? Number(data.year) : new Date().getFullYear(),
        color: data.color || '',
        mileage: data.mileage ? Number(data.mileage) : 0,
        type: data.type || 'Otros',
        transmission: data.transmission || '',
        engine: data.engine || '',
        fuelType: data.fuelType || '',
        description: data.marketingDescription || '',
        features: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
        aiScore: data.vin ? 95 : 40,
      };

      return sanitized;
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying inventory ingestion... (${retries} attempts left)`);
        return inventoryIngestionService.processInventoryImage(imageSource, retries - 1);
      }
      
      console.error('Inventory Ingestion Error after retries:', error);
      raSentinel.reportFriction('vision_ingestion', 'AI Analysis Failed', { error: String(error) });
      throw new Error('Análisis de Visión fallido. Por favor carga una imagen más clara.', {
        cause: error,
      });
    }
  },
};
