import { z } from 'zod';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { FordNewsArticle } from '@/shared/api/scrapers/FordNewsExtractor';
import { BlogPost } from '@/shared/types/types';

const BlogPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  estimatedReadingTime: z.string(),
  metaDescription: z.string(),
  imagePrompt: z.string(),
});

export class FordNewsService {
  async generateBlogPost(news: FordNewsArticle): Promise<BlogPost | null> {
    const systemPrompt = `
      Eres el Editor-in-Chief de Richard Automotive Newsroom (Sentinel N24).
      Tu misión es transformar noticias de Ford en artículos de blog localizados para Puerto Rico.
      REGLAS:
      1. Tono profesional, tecnológico y cercano ("Enfoque Houston").
      2. Traduce al español de Puerto Rico (usa: guagua, pronto, marbete, unidad).
      3. Menciona Richard Automotive en Vega Alta como tu concesionario de confianza.
      4. Incluye contexto local: financiamiento, bancos de PR, tazas, mercado de autos en la isla.
      5. SEO: palabras clave: Ford, Puerto Rico, financiamiento, autos nuevos, concesionario.
      6. Estructura: título gancho, intro impactante, 3 puntos clave, conclusión con CTA.
      7. El contenido debe ir en HTML simple (<p>, <h2>, <h3>, <ul>, <strong>).
      8. Genera un slug amigable para URL.
      9. Cuando hables de un modelo específico de Ford (Explorer, F-150, Mustang, Bronco, Ranger, Edge, Escape, etc.), incluye un enlace a /inventario/ford-{modelo} o /autos-usados/{marca}/{modelo} al menos una vez en el contenido.
      10. NO inventar fechas ni datos falsos. Basarte solo en la noticia proporcionada.
    `;

    const prompt = `
      Transforma la siguiente noticia de Ford en un artículo de blog optimizado para Puerto Rico:
      Título: ${news.title}
      Descripción: ${news.description}
      Fuente: ${news.source}
      Categorías: ${news.categories.join(', ')}
      Fecha: ${news.pubDate}
    `;

    try {
      const result = await sentinelAI.generateStructuredObject(
        BlogPostSchema,
        prompt,
        systemPrompt,
        'gemini-2.0-flash',
      );

      return {
        id: `ford-${Date.now()}`,
        title: result.title,
        slug: result.slug,
        excerpt: result.excerpt,
        content: result.content,
        author: 'Richard AI Newsroom',
        date: new Date().toLocaleDateString('es-PR', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
        tags: result.tags,
        metaDescription: result.metaDescription,
        estimatedReadingTime: result.estimatedReadingTime,
      };
    } catch (error) {
      console.error('[FordNewsService] Error generating blog post:', error);
      return null;
    }
  }
}
