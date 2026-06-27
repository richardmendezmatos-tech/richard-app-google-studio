import { NextResponse } from 'next/server';
import { FordNewsExtractor } from '@/shared/api/scrapers/FordNewsExtractor';
import { FordNewsService } from '@/features/blog/api/fordNewsService';
import { FordNewsBroadcaster } from '@/features/blog/api/FordNewsBroadcaster';
import { blogService } from '@/entities/blog/api/blogService';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').substring(0, 16);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const results: Record<string, any> = {
    fetched: 0,
    fordRelated: 0,
    newArticles: 0,
    published: 0,
    notified: 0,
    errors: [],
  };

  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client unavailable' }, { status: 503 });
    }
    const extractor = new FordNewsExtractor();
    const newsService = new FordNewsService();
    const broadcaster = new FordNewsBroadcaster();

    const feedUrls = [
      'https://media.ford.com/content/fordmedia/fna/us/en/news.feed.rss',
      'https://media.ford.com/content/fordmedia/fna/us/en/products.feed.rss',
    ];

    let articles: Awaited<ReturnType<typeof extractor.fetchLatest>> = [];
    for (const feedUrl of feedUrls) {
      const fetched = await extractor.fetchLatest({ feedUrl, maxArticles: 5 });
      articles = [...articles, ...fetched];
    }
    // Deduplicate by URL
    const seen = new Set<string>();
    articles = articles.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });
    results.fetched = articles.length;

    for (const article of articles) {
      if (!extractor.isFordRelated(article)) continue;
      results.fordRelated++;

      const hash = urlHash(article.url);
      
      // Check if we already fetched/processed this article in ford_news_cache
      const { data: existing, error: fetchError } = await supabase
        .from('ford_news_cache')
        .select('id, status')
        .eq('url_hash', hash)
        .maybeSingle();

      if (fetchError) {
        results.errors.push(`Cache fetch error for ${article.title}: ${fetchError.message}`);
        continue;
      }

      if (existing) {
        continue; // Already processed
      }

      results.newArticles++;

      // Insert into cache to prevent double-processing
      const { error: insertCacheError } = await supabase
        .from('ford_news_cache')
        .insert({
          url_hash: hash,
          title: article.title,
          url: article.url,
          source: article.source,
          fetched_at: new Date().toISOString(),
          status: 'new',
        });

      if (insertCacheError) {
        results.errors.push(`Cache insert error for ${article.title}: ${insertCacheError.message}`);
        continue;
      }

      // Generate blog post via Gemini
      const blogPost = await newsService.generateBlogPost(article);
      if (!blogPost) {
        results.errors.push(`AI generation failed for: ${article.title}`);
        continue;
      }

      // Check if the slug already exists in blog_posts (secondary protection)
      const { data: existingSlug } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', blogPost.slug)
        .maybeSingle();

      if (existingSlug) {
        results.errors.push(`Blog post slug already exists: ${blogPost.slug}`);
        continue;
      }

      // Persist blog post
      try {
        const createdPost = await blogService.createBlogPost({
          title: blogPost.title,
          slug: blogPost.slug,
          excerpt: blogPost.excerpt,
          content: blogPost.content,
          author: blogPost.author,
          tags: blogPost.tags,
          metaDescription: blogPost.metaDescription,
          estimatedReadingTime: blogPost.estimatedReadingTime,
          imageUrl: article.imageUrl || '',
          date: new Date().toISOString().split('T')[0],
        });

        // Also update the ford_news_url on the blog_posts table (SupabaseBlogRepository creates it, but it might not have the field so we can update or just rely on SupabaseBlogRepository)
        // Since custom fields aren't in SupabaseBlogRepository Omit<BlogPost, 'id'>, we can update it if needed. Let's do a direct update or let it be.
        if (createdPost && createdPost.id) {
          await supabase
            .from('blog_posts')
            .update({ ford_news_url: article.url })
            .eq('id', createdPost.id);
        }

        results.published++;

        // Submit new post URL to Google Indexing API + IndexNow for immediate discovery
        if (blogPost.slug) {
          try {
            const { submitUrlToGoogle, submitUrlIndexNow } = await import('@/shared/api/seo/gscService');
            const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.richard-automotive.com'}/blog/${blogPost.slug}`;
            await Promise.allSettled([
              submitUrlToGoogle(postUrl, 'URL_UPDATED'),
              submitUrlIndexNow(postUrl),
            ]);
          } catch (indexErr) {
            console.warn('[news-sync] Indexing submission failed (non-fatal):', indexErr);
          }
        }

        // Update status in cache
        await supabase
          .from('ford_news_cache')
          .update({ status: 'published' })
          .eq('url_hash', hash);

        // Broadcast to WhatsApp leads
        const { notified } = await broadcaster.broadcast({
          title: blogPost.title,
          slug: blogPost.slug || '',
          excerpt: blogPost.excerpt,
        });

        results.notified += notified;
      } catch (saveError: any) {
        results.errors.push(`Save blog post error for ${article.title}: ${saveError.message}`);
      }
    }

    const hasError = results.errors.length > 0;
    return NextResponse.json(
      { success: !hasError, results },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CRON News Sync] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
