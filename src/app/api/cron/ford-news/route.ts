import { NextResponse } from 'next/server';
import { FordNewsExtractor } from '@/shared/api/scrapers/FordNewsExtractor';
import { FordNewsService } from '@/features/blog/api/fordNewsService';
import { FordNewsBroadcaster } from '@/features/blog/api/FordNewsBroadcaster';
import { supabase } from '@/shared/api/supabase/supabase';
import { createHash } from 'crypto';

export const maxDuration = 300;
export const runtime = 'nodejs';

const FORD_FEEDS = [
  'https://news.google.com/rss/search?q=Ford+Puerto+Rico+2025&hl=es-419&gl=PR&ceid=PR:es-419',
  'https://news.google.com/rss/search?q=Ford+Motor+Company+2025&hl=en-US&gl=US&ceid=US:en',
];

function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').substring(0, 16);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const extractor = new FordNewsExtractor();
  const newsService = new FordNewsService();
  const broadcaster = new FordNewsBroadcaster();

  const results = {
    fetched: 0,
    fordRelated: 0,
    newArticles: 0,
    published: 0,
    notified: 0,
    errors: [] as string[],
  };

  try {
    for (const feedUrl of FORD_FEEDS) {
      const articles = await extractor.fetchLatest({ feedUrl, maxArticles: 15 });
      results.fetched += articles.length;

      for (const article of articles) {
        if (!extractor.isFordRelated(article)) continue;
        results.fordRelated++;

        const hash = urlHash(article.url);

        const { data: existing } = await supabase
          .from('ford_news_cache')
          .select('id')
          .eq('url_hash', hash)
          .maybeSingle();

        if (existing) continue;
        results.newArticles++;

        await supabase.from('ford_news_cache').insert({
          url_hash: hash,
          title: article.title,
          url: article.url,
          source: article.source,
          fetched_at: new Date().toISOString(),
          status: 'new',
        });

        const blogPost = await newsService.generateBlogPost(article);
        if (!blogPost) {
          results.errors.push(`AI generation failed for: ${article.title}`);
          continue;
        }

        const { error: insertError } = await supabase.from('blog_posts').insert({
          title: blogPost.title,
          slug: blogPost.slug,
          excerpt: blogPost.excerpt,
          content: blogPost.content,
          author: blogPost.author,
          tags: blogPost.tags,
          meta_description: blogPost.metaDescription,
          estimated_reading_time: blogPost.estimatedReadingTime,
          ford_news_url: article.url,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          results.errors.push(`Insert failed for ${article.title}: ${insertError.message}`);
          continue;
        }
        results.published++;

        await supabase
          .from('ford_news_cache')
          .update({ status: 'published' })
          .eq('url_hash', hash);

        const { notified } = await broadcaster.broadcast({
          title: blogPost.title,
          slug: blogPost.slug || '',
          excerpt: blogPost.excerpt,
        });
        results.notified += notified;
      }
    }

    return NextResponse.json({
      status: 'success',
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron: FordNews] Error:', error);
    return NextResponse.json(
      { status: 'error', error: error.message, ...results },
      { status: 500 },
    );
  }
}
