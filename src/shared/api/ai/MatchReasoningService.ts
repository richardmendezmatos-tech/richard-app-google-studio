import { z } from 'zod';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { Car } from '@/shared/types/types';
import { Lead } from '@/shared/types/lead';

export const MatchIntelligenceSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
  whatsappDraft: z.string(),
  confidence: z.number().min(0).max(1),
});

export type MatchIntelligence = z.infer<typeof MatchIntelligenceSchema>;

const MATCH_SYSTEM = `Eres el "Neural Match v3" Engine para Richard Automotive Command Center.
Encuentra conexiones profundas entre un vehículo y un cliente potencial.
Evalúa: compatibilidad de presupuesto, alineación técnica (tipo vs preferencias),
y alineación psicológica (Analítico → especificaciones/durabilidad, Relacional → seguridad/espacio).
Proporciona reasoning en español (Nivel 16 - Premium, data-driven).
whatsappDraft en español de Puerto Rico, cálido pero profesional.`;

/**
 * MatchReasoningService: High-level AI matching logic for Neural Match v3.
 * Cross-references car technical specs with lead psychological and financial profiles.
 * Uses structured object generation via Sentinel AI for type-safe output.
 */
export class MatchReasoningService {
  static async analyzeMatchIntelligence(car: Car, lead: Lead): Promise<MatchIntelligence> {
    const leadContext = {
      name: `${lead.firstName} ${lead.lastName}`,
      preferences: (lead as any).customerMemory?.preferences || {},
      cognitiveProfile:
        (lead as any).customerMemory?.l2_contextual?.detectedPreferences?.cognitiveProfile ||
        'General',
      budget: (lead as any).aiAnalysis?.budget || (lead as any).monthlyIncome || 'Not specified',
      notes: lead.notes || lead.message || 'No additional notes',
    };

    const carContext = {
      name: car.name,
      type: car.type,
      price: car.price,
      features: car.description,
      specs: {
        engine: (car as any).engine,
        transmission: (car as any).transmission,
        exteriorColor: (car as any).exteriorColor,
      },
    };

    const prompt = `
CLIENT DATA:
- Name: ${leadContext.name}
- Preferences: ${JSON.stringify(leadContext.preferences)}
- Cognitive Profile: ${leadContext.cognitiveProfile}
- Budget/Income: ${leadContext.budget}
- Notes: ${leadContext.notes}

VEHICLE DATA:
- Model: ${carContext.name}
- Type: ${carContext.type}
- Price: $${carContext.price}
- Features: ${carContext.features}
- Specs: ${JSON.stringify(carContext.specs)}

Return a JSON object with:
- score (0-100): match score based on budget compatibility, technical alignment, psychological alignment
- reasoning (string): explanation in Spanish
- whatsappDraft (string): personalized message in Spanish PR style
- confidence (0-1): how confident you are in this match
    `;

    try {
      const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: MatchIntelligenceSchema,
        output: 'object',
        system: MATCH_SYSTEM,
        prompt,
      });
      return object as MatchIntelligence;
    } catch (error) {
      console.error('[MatchReasoningService] Error:', error);
      return {
        score: 50,
        reasoning: 'Match técnico basado en presupuesto y tipo de unidad.',
        whatsappDraft: `Hola ${leadContext.name}, te escribo de Richard Automotive. Acaba de llegar una unidad ${carContext.name} que podría interesarte. ¡Avísame si quieres verla!`,
        confidence: 0.5,
      };
    }
  }
}
