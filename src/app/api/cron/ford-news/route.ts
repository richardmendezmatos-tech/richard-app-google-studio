import { NextResponse } from 'next/server';
import { FordNewsExtractor } from '@/shared/api/scrapers/FordNewsExtractor';
import { FordNewsService } from '@/features/blog/api/fordNewsService';
import { FordNewsBroadcaster } from '@/features/blog/api/FordNewsBroadcaster';
import { supabase } from '@/shared/api/supabase/supabase';
import { createHash } from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateStructuredJSON } from '@/shared/api/ai/geminiService';
import { blogService } from '@/entities/blog/api/blogService';

export const maxDuration = 300;
export const runtime = 'nodejs';

const FORD_FEEDS = [
  'https://news.google.com/rss/search?q=Ford+Puerto+Rico+2025&hl=es-419&gl=PR&ceid=PR:es-419',
  'https://news.google.com/rss/search?q=Ford+Motor+Company+2025&hl=en-US&gl=US&ceid=US:en',
];

function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').substring(0, 16);
}

function extractTopic(query: string): string {
  const stopWords = ['como', 'que', 'cuanto', 'donde', 'cual', 'cuando', 'el', 'la', 'los', 'las', 'un', 'una', 'en', 'de', 'para', 'por', 'con', 'del'];
  const words = query.toLowerCase().split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
  return words.slice(0, 3).join(' ');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
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

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fordResults = {
    fetched: 0,
    fordRelated: 0,
    newArticles: 0,
    published: 0,
    notified: 0,
    errors: [] as string[],
  };

  const extractor = new FordNewsExtractor();
  const newsService = new FordNewsService();
  const broadcaster = new FordNewsBroadcaster();

  try {
    // — Ford News —
    for (const feedUrl of FORD_FEEDS) {
      const articles = await extractor.fetchLatest({ feedUrl, maxArticles: 15 });
      fordResults.fetched += articles.length;

      for (const article of articles) {
        if (!extractor.isFordRelated(article)) continue;
        fordResults.fordRelated++;

        const hash = urlHash(article.url);
        const { data: existing } = await supabase
          .from('ford_news_cache')
          .select('id')
          .eq('url_hash', hash)
          .maybeSingle();
        if (existing) continue;
        fordResults.newArticles++;

        await supabase.from('ford_news_cache').insert({
          url_hash: hash, title: article.title, url: article.url,
          source: article.source, fetched_at: new Date().toISOString(), status: 'new',
        });

        const blogPost = await newsService.generateBlogPost(article);
        if (!blogPost) { fordResults.errors.push(`AI generation failed for: ${article.title}`); continue; }

        const { error: insertError } = await supabase.from('blog_posts').insert({
          title: blogPost.title, slug: blogPost.slug, excerpt: blogPost.excerpt,
          content: blogPost.content, author: blogPost.author, tags: blogPost.tags,
          meta_description: blogPost.metaDescription,
          estimated_reading_time: blogPost.estimatedReadingTime,
          ford_news_url: article.url,
          published_at: new Date().toISOString(), created_at: new Date().toISOString(),
        });

        if (insertError) { fordResults.errors.push(`Insert failed for ${article.title}: ${insertError.message}`); continue; }
        fordResults.published++;

        await supabase.from('ford_news_cache').update({ status: 'published' }).eq('url_hash', hash);

        const { notified } = await broadcaster.broadcast({ title: blogPost.title, slug: blogPost.slug || '', excerpt: blogPost.excerpt });
        fordResults.notified += notified;
      }
    }

    // — Blog from Gaps (merged from blog-from-gaps cron) —
    let gapResult: Record<string, any> = { status: 'skipped' };
    try {
      const cookieStore = await cookies();
      const sb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } },
      );

      const [groups, existingPosts] = await Promise.all([
        getTopicGroups(sb),
        blogService.getBlogPosts(100),
      ]);

      if (groups.size > 0) {
        const existingTitles = new Set(existingPosts.map(p => p.title.toLowerCase()));
        const existingSlugs = new Set(existingPosts.map(p => p.slug));

        let bestTopic: { key: string; query: string; count: number } | null = null;
        for (const [key, items] of groups) {
          if (existingSlugs.has(slugify(key))) continue;
          if (existingTitles.has(key.toLowerCase())) continue;
          const total = items.reduce((sum, i) => sum + i.count, 0);
          const mainQuery = items.sort((a, b) => b.count - a.count)[0].query;
          if (!bestTopic || total > bestTopic.count) bestTopic = { key, query: mainQuery, count: total };
        }

        if (bestTopic) {
          const systemInstruction = `Eres el Editor-in-Chief de Richard Automotive Newsroom. REGLAS: 1. TONO: Profesional, tecnológico, premium y cercano. 2. ESTRUCTURA: Título gancho, intro impactante, 3 puntos clave, conclusión con CTA. 3. LOCALIZACIÓN: Menciona Puerto Rico y pueblos locales. 4. SEO: Palabras clave de alto volumen. 5. FORMATO: Markdown con H2, H3. 6. PRIORIDAD FORD: Inyecta beneficios de Ford nuevo.`;

          const prompt = `Genera un artículo de blog basado en búsquedas reales de usuarios de Puerto Rico. Búsqueda principal: "${bestTopic.query}". Tema: "${bestTopic.key}". Responde en JSON: { "title": "Título (máx 60 caracteres)", "excerpt": "Resumen 2 líneas", "content": "Markdown completo", "tags": ["Tag1", "Tag2"], "estimatedReadingTime": "5 min" }`;

          const result = await generateStructuredJSON(prompt, systemInstruction);
          const slug = slugify(bestTopic.key);

          await blogService.createBlogPost({
            title: result.title || bestTopic.key, slug,
            excerpt: result.excerpt || `Artículo sobre ${bestTopic.key} basado en búsquedas de clientes.`,
            content: result.content || '', author: 'Richard Automotive AI',
            tags: result.tags || [bestTopic.key, 'Puerto Rico', 'autos'],
            metaDescription: result.excerpt || '',
            estimatedReadingTime: result.estimatedReadingTime || '5 min',
            imageUrl: '', date: new Date().toISOString().split('T')[0],
          });

          gapResult = { status: 'success', topic: bestTopic.key, queries: bestTopic.count, slug };
        }
      }
    } catch (gapError: any) {
      console.error('[Cron:FordNews] Blog from gaps error:', gapError);
      gapResult = { status: 'error', error: gapError.message };
    }

    return NextResponse.json({
      status: 'success',
      fordNews: fordResults,
      blogFromGaps: gapResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron: FordNews] Error:', error);
    return NextResponse.json(
      { status: 'error', error: error.message, fordNews: fordResults },
      { status: 500 },
    );
  }
}
