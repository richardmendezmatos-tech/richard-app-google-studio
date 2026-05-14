import { Car } from '@/shared/types/types';
import { Lead } from '@/shared/types/lead';

export interface MatchIntelligence {
    score: number;
    reasoning: string;
    whatsappDraft: string;
    confidence: number;
}

/**
 * MatchReasoningService: High-level AI matching logic for Neural Match v3.
 * Cross-references car technical specs with lead psychological and financial profiles.
 */
export class MatchReasoningService {
    
    /**
     * Analyzes why a specific car matches a lead using LLM intelligence.
     */
    static async analyzeMatchIntelligence(car: Car, lead: Lead): Promise<MatchIntelligence> {
        const leadContext = {
            name: `${lead.firstName} ${lead.lastName}`,
            preferences: (lead as any).customerMemory?.preferences || {},
            cognitiveProfile: (lead as any).customerMemory?.l2_contextual?.detectedPreferences?.cognitiveProfile || 'General',
            budget: (lead as any).aiAnalysis?.budget || (lead as any).monthlyIncome || 'Not specified',
            notes: lead.notes || lead.message || 'No additional notes'
        };

        const carContext = {
            name: car.name,
            type: car.type,
            price: car.price,
            features: car.description,
            specs: {
                engine: (car as any).engine,
                transmission: (car as any).transmission,
                exteriorColor: (car as any).exteriorColor
            }
        };

        const prompt = `
            You are the "Neural Match v3" Engine for Richard Automotive Command Center.
            Your mission is to find the deep psychological and technical connection between a vehicle and a potential client.

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

            INSTRUCTIONS:
            1. Calculate a MATCH SCORE (0-100) based on:
               - Budget compatibility (is it realistic?)
               - Technical alignment (type of car vs preferences)
               - Psychological alignment (e.g., an 'Analytical' person wants specs/durability, a 'Relational' person wants safety/space).
            2. Provide REASONING in Spanish (Nivel 16 - Premium, convincing, data-driven).
            3. Write a WHATSAPP DRAFT (Spanish, Puerto Rico style - warm, professional, mentions specific features that match the client's needs). Use emojis sparingly.

            OUTPUT STRICTLY VALID JSON:
            {
                "score": number,
                "reasoning": "string",
                "whatsappDraft": "string",
                "confidence": number
            }
        `;

        try {
            // Calling our internal Gemini API via server-side fetch (since we are in the server layer)
            // Note: In Next.js server-side, we might need an absolute URL or call the service directly.
            // For now, assuming a helper that uses the Gemini API Key directly is safer for background tasks.
            const { generateText } = await import('./geminiService');
            const responseText = await generateText(prompt);
            
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid AI Response format');

            return JSON.parse(jsonMatch[0]) as MatchIntelligence;
        } catch (error) {
            console.error('[MatchReasoningService] Error:', error);
            return {
                score: 50,
                reasoning: 'Match técnico basado en presupuesto y tipo de unidad.',
                whatsappDraft: `Hola ${leadContext.name}, te escribo de Richard Automotive. Acaba de llegar una unidad ${carContext.name} que podría interesarte. ¡Avísame si quieres verla!`,
                confidence: 0.5
            };
        }
    }
}
