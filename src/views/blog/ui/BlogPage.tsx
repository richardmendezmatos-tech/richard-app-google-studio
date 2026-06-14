'use client';

import React, { useState } from 'react';
import { PostConversionWidget } from '@/features/blog/ui/components/PostConversionWidget';
import { SpecCard } from '@/features/blog/ui/components/SpecCard';
import { BlogRelatedInventory } from '@/features/blog/ui/components/BlogRelatedInventory';
import { BlogArticleSidebar } from '@/features/blog/ui/components/BlogArticleSidebar';
import { DI } from '@/app/(dashboard)/di/registry';

import { BlogPost } from '@/shared/types/types';
import { useBlogPosts } from '@/features/blog/hooks/useBlog';
import {
  Newspaper,
  Loader2,
  Sparkles,
  Calendar,
  User,
  ArrowRight,
  Share2,
  X,
  Clock,
  MessageCircle,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/shared/ui/seo/SEO';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const dummyPosts: BlogPost[] = [
  {
    id: '1',
    title: 'El Futuro Eléctrico: ¿Por qué el IONIQ 5 está cambiando el juego?',
    excerpt:
      'Exploramos cómo la arquitectura E-GMP de Hyundai está redefiniendo lo que esperamos de un vehículo eléctrico en términos de carga y espacio.',
    content: 'El Hyundai IONIQ 5 no es solo un auto nuevo; es una declaración de intenciones...',
    author: 'Richard AI Editor',
    date: '10 de octubre de 2025',
    tags: ['EV', 'Tecnología', 'Futuro'],
    imageUrl:
      'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-limited-rwd-atlas-white-profile?fmt=png-alpha&wid=1200',
  },
];

