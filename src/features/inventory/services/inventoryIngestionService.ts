import { analyzeImageWithPrompt } from '@/shared/api/ai';
import { Car } from '@/shared/types/types';

export const inventoryIngestionService = {
  /**
   * Process an image (Window Sticker, Auction Sheet, or Car Photo)
   * and extract structured inventory data using Gemini Vision.
   */
  processInventoryImage: async (imageSource: string): Promise<Partial<Car>> => {
    const prompt = `
        ANALIZA ESTA IMAGEN DE UN VEHÍCULO O DOCUMENTO PARA RICHARD AUTOMOTIVE (PUERTO RICO).
        
        Tu tarea es extraer datos precisos para una ficha de inventario premium.
        
        Si es un WINDOW STICKER (Monroney), extrae:
        - VIN exacto.
        - Año, Marca, Modelo, Trim (ej: SE, XLE, Limited).
        - Motor (ej: 2.5L 4-Cyl) y Tracción (AWD, FWD, 4x2).
        - Color exterior e interior.
        - Equipamiento clave (ej: Sunroof, Apple CarPlay, Blind Spot Monitor).
        
        Si es una FOTO DEL AUTO:
        - Estima Marca/Modelo/Año por el diseño.
        - Color visible.
        - Estilo (SUV, Sedan, etc).
        
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
            "type": "SUV" | "Sedan" | "Pickup" | "Luxury" | "Deportivo" | "Compacto",
            "fuelType": "Gasolina" | "Híbrido" | "Eléctrico" | "Diesel",
            "keyFeatures": ["máximo 5 specs"],
            "description": "Pitch corto comercial (max 150 caracteres)"
        }
        `;

    try {
      const data = (await analyzeImageWithPrompt(imageSource, prompt)) as any;

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
      throw new Error('Análisis de Visión fallido. Por favor carga una imagen más clara.', {
        cause: error,
      });
    }
  },
};
