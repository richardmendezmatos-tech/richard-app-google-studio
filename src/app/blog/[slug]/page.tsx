import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SEED_ARTICLES.filter((a) => a.slug).map((article) => ({
    slug: article.slug!,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = SEED_ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: `${article.title} | Richard Automotive Blog`,
    description: article.metaDescription || article.excerpt,
    authors: [{ name: article.author }],
    alternates: {
      canonical: `https://richard-automotive.com/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.excerpt,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      siteName: 'Richard Automotive',
      locale: 'es_PR',
      images: article.imageUrl ? [{ url: article.imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

function ArticleJsonLd({ article }: { article: typeof SEED_ARTICLES[0] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
      url: 'https://richard-automotive.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Richard Automotive',
      url: 'https://richard-automotive.com',
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: `https://richard-automotive.com/blog/${article.slug}`,
    image: article.imageUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ article }: { article: typeof SEED_ARTICLES[0] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://richard-automotive.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://richard-automotive.com/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://richard-automotive.com/blog/${article.slug}` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ── Simple Markdown-to-JSX renderer ──
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="text-left py-3 px-4 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5 hover:bg-white/[0.02]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-3 px-4 text-slate-300">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter(Boolean);
      if (!inTable) {
        tableHeaders = cells;
        inTable = true;
        continue;
      }
      // Skip separator row
      if (cells.every((c) => c.trim().match(/^[-:]+$/))) continue;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-3xl md:text-4xl font-black mt-10 mb-4" style={{ fontFamily: 'var(--font-cinematic)' }}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold mt-10 mb-3 text-cyan-400">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-bold mt-6 mb-2 text-white/90">{line.slice(4)}</h3>);
    }
    // List items
    else if (line.trim().startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*\s*[-—]?\s*(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="flex gap-2 mb-2 text-slate-300">
            <span className="text-cyan-400 mt-1 shrink-0">•</span>
            <span><strong className="text-white">{match[1]}</strong>{match[2] ? ` — ${match[2]}` : ''}</span>
          </li>
        );
      }
    } else if (line.trim().startsWith('- ')) {
      elements.push(
        <li key={i} className="flex gap-2 mb-2 text-slate-300">
          <span className="text-cyan-400 mt-1 shrink-0">•</span>
          <span>{line.trim().slice(2)}</span>
        </li>
      );
    }
    // Numbered list
    else if (line.trim().match(/^\d+\.\s/)) {
      const num = line.trim().match(/^(\d+)\.\s(.+)/);
      if (num) {
        elements.push(
          <li key={i} className="flex gap-3 mb-2 text-slate-300">
            <span className="text-cyan-400 font-bold shrink-0">{num[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: num[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          </li>
        );
      }
    }
    // Bold text paragraphs
    else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      elements.push(
        <p key={i} className="text-white font-semibold my-4">{line.trim().replace(/\*\*/g, '')}</p>
      );
    }
    // Links in text
    else if (line.trim() && !line.trim().startsWith('#')) {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-cyan-400 underline hover:text-cyan-300">$1</a>');
      elements.push(
        <p key={i} className="text-slate-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: html }} />
      );
    }
  }

  if (inTable) flushTable();

  return elements;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = SEED_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = SEED_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <ArticleJsonLd article={article} />
      <BreadcrumbJsonLd article={article} />

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Hero */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-8 md:p-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <Link href="/" className="hover:text-white transition">Inicio</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition">Blog</Link>
              <span>/</span>
              <span className="text-slate-400 truncate max-w-[200px]">{article.title}</span>
            </nav>

            <div className="flex gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 uppercase tracking-widest font-bold">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4" style={{ fontFamily: 'var(--font-cinematic)' }}>
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Por <strong className="text-white">{article.author}</strong></span>
              <span>•</span>
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="max-w-4xl mx-auto px-6 md:px-16 py-12">
          <div className="prose-custom">
            {renderMarkdown(article.content)}
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 md:px-16 pb-16">
            <h2 className="text-xl font-bold mb-6 text-white/80">Artículos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all"
                >
                  {rel.imageUrl && (
                    <div className="h-32 overflow-hidden">
                      <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-bold leading-snug group-hover:text-cyan-400 transition line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{rel.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
