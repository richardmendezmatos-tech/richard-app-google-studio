import { ai } from '../../services/aiManager';
import * as logger from 'firebase-functions/logger';
import { z } from 'genkit';

export interface FAQItem {
  question: string;
  answer: string;
}

const FAQSchema = z.array(z.object({
  question: z.string(),
  answer: z.string()
}));

export async function generateAutoFaqsForVehicle(carName: string, brand: string, price: number): Promise<FAQItem[]> {
  try {
    const prompt = `Eres un experto automotriz trabajando para Richard Automotive en Puerto Rico. Genera exactamente 3 preguntas y respuestas frecuentes que tendría un comprador local sobre este vehículo específico: ${carName} (${brand}) con un precio de $${price}. Considera aspectos como consumo de gasolina, confiabilidad, costos de mantenimiento o características locales de PR (como el calor o piezas). Las respuestas deben ser concisas, persuasivas y optimizadas para SEO.`;

    const result = await ai.generate({
      prompt: prompt,
      output: { schema: FAQSchema },
    });

    const faqs = result.output;
    if (faqs && Array.isArray(faqs)) {
      return faqs;
    }
    
    return [];
  } catch (error) {
    logger.error(`Error generating auto FAQs for ${carName}:`, error);
    return [];
  }
}
