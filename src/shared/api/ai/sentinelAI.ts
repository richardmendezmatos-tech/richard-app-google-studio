import { google } from '@ai-sdk/google';
import { generateText, embed, embedMany, generateObject } from 'ai';
import { z } from 'zod';
import { getAuditRepository } from '@/shared/api/houston/AuditRepositoryProvider';

/**
 * Sentinel AI Core Service
 * Standardized AI interactions using Vercel AI SDK and Google Gemini.
 * Part of the Richard Automotive Nivel 16 Hardening Protocol.
 */
export const sentinelAI = {
  /**
   * Generates a persistent embedding for vehicle data.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: text,
      });
      return embedding;
    } catch (error: any) {
      this.logError('Embedding', error);
      throw error;
    }
  },

  /**
   * Generates a structured object using Zod schema validation.
   */
  async generateStructuredObject<T extends z.ZodTypeAny>(
    schema: T,
    prompt: string,
    system?: string,
    model: string = 'gemini-1.5-flash'
  ): Promise<z.infer<T>> {
    try {
      const { object } = await generateObject({
        model: google(model),
        schema,
        system: system || 'Eres un asistente experto en Richard Automotive.',
        prompt,
      });
      return object;
    } catch (error: any) {
      this.logError('StructuredObject', error);
      throw error;
    }
  },

  /**
   * Generates a vision-based description for a vehicle image.
   */
  async generateVisionDescription(
    prompt: string,
    imageSource: string, // base64
    system: string = 'Eres un vendedor experto de autos. Escribe en español.'
  ): Promise<string> {
    try {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        system,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: imageSource.replace(/^data:image\/\w+;base64,/, '') },
            ],
          },
        ],
      });
      return text;
    } catch (error: any) {
      this.logError('VisionDescription', error);
      throw error;
    }
  },

  /**
   * Generates multiple embeddings in bulk.
   */
  async generateBulkEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const { embeddings } = await embedMany({
        model: google.textEmbeddingModel('text-embedding-004'),
        values: texts,
      });
      return embeddings;
    } catch (error: any) {
      this.logError('BulkEmbeddings', error);
      throw error;
    }
  },

  /**
   * Generates structured intelligence for vehicle inventory.
   */
  async generateInventoryIntelligence(content: string): Promise<{ salesPitch: string; idealBuyer: string }> {
    try {
      const schema = z.object({
        sales_pitch: z.string(),
        ideal_buyer: z.string(),
      });

      const { object } = await generateObject({
        model: google('gemini-1.5-flash'),
        schema,
        system: `Eres un experto en ventas de autos para Richard Automotive en Puerto Rico. 
        Tu tono es profesional, persuasivo y utiliza términos locales como "guagua", "unidad" y "pronto".`,
        prompt: `Genera un "Sales Pitch" (máximo 280 caracteres) y un "Perfil de Comprador Ideal" para esta unidad: ${content}`,
      });

      return {
        salesPitch: object.sales_pitch,
        idealBuyer: object.ideal_buyer,
      };
    } catch (error: any) {
      this.logError('InventoryIntelligence', error);
      return {
        salesPitch: 'Unidad excepcional disponible en Richard Automotive.',
        idealBuyer: 'Cualquier cliente buscando calidad y valor.',
      };
    }
  },

  /**
   * Generic text generation for administrative tasks.
   */
  async quickGen(prompt: string, system?: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        system: system || 'Eres un asistente administrativo para Richard Automotive.',
        prompt,
      });
      return text;
    } catch (error: any) {
      this.logError('QuickGen', error);
      return '';
    }
  },

  /**
   * Internal logging helper
   */
  logError(operation: string, error: any) {
    console.error(`❌ [Sentinel AI] ${operation} Failed:`, error);
    getAuditRepository().then(repo => repo.log({
      type: 'error',
      message: `AI Failure: ${operation}`,
      source: 'SentinelAI',
      metadata: { error: error.message, stack: error.stack }
    })).catch(() => {});
  }
};
