import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SEED_ARTICLES } from '@/entities/blog/data/seedArticles';

export const metadata: Metadata = {
  title: 'Blog | Richard Automotive — Guías y Consejos de Autos en PR',
  description: 'Guías, consejos y recursos para comprar, financiar y mantener tu auto en Puerto Rico. Artículos escritos por expertos del mercado automotriz puertorriqueño.',
  alternates: {
    canonical: 'https://richard-automotive.com/blog',
  },
  openGraph: {
    title: 'Blog | Richard Automotive',
    description: 'Todo lo que necesitas saber sobre autos usados en Puerto Rico.',
    type: 'website',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
  },
};

function BlogJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Richard Automotive Blog',
    description: 'Guías y consejos para comprar autos usados en Puerto Rico.',
    url: 'https://richard-automotive.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Richard Automotive',
      url: 'https://richard-automotive.com',
    },
    blogPost: SEED_ARTICLES.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      author: { '@type': 'Person', name: article.author },
      url: `https://richard-automotive.com/blog/${article.slug}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function BlogIndexPage() {
  const sortedArticles = [...SEED_ARTICLES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const featured = sortedArticles[0];
  const rest = sortedArticles.slice(1);

  return (
    <>
      <BlogJsonLd />
      <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <header className="mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold mb-3">
              Blog Automotriz
            </p>
            <h1
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ fontFamily: 'var(--font-cinematic)' }}
            >
              Guías & Recursos
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Consejos expertos para comprar, financiar y mantener tu vehículo en
              Puerto Rico.
            </p>
          </header>

          {/* Featured Article */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group block mb-12 rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all bg-slate-900/40"
            >
              <div className="grid md:grid-cols-2">
                {featured.imageUrl && (
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img
                      src={featured.imageUrl}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold mb-4">
                    Artículo Destacado
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black mb-4 group-hover:text-cyan-400 transition leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{featured.author}</span>
                    <span>•</span>
                    <time dateTime={featured.date}>
                      {new Date(featured.date).toLocaleDateString('es-PR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all hover:-translate-y-1 duration-300"
              >
                {article.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 uppercase tracking-widest font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{article.author}</span>
                    <span>•</span>
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString('es-PR', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Section */}
          <section className="mt-16 text-center bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-white/5 rounded-3xl p-12">
            <h2 className="text-2xl font-black mb-3">¿Listo para encontrar tu próximo auto?</h2>
            <p className="text-slate-400 mb-6">
              Más de 50 vehículos certificados esperan por ti en Bayamón.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/autos-usados/bayamon"
                className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition"
              >
                Ver Inventario
              </Link>
              <Link
                href="/precualificacion"
                className="px-8 py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition"
              >
                Pre-Cualificar
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