const BlogPage: React.FC = () => {
  const { data: posts = [], isLoading: isLoadingPosts } = useBlogPosts(50);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { addNotification } = useNotification();

  // Comment / Question state
  const [questionText, setQuestionText] = useState('');
  const [questionName, setQuestionName] = useState('');
  const [questionPhone, setQuestionPhone] = useState('');
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);

  const handleSubscribe = async () => {
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      addNotification('error', 'Por favor ingresa un email válido.');
      return;
    }
    setIsSubscribing(true);
    try {
      const repo = await DI.getSubscriberRepository();
      await repo.subscribe({
        email: subscriberEmail,
        source: 'blog_page',
        created_at: new Date().toISOString(),
      } as any);
      addNotification('success', '¡Suscripción exitosa! Bienvenido al Newsroom.');
      setSubscriberEmail('');
    } catch (error) {
      console.error(error);
      addNotification('error', 'Error al suscribirse. Intenta de nuevo.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSharePost = async (post: BlogPost) => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Share canceled
      }
    } else {
      navigator.clipboard.writeText(`${post.title} - ${window.location.href}`);
      addNotification('success', 'Enlace copiado al portapapeles');
    }
  };

  const handleQuestionSubmit = async () => {
    if (!questionText.trim() || !questionName.trim() || !questionPhone.trim()) {
      addNotification('error', 'Nombre, teléfono y pregunta son requeridos.');
      return;
    }
    setIsSendingQuestion(true);
    try {
      const res = await fetch('/api/leads/blog-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: questionName,
          phone: questionPhone,
          source: 'blog_comment',
          message: questionText,
          vehicle_of_interest: selectedPost?.tags?.[0] || 'Consulta Blog',
        }),
      });
      if (!res.ok) throw new Error('Error');
      setQuestionSent(true);
    } catch {
      addNotification('error', 'Error al enviar. Intenta de nuevo.');
    } finally {
      setIsSendingQuestion(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(6);

  const publishedPosts =
    posts.length > 0 ? posts.filter((p) => !p.id.includes('draft_')) : dummyPosts;

  // Filter posts based on Search and Selected Category
  const filteredPosts = publishedPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      post.tags?.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categories = ['ALL', ...Array.from(new Set(publishedPosts.flatMap((p) => p.tags || [])))];

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="p-6 lg:p-12 max-w-[1700px] mx-auto min-h-screen space-y-20 bg-slate-950">
      <SEO
        title="Blog | Richard Automotive"
        description="Perspectivas estratégicas, análisis de mercado y la vanguardia del financiamiento automotriz."
        url="/blog"
        type="website"
      />

      {/* Sentinel Header */}
      <header className="relative py-20 overflow-hidden rounded-[4rem] bg-slate-900/50 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-12 space-y-6 text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Noticias de Autoridad
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic leading-none">
            The <span className="text-cyan-400">Automotive</span> <br />
            <span className="text-white/20">Digital Intel</span>
          </h1>

          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto uppercase tracking-wide">
            Estrategia, mercado y tecnología financiera para el consumidor moderno de Puerto Rico.
          </p>
        </motion.div>
      </header>

      {/* Search & Categories Bar */}
      <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
        {/* Categories list */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.slice(0, 7).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(6);
              }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-400 border-cyan-400 text-black shadow-lg shadow-cyan-400/25'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="BUSCAR NOTICIA..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(6);
            }}
            className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-[10px] font-black tracking-widest text-white outline-none focus:border-cyan-400/50 transition-all uppercase placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Editorial Ticker */}
      <div className="bg-white/[0.02] border-y border-white/5 py-4 overflow-hidden whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-20 items-center"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Sparkles className="text-cyan-400" size={14} />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">
                N24 Market Update: Demanda de Ford F-150 sube 12% en el área norte
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">
                Abasto Inteligente: 4 oportunidades detectadas en SUVs Compactas
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Feed Section */}
        <div className="lg:col-span-8 space-y-12 relative min-h-[400px]">
          {isLoadingPosts && posts.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Newspaper className="text-slate-700 animate-bounce" size={48} />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No se encontraron noticias</p>
            </div>
          ) : (
            <>
              {visiblePosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative bg-slate-900/40 rounded-[3rem] overflow-hidden border border-white/5 hover:border-cyan-400/40 transition-all duration-700 cursor-pointer shadow-2xl"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-5/12 h-80 md:h-auto relative overflow-hidden">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-2"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                          <Newspaper className="text-slate-700" size={64} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-cyan-400/30">
                            {post.tags?.[0] || 'ANALYSIS'}
                          </span>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            <Calendar size={12} /> {post.date}
                          </div>
                        </div>

                        <h3 className="text-4xl font-black text-white leading-[1.05] tracking-tighter italic group-hover:text-cyan-400 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-slate-400 line-clamp-3 text-lg font-medium leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                            <User size={16} className="text-slate-500" />
                          </div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                            {post.author}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-4 transition-all">
                          Leer Intel <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}

              {filteredPosts.length > visibleCount && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-10 py-5 bg-white/5 hover:bg-cyan-400 hover:text-black border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl cursor-pointer"
                  >
                    Cargar más Noticias
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Enhanced Subscription Box */}
          <div className="bg-linear-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-cyan-400/20 relative overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.8)]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/10 blur-[80px] rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full" />

            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center border border-cyan-400/20">
                  <Sparkles className="text-cyan-400 animate-pulse" size={24} />
                </div>
                <span className="px-3 py-1 bg-cyan-400 text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-cyan-400/20 animate-bounce">
                  $300 Bono Web
                </span>
              </div>

              <div>
                <h4 className="font-black text-3xl text-white tracking-tighter uppercase leading-tight italic">
                  Digital <br /> Newsroom
                </h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mt-4">
                  Recibe análisis de mercado de Puerto Rico, primicias de Ford Credit y un <strong className="text-cyan-300">Bono Web de $300</strong> exclusivo para tu próxima compra en Vega Alta.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  placeholder="TU CORREO ELECTRÓNICO"
                  className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest text-center"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full h-16 bg-linear-to-r from-cyan-400 to-cyan-500 text-black hover:from-white hover:to-white transition-all rounded-2xl flex items-center justify-center font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-cyan-400/20 hover:shadow-white/10 cursor-pointer"
                >
                  {isSubscribing ? <Loader2 className="animate-spin" /> : 'Reclamar Bono & Suscribirme'}
                </button>
              </div>
            </div>
          </div>

          {/* N24 Trade-In Mini-Widget */}
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <TrendingUpIcon />
            </div>
            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">
              ¿Qué vale tu auto?
            </h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Obtén una tasación en 30 segundos.
            </p>
            <button className="w-full py-4 bg-white/10 hover:bg-primary hover:text-black border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              Tasar mi Unidad
            </button>
          </div>

          <div className="glass-card p-1 rounded-5xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
            <div className="p-8 space-y-6">
              <h4 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <TrendingUpIcon /> Trending Now
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'EV-Revolution',
                  'SUV-Trends',
                  'Porsche',
                  'Off-Road',
                  'Cyber-Truck',
                  'AI-Drives',
                ].map((tag) => (
                  <button
                    key={tag}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Viewing Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-3xl flex justify-center items-center p-0 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-slate-950 w-full max-w-7xl h-full md:h-[95vh] overflow-hidden rounded-none md:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-0 md:border border-white/10 relative flex flex-col"
            >
              {/* Close & Share Navbar */}
              <div className="sticky top-0 z-30 flex justify-between items-center p-6 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] hidden sm:block">
                    Blog Reader v2.4
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleSharePost(selectedPost)}
                    className="p-3 bg-white/5 rounded-2xl text-white/60 hover:text-primary transition-colors flex items-center justify-center border border-white/5"
                    title="Compartir Intel"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-3 bg-white/5 rounded-2xl text-white/60 hover:text-rose-500 transition-colors flex items-center justify-center border border-white/5"
                    title="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Reader View */}
              <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-20">
                <div className="max-w-4xl mx-auto">
                  {/* Hero Header */}
                  <div className="p-8 md:p-20 space-y-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
                        <span className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                          {selectedPost.tags?.[0] || 'Strategic Briefing'}
                        </span>
                        <span className="flex items-center gap-2 opacity-60">
                          <Clock size={14} /> {selectedPost.estimatedReadingTime || '4 MIN READ'}
                        </span>
                      </div>

                      <h1 className="text-5xl md:text-7xl font-black text-white leading-[1] tracking-tighter italic">
                        {selectedPost.title}
                      </h1>

                      <div className="flex items-center gap-6 py-10 border-y border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-linear-to-br from-primary to-purple-600 rounded-2xl p-px">
                            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-xs font-black text-white">
                              RA
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">
                              Por {selectedPost.author}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">
                              Equipo Editorial Richard
                            </p>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <Calendar size={14} /> {selectedPost.date}
                        </div>
                      </div>
                    </div>

                    {selectedPost.imageUrl && (
                      <figure className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
                        <img
                          src={selectedPost.imageUrl}
                          alt="Cover"
                          loading="lazy"
                          className="w-full h-full object-cover transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent" />
                      </figure>
                    )}

                    {/* Google JSON-LD Schema Markup */}
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                          '@context': 'https://schema.org',
                          '@type': 'BlogPosting',
                          'headline': selectedPost.title,
                          'description': selectedPost.excerpt,
                          'image': selectedPost.imageUrl || '',
                          'author': {
                            '@type': 'Organization',
                            'name': selectedPost.author || 'Richard Automotive',
                            'url': 'https://www.richard-automotive.com',
                          },
                          'publisher': {
                            '@type': 'Organization',
                            'name': 'Richard Automotive',
                            'logo': {
                              '@type': 'ImageObject',
                              'url': 'https://www.richard-automotive.com/logo.png',
                            },
                          },
                          'datePublished': new Date().toISOString(),
                          'mainEntityOfPage': {
                            '@type': 'WebPage',
                            '@id': `https://www.richard-automotive.com/blog/${selectedPost.slug}`,
                          },
                        }),
                      }}
                    />

                    {selectedPost.specs && selectedPost.specs.length > 0 && (
                      <SpecCard specs={selectedPost.specs as any} />
                    )}

                    <div className="flex flex-col lg:flex-row gap-16">
                      <div className="flex-1 space-y-12">
                        <div className="prose prose-2xl prose-invert prose-p:text-slate-300 prose-p:leading-[1.8] prose-p:font-medium prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter prose-strong:text-cyan-400 prose-a:text-cyan-400 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedPost.content}
                          </ReactMarkdown>
                        </div>

                        <BlogRelatedInventory tag={selectedPost.tags?.[0] || 'Car'} />

                        <PostConversionWidget
                          tag={selectedPost.tags?.[0]}
                          postTitle={selectedPost.title}
                          specs={selectedPost.specs}
                        />

                        {/* Interactive Comments / Questions Box */}
                        <div className="pt-12 border-t border-white/5 space-y-8 text-left">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="text-cyan-400" size={22} />
                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                              Preguntas & Consultas
                            </h4>
                          </div>

                          {questionSent ? (
                            <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-4 text-center">
                              <CheckCircle className="text-emerald-400 mx-auto" size={40} />
                              <p className="text-lg font-black text-white uppercase tracking-tight italic">¡Pregunta Recibida!</p>
                              <p className="text-xs text-slate-400">Houston AI procesará tu consulta y un especialista de <strong className="text-white">Central Ford Vega Alta</strong> te responderá por WhatsApp.</p>
                              <button
                                onClick={() => { setQuestionSent(false); setQuestionText(''); setQuestionName(''); setQuestionPhone(''); }}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer"
                              >
                                Hacer Otra Pregunta
                              </button>
                            </div>
                          ) : (
                            <div className="p-8 bg-slate-900/60 border border-white/5 rounded-3xl space-y-4">
                              <p className="text-xs text-slate-400 font-medium">
                                ¿Tienes dudas sobre este artículo o financiamiento en Vega Alta? Houston AI responderá o te conectará con un especialista.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                  <input
                                    type="text"
                                    placeholder="TU NOMBRE"
                                    value={questionName}
                                    onChange={(e) => setQuestionName(e.target.value)}
                                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest"
                                  />
                                </div>
                                <div className="relative">
                                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                  <input
                                    type="tel"
                                    placeholder="787-XXX-XXXX"
                                    value={questionPhone}
                                    onChange={(e) => setQuestionPhone(e.target.value)}
                                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest"
                                  />
                                </div>
                              </div>
                              <textarea
                                placeholder="ESCRIBE TU DUDA O PREGUNTA AQUÍ..."
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest"
                              />
                              <button
                                onClick={handleQuestionSubmit}
                                disabled={isSendingQuestion}
                                className="px-8 py-4 bg-cyan-400 text-black hover:bg-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-cyan-400/10 disabled:opacity-50 flex items-center gap-2"
                              >
                                {isSendingQuestion ? <Loader2 size={14} className="animate-spin" /> : null}
                                Enviar a Houston AI
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <BlogArticleSidebar post={selectedPost} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrendingUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);

export default BlogPage;
