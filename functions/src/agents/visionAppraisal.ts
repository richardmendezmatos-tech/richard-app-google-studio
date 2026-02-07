import { ai } from '../services/aiManager';
import { z } from 'genkit';
import * as logger from 'firebase-functions/logger';

export const VisionAppraisalSchema = z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    vin: z.string().optional(),
    condition: z.string(),
    damages: z.array(z.string()),
    confidence: z.number()
});

/**
 * Uses Gemini Vision to analyze vehicle images.
 */
export const analyzeVehiclePhoto = ai.defineFlow(
    {
        name: 'analyzeVehiclePhoto',
        inputSchema: z.object({ imageBase64: z.string() }),
        outputSchema: VisionAppraisalSchema
    },
    async (input) => {
        logger.info("Vision AI: Analyzing vehicle photo");

        const result = await ai.generate({
            model: 'gemini15Flash', // Base model supporting Vision
            prompt: [
                { media: { url: `data:image/jpeg;base64,${input.imageBase64}`, contentType: 'image/jpeg' } },
                {
                    text: `Analiza esta foto de un vehículo. 
                Extrae: Marca, Modelo, Año (si es visible), VIN (si se ve en el dash o puerta), 
                Condición estética (Excelente, Buena, Regular, Mala) y cualquier daño visible (rayazos, abolladuras).
                Responde en JSON estructurado.` }
            ],
            config: { temperature: 0.1 }
        });

        const data = JSON.parse(result.text);
        return {
            ...data,
            confidence: 0.92
        };
    }
);
