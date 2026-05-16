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
    model: string = 'gemini-2.0-flash'
  ): Promise<z.infer<T>> {
    try {
      const { object } = await generateObject({
        model: google(model),
        schema,
        output: 'object',
        system: system || 'Eres un asistente experto en Richard Automotive.',
        prompt,
      });
      return object as any;
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
    imageSource: string, // base64 or URL
    system: string = 'Eres un vendedor experto de autos. Escribe en español.'
  ): Promise<string> {
    try {
      const isUrl = imageSource.startsWith('http');
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              isUrl 
                ? { type: 'image', image: new URL(imageSource) }
                : { type: 'image', image: imageSource.replace(/^data:image\/\w+;base64,/, '') },
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
   * Analyzes a vehicle image and extracts technical specifications.
   */
  async analyzeVehicleImage(imageSource: string): Promise<any> {
    const schema = z.object({
      make: z.string(),
      model: z.string(),
      year: z.number(),
      color: z.string(),
      type: z.enum(['suv', 'sedan', 'luxury', 'pickup', 'coupe', 'hatchback']),
      condition: z.enum(['new', 'used']),
      key_features: z.array(z.string()),
      confidence: z.number().min(0).max(1),
    });

    try {
      const isUrl = imageSource.startsWith('http');
      const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema,
        output: 'object',
        system: 'Eres un analista técnico de inventario automotriz experto en reconocimiento visual.',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analiza esta imagen y extrae los detalles técnicos del vehículo.' },
              isUrl 
                ? { type: 'image', image: new URL(imageSource) }
                : { type: 'image', image: imageSource.replace(/^data:image\/\w+;base64,/, '') },
            ],
          },
        ],
      });
      return object;
    } catch (error: any) {
      this.logError('AnalyzeVehicleImage', error);
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
        model: google('gemini-2.0-flash'),
        schema,
        output: 'object',
        system: `Eres un experto en ventas de autos para Richard Automotive en Puerto Rico. 
        Tu tono es profesional, persuasivo y utiliza términos locales como "guagua", "unidad" y "pronto".`,
        prompt: `Genera un "Sales Pitch" (máximo 280 caracteres) y un "Perfil de Comprador Ideal" para esta unidad: ${content}`,
      });

      return {
        salesPitch: (object as any).sales_pitch,
        idealBuyer: (object as any).ideal_buyer,
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
        model: google('gemini-2.0-flash'),
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
   * Extracts structured search intent from a natural language query.
   */
  async extractSearchIntent(query: string) {
    const schema = z.object({
      budget: z.object({
        maxPrice: z.number().optional(),
        maxMonthlyPayment: z.number().optional(),
      }).optional(),
      vehicleConstraints: z.object({
        minSeats: z.number().optional(),
        type: z.string().optional(),
        features: z.array(z.string()).optional(),
      }).optional(),
      lifestyle: z.array(z.string()),
      refinedQuery: z.string(),
      justification_template: z.string().describe('Un template breve de por qué este tipo de auto encaja. Ej: "Ideal para tus aventuras en la montaña"'),
    });

    try {
      return await this.generateStructuredObject(
        schema,
        `Analiza la siguiente consulta de búsqueda de un cliente de Richard Automotive en Puerto Rico: "${query}"
        
        Extrae los parámetros estructurados. Si el cliente menciona "guagua", asume tipo "SUV" o "Truck".
        Si menciona un presupuesto mensual, ponlo en maxMonthlyPayment.
        Lifestyle tags sugeridos: family, adventure, luxury, budget, performance, work, eco.`,
        'Eres un analista de intención experto en el mercado automotriz de Puerto Rico.'
      );
    } catch (error) {
      this.logError('ExtractIntent', error);
      return {
        lifestyle: ['standard'],
        refinedQuery: query,
        justification_template: 'Basado en tu búsqueda general.'
      };
    }
  },

  /**
   * Internal logging helper
   */
  logError(operation: string, error: any) {
    console.error(`❌ [Sentinel AI] ${operation} Failed:`, error);
    getAuditRepository().then(repo => repo.log(
      'error',
      `AI Failure: ${operation}`,
      { error: error.message, stack: error.stack },
      'SentinelAI'
    )).catch(() => {});
  }
};
