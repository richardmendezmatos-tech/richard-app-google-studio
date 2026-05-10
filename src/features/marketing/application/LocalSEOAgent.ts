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
   * Proposes a reply to a customer review.
   */
  async generateReviewReply(reviewText: string, rating: number, customerName: string) {
    const prompt = `
      Genera una respuesta profesional y agradecida para una reseña de Google de 5 estrellas.
      Cliente: ${customerName}
      Reseña: "${reviewText}"
      Calificación: ${rating}/5
      
      Enfoque: Resalta el compromiso de Richard Automotive con la transparencia y el servicio Sentinel.
    `;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }
}

export const localSEOAgent = new LocalSEOAgent();
