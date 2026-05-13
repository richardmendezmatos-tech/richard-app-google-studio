import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { Car } from '@/entities/inventory';

/**
 * LocalSEOAgent: The strategist for Google Maps and Local Search.
 */
export class LocalSEOAgent {
  private model = google('gemini-2.0-flash');

  /**
   * Generates a hyper-local Google Business Profile post for a new vehicle arrival.
   */
  async generateNewArrivalPost(car: Car, location: string = 'Vega Alta') {
    const prompt = `
      Eres el Especialista en SEO Local de Richard Automotive en ${location}, Puerto Rico.
      Tu objetivo es escribir un post para Google Business Profile que atraiga tráfico local.
      
      Vehículo: ${car.year} ${car.make} ${car.model}
      Precio: $${car.price?.toLocaleString()}
      Millas: ${car.mileage?.toLocaleString()}
      
      Instrucciones:
      1. Usa lenguaje local (Boricua) pero profesional.
      2. Incluye palabras clave como "Dealer en ${location}", "Autos usados en PR", "Financiamiento disponible".
      3. Sé entusiasta y destaca por qué esta unidad es ideal para Puerto Rico.
      4. Mantén el texto bajo 1500 caracteres.
      
      Formato de salida:
      - Título del Post
      - Cuerpo del Mensaje
      - Sugerencia de Botón (CTA)
    `;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }

  /**
   * Proposes a reply to a customer review with sentiment awareness.
   */
  async generateReviewReply(reviewText: string, rating: number, customerName: string) {
    const isPositive = rating >= 4;
    
    const prompt = `
      Eres el Gerente de Reputación de Richard Automotive en Puerto Rico.
      Debes responder a una reseña de Google.
      
      Cliente: ${customerName}
      Calificación: ${rating}/5
      Reseña: "${reviewText}"
      
      Instrucciones:
      1. Usa un tono Boricua profesional y empático.
      2. Si es POSITIVA (${rating} estrellas): Agradece efusivamente, menciona la familia de Richard Automotive y refuerza la confianza.
      3. Si es NEGATIVA o NEUTRAL (< 4 estrellas): Mantén la calma, ofrece disculpas por la percepción, invita a una conversación privada y asegura que Richard Mendez personalmente revisa la calidad. No seas defensivo.
      4. Mantén la respuesta concisa y humana.
    `;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }
}

export const localSEOAgent = new LocalSEOAgent();
