import { ai } from '../services/aiManager';
import { z } from 'genkit';
import * as logger from 'firebase-functions/logger';

export const VisionAppraisalSchema = z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    vin: z.string().optional(),
    condition: z.enum(['excellent', 'good', 'fair', 'poor']),
    damages: z.array(z.object({
        area: z.string(),
        description: z.string(),
        severity: z.enum(['low', 'medium', 'high'])
    })),
    appraisalValue: z.number().optional(),
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
                    text: `Eres un tasador experto de vehículos en Puerto Rico. 
                Analiza esta foto y detecta:
                1. Datos del auto: Marca, modelo, año aproximado.
                2. VIN/Tablilla: Encuentra el VIN o placa (tablilla) si es visible.
                3. Estado Estético: Clasifica como 'excellent', 'good', 'fair', o 'poor'.
                4. Daños Detallados: Lista cada rayazo, abolladura o pieza rota indicando su área (ej. 'parachoques frontal'), descripción y severidad.
                
                IMPORTANTE: Responde ÚNICAMENTE en JSON con el esquema: 
                { "make": "...", "model": "...", "year": 2020, "vin": "...", "condition": "...", "damages": [{ "area": "...", "description": "...", "severity": "..." }] }` }
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
