import { analyzeImageWithPrompt } from '@/shared/api/ai';
import { Car } from '@/shared/types/types';
import { raSentinel } from '@/shared/lib/monitoring/raSentinelService';

export const inventoryIngestionService = {
  /**
   * Process an image (Window Sticker, Auction Sheet, or Car Photo)
   * and extract structured inventory data using Gemini Vision.
   */
  processInventoryImage: async (imageSource: string): Promise<Partial<Car>> => {
    const prompt = `
        ANALIZA ESTA IMAGEN DE UN VEHÍCULO O DOCUMENTO PARA RICHARD AUTOMOTIVE (PUERTO RICO).
        
        Tu tarea es extraer datos precisos para una ficha de inventario premium.
        
        NIVEL 16 - NEURO-PERSUASION:
        Identifica el perfil cognitivo dominante sugerido por el vehículo:
        - ANALYTICAL: Si es un auto económico, híbrido, con alta depreciación o enfoque técnico (Toyota Prius, Honda Civic).
        - IMPULSIVE: Si es un auto de lujo, deportivo, o de alto estatus (BMW, Porsche, Corvette).
        - CONSERVATIVE: Si es un auto familiar, SUV sólido, con enfoque en seguridad (Subaru, Volvo, Sienna).

        Si es un WINDOW STICKER (Monroney), extrae:
        - VIN exacto.
        - Año, Marca, Modelo, Trim (ej: SE, XLE, Limited).
        ...
        
        RETORNA SOLO JSON (sin markdown) con este esquema:
        {
            "vin": "string",
            "year": number,
            "make": "string",
            "model": "string",
            "trim": "string",
            "price": number,
            "color": "string",
            "mileage": number,
            "type": "string",
            "fuelType": "string",
            "keyFeatures": ["string"],
            "description": "string",
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
        year: data.year ? Number(data.year) : new Date().getFullYear(),
        color: data.color || '',
        mileage: data.mileage ? Number(data.mileage) : 0,
        type: data.type || 'Otros',
        description: data.description || '',
        features: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
      };

      return sanitized;
    } catch (error) {
      console.error('Inventory Ingestion Error:', error);
      raSentinel.reportFriction('vision_ingestion', 'AI Analysis Failed', { error: String(error) });
      throw new Error('Análisis de Visión fallido. Por favor carga una imagen más clara.', {
        cause: error,
      });
    }
  },
};
