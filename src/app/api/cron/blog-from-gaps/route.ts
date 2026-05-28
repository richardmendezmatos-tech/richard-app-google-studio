import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateStructuredJSON } from '@/shared/api/ai/geminiService';
import { blogService } from '@/entities/blog/api/blogService';

function extractTopic(query: string): string {
  const stopWords = ['como', 'que', 'cuanto', 'donde', 'cual', 'cuando', 'el', 'la', 'los', 'las', 'un', 'una', 'en', 'de', 'para', 'por', 'con', 'del'];
  const words = query.toLowerCase().split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
  return words.slice(0, 3).join(' ');
}

async function getTopicGroups(supabase: any): Promise<Map<string, { query: string; count: number }[]>> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: gaps, error } = await supabase
    .from('search_gaps')
    .select('query, detected_intent, created_at')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false });

  if (error || !gaps) return new Map();

  const groups = new Map<string, { query: string; count: number }[]>();
  for (const gap of gaps) {
    const key = gap.detected_intent || extractTopic(gap.query);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    const existing = groups.get(key)!;
    const match = existing.find(e => e.query === gap.query);
    if (match) match.count++;
    else existing.push({ query: gap.query, count: 1 });
  }
  return groups;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      },
    );

    const [groups, existingPosts] = await Promise.all([
      getTopicGroups(supabase),
      blogService.getBlogPosts(100),
    ]);

    if (groups.size === 0) {
      return NextResponse.json({ status: 'skipped', message: 'No search gaps found in last 7 days' });
    }

    const existingTitles = new Set(existingPosts.map(p => p.title.toLowerCase()));
    const existingSlugs = new Set(existingPosts.map(p => p.slug));
    const existingQueries = new Set(existingPosts.map(p => (p as any).query || '').filter(Boolean));

    let bestTopic: { key: string; query: string; count: number } | null = null;

    for (const [key, items] of groups) {
      if (existingSlugs.has(slugify(key))) continue;
      if (existingTitles.has(key.toLowerCase())) continue;

      const total = items.reduce((sum, i) => sum + i.count, 0);
      const mainQuery = items.sort((a, b) => b.count - a.count)[0].query;

      if (existingQueries.has(mainQuery.toLowerCase())) continue;

      if (!bestTopic || total > bestTopic.count) {
        bestTopic = { key, query: mainQuery, count: total };
      }
    }

    if (!bestTopic) {
      return NextResponse.json({ status: 'skipped', message: 'All topics already covered by existing blog posts' });
    }

    const systemInstruction = `
      Eres el Editor-in-Chief de Richard Automotive Newsroom (Sentinel N24).
      Tu misión es escribir artículos de blog que eduquen, emocionen y conviertan.

      REGLAS:
      1. TONO: Profesional, tecnológico, premium y cercano.
      2. ESTRUCTURA: Título gancho, intro impactante, 3 puntos clave, conclusión con CTA.
      3. LOCALIZACIÓN: Menciona Puerto Rico y pueblos locales.
      4. SEO: Palabras clave de alto volumen (financiamiento, autos nuevos, Ford).
      5. FORMATO: Markdown con H2, H3.
      6. PRIORIDAD FORD: Inyecta beneficios de Ford nuevo (Garantía, Ford Credit, Central Ford).
    `;

    const prompt = `
      Genera un artículo de blog basado en búsquedas reales de usuarios de Puerto Rico.
      Búsqueda principal: "${bestTopic.query}"
      Tema: "${bestTopic.key}"

      Responde en JSON:
      {
        "title": "Título del Artículo (máximo 60 caracteres)",
        "excerpt": "Resumen de 2 líneas para la tarjeta de blog",
        "content": "Contenido completo en Markdown...",
        "tags": ["Tag1", "Tag2"],
        "estimatedReadingTime": "5 min"
      }
    `;

    const result = await generateStructuredJSON(prompt, systemInstruction);

    const slug = slugify(bestTopic.key);

    const newPost = await blogService.createBlogPost({
      title: result.title || bestTopic.key,
      slug,
      excerpt: result.excerpt || `Artículo generado sobre ${bestTopic.key} basado en búsquedas de clientes en Puerto Rico.`,
      content: result.content || '',
      author: 'Richard Automotive AI',
      tags: result.tags || [bestTopic.key, 'Puerto Rico', 'autos'],
      metaDescription: result.excerpt || '',
      estimatedReadingTime: result.estimatedReadingTime || '5 min',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({
      status: 'success',
      message: `Blog post created from search gap: "${bestTopic.key}"`,
      topic: bestTopic.key,
      queries: bestTopic.count,
      slug,
      id: newPost.id,
    });
  } catch (error: any) {
    console.error('[Blog from Gaps] Error:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
