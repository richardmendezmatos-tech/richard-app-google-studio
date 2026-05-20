import { generateObject } from 'ai';
import { gemini15Flash } from '../../services/aiManager';
import { z } from 'zod';

export interface FAQItem {
  question: string;
  answer: string;
}

const FAQSchema = z.array(
  z.object({
    question: z.string(),
    answer: z.string(),
  }),
);

export async function generateAutoFaqsForVehicle(
  carName: string,
  brand: string,
  price: number,
): Promise<FAQItem[]> {
  try {
    const prompt = `Eres un experto automotriz trabajando para Richard Automotive en Puerto Rico. Genera exactamente 3 preguntas y respuestas frecuentes que tendría un comprador local sobre este vehículo específico: ${carName} (${brand}) con un precio de $${price}. Considera aspectos como consumo de gasolina, confiabilidad, costos de mantenimiento o características locales de PR (como el calor o piezas). Las respuestas deben ser concisas, persuasivas y optimizadas para SEO.`;

    const result = await generateObject({
      model: gemini15Flash,
      schema: FAQSchema,
      prompt: prompt,
    });

    const faqs = result.object;
    if (faqs && Array.isArray(faqs)) {
      return faqs as FAQItem[];
    }

    return [];
  } catch (error) {
    console.error(`Error generating auto FAQs for ${carName}:`, error);
    return [];
  }
}
