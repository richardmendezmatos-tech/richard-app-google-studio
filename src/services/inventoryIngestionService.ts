import { analyzeImageWithPrompt } from './geminiService';
import { Car } from '@/types/types';

export const inventoryIngestionService = {
    /**
     * Process an image (Window Sticker, Auction Sheet, or Car Photo) 
     * and extract structured inventory data.
     */
    processInventoryImage: async (base64Image: string): Promise<Partial<Car>> => {
        const prompt = `
        ANALIZA ESTA IMAGEN DE UN VEHÍCULO O DOCUMENTO.
        
        Tu tarea es extraer la mayor cantidad de datos técnicos y comerciales posibles para crear una ficha de inventario.
        
        Si es un WINDOW STICKER o HOJA DE SUBASTA, extrae los datos exactos.
        Si es una FOTO DEL AUTO, estima los datos visuales.
        
        RETORNA SOLO JSON con este formato (usa null si no puedes determinar el dato):
        {
            "vin": "string o null",
            "year": number,
            "make": "string",
            "model": "string",
            "trim": "string o null",
            "price": number,
            "color": "string",
            "mileage": number,
            "type": "SUV" | "Sedan" | "Pickup" | "Luxury" | "Deportivo" | "Compacto",
            "fuelType": "Gasolina" | "Híbrido" | "Eléctrico" | "Diesel",
            "keyFeatures": ["lista de 5 caracteristicas principales"],
            "description": "Breve descripción comercial para venta (max 2 lineas)"
        }
        `;

        try {
            const data = await analyzeImageWithPrompt(base64Image, prompt);

            // Post-processing / Sanitization if needed
            if (data.year) data.year = Number(data.year);
            if (data.price) data.price = Number(data.price);
            if (data.mileage) data.mileage = Number(data.mileage);

            return data;
        } catch (error) {
            console.error("Inventory Ingestion Error:", error);
            throw new Error("No se pudo procesar la imagen. Intenta con una foto más clara.");
        }
    }
};
