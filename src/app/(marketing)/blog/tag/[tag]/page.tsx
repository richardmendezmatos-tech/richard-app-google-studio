import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';
import { blogService } from '@/entities/blog/api/blogService';
import { BlogPost } from '@/shared/types/types';

interface Props {
  params: Promise<{ tag: string }>;
}

function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/[-_]+/g, ' ');
}

async function getArticlesByTag(tag: string): Promise<{ tag: string; articles: BlogPost[] }> {
  const normalized = normalizeTag(tag);

  let dynamicPosts: BlogPost[] = [];
  try {
    dynamicPosts = await blogService.getBlogPosts(100);
  } catch {
    // fallback to seeds only
  }

  const all = [...SEED_ARTICLES, ...dynamicPosts] as BlogPost[];
  const tagged = all.filter((a) => a.tags.some((t) => normalizeTag(t) === normalized));

  return { tag: normalized, articles: tagged };
}

export async function generateStaticParams() {
  const allTags = new Set<string>();
  for (const article of SEED_ARTICLES) {
    for (const tag of article.tags) {
      allTags.add(tag.toLowerCase().replace(/\s+/g, '-'));
    }
  }
  return Array.from(allTags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const { articles } = await getArticlesByTag(tag);

  const displayTag = tag.replace(/[-_]/g, ' ');
  const capitalized = displayTag.charAt(0).toUpperCase() + displayTag.slice(1);

  return {
    title: `${capitalized} | Blog Richard Automotive`,
    description: `Artículos sobre ${displayTag} en Puerto Rico. Guías, consejos y noticias automotrices.`,
    alternates: {
      canonical: `https://richard-automotive.com/blog/tag/${tag}`,
    },
    openGraph: {
      title: `${capitalized} — Blog Richard Automotive`,
      description: `Lee nuestros artículos sobre ${displayTag} en Puerto Rico.`,
      type: 'website',
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
  };
}

function normalizeTagForUrl(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const { articles } = await getArticlesByTag(tag);

  if (articles.length === 0) {
    const all: BlogPost[] = [...SEED_ARTICLES] as BlogPost[];
    const recent = all.slice(0, 6);

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-black mb-4">
            No encontramos resultados para &ldquo;{tag.replace(/[-_]/g, ' ')}&rdquo;
          </h1>
          <p className="text-slate-400 mb-12">
            Pero tenemos estos artículos que te pueden interesar:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {recent.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all"
              >
                <div className="p-6">
                  <h2 className="text-sm font-bold leading-snug group-hover:text-cyan-400 transition line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayTag = tag.replace(/[-_]/g, ' ');
  const capitalized = displayTag.charAt(0).toUpperCase() + displayTag.slice(1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Artículos sobre ${capitalized}`,
            description: `Artículos sobre ${displayTag} en Puerto Rico.`,
            url: `https://richard-automotive.com/blog/tag/${tag}`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://richard-automotive.com' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://richard-automotive.com/blog' },
              { '@type': 'ListItem', position: 3, name: capitalized, item: `https://richard-automotive.com/blog/tag/${tag}` },
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-white transition">Inicio</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <span>/</span>
            <span className="text-slate-400">{capitalized}</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-cinematic)' }}>
            {capitalized}
          </h1>
          <p className="text-slate-400 mb-12">
            {articles.length} artículo{articles.length !== 1 ? 's' : ''} sobre {displayTag} en Puerto Rico.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all"
              >
                {article.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {article.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 uppercase tracking-widest font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-sm font-bold leading-snug group-hover:text-cyan-400 transition line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{article.excerpt}</p>
                  <p className="text-[10px] text-slate-600 mt-3">
                    {new Date(article.date).toLocaleDateString('es-PR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
