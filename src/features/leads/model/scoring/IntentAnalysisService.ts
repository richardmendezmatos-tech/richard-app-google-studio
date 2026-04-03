import { generateStructuredJSON } from '@/shared/api/ai/geminiService';

export interface IntentMatrix {
  urgency: number; // 0.0 - 1.0
  priceSensitivity: number; // 0.0 - 1.0
  brandLoyalty: number; // 0.0 - 1.0
  decisionMaturity: number; // 0.0 - 1.0
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

/**
 * IntentAnalysisService: El Cerebro de la Omnipresencia Predictiva (Nivel 17).
 * Utiliza IA para transformar interacciones en matrices de decisión accionables.
 */
export class IntentAnalysisService {
  /**
   * Extrae la matriz de intención de un texto de interacción.
   */
  async extractIntent(text: string): Promise<IntentMatrix> {
    const prompt = `
      Analiza la intención de este cliente de Richard Automotive basado en su mensaje: "${text}".
      
      Debes devolver un JSON con la siguiente estructura:
      {
        "urgency": (número 0 a 1.0, donde 1.0 es "necesito el auto hoy"),
        "priceSensitivity": (número 0 a 1.0, donde 1.0 es "el precio es el factor determinante"),
        "brandLoyalty": (número 0 a 1.0, donde 1.0 es "solo quiero esta marca específica"),
        "decisionMaturity": (número 0 a 1.0, donde 1.0 es "ya investigó y está listo para firmar"),
        "sentiment": "Positive" | "Neutral" | "Negative"
      }
    `;

    try {
      const matrix = await generateStructuredJSON(prompt, "Eres un experto en F&I y psicología de ventas automotrices.", "gemini-1.5-flash");
      return {
        urgency: matrix.urgency || 0.5,
        priceSensitivity: matrix.priceSensitivity || 0.5,
        brandLoyalty: matrix.brandLoyalty || 0.5,
        decisionMaturity: matrix.decisionMaturity || 0.5,
        sentiment: matrix.sentiment || 'Neutral'
      };
    } catch (error) {
      console.error('Error extracting intent matrix:', error);
      return {
        urgency: 0.5,
        priceSensitivity: 0.5,
        brandLoyalty: 0.5,
        decisionMaturity: 0.5,
        sentiment: 'Neutral'
      };
    }
  }

  /**
   * Calcula la "Sentiment Velocity" comparando dos matrices.
   */
  calculateVelocity(previous: IntentMatrix, current: IntentMatrix): number {
    const prevScore = (previous.urgency + previous.decisionMaturity) / 2;
    const currScore = (current.urgency + current.decisionMaturity) / 2;
    return currScore - prevScore;
  }
}

export const intentAnalysisService = new IntentAnalysisService();
