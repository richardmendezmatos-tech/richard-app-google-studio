import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';
import { blogService } from '@/entities/blog/api/blogService';

const escapeXml = (str: string = ''): string => {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://richard-automotive.com';

  let posts = [...SEED_ARTICLES];
  try {
    const dynamic = await blogService.getBlogPosts(20);
    posts = [...dynamic, ...SEED_ARTICLES];
  } catch {
    // seeds only
  }

  const latest = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Richard Automotive Blog — Noticias y Guías de Autos en Puerto Rico</title>
    <link>${escapeXml(siteUrl)}/blog</link>
    <description>Guías, consejos y noticias del mercado automotriz en Puerto Rico. Ford, financiamiento, mantenimiento y más.</description>
    <language>es-pr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/blog/feed.xml" rel="self" type="application/rss+xml"/>`;

  for (const post of latest) {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();

    xml += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(post.metaDescription || post.excerpt)}</description>
      <content:encoded><![CDATA[${post.content}
<p>— <a href="${escapeXml(postUrl)}">Leer artículo completo en Richard Automotive</a></p>]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(post.author)}</dc:creator>`;

    for (const tag of post.tags) {
      xml += `
      <category>${escapeXml(tag)}</category>`;
    }

    if (post.imageUrl) {
      xml += `
      <media:content url="${escapeXml(post.imageUrl)}" medium="image" />`;
    }

    xml += `
    </item>`;
  }

  xml += `
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
    },
  });
}
