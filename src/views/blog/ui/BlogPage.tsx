"use client";

import React, { useState } from 'react';
import { subscribeToNewsletter } from '@/shared/api/firebase/firebaseService';
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

  const handleSubscribe = async () => {
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      addNotification('error', 'Por favor ingresa un email válido.');
      return;
    }
    setIsSubscribing(true);
    try {
      await subscribeToNewsletter(subscriberEmail);
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

  const publishedPosts =
    posts.length > 0 ? posts.filter((p) => !p.id.includes('draft_')) : dummyPosts;

  return (
    <div className="p-6 lg:p-12 max-w-[1700px] mx-auto min-h-screen space-y-16">
      <SEO
        title="Blog | Richard Automotive Newsroom"
        description="Noticias, tendencias y análisis profundos del mercado automotriz."
        url="/blog"
        type="website"
      />

      {/* Header Section */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest border border-primary/20">
            <Newspaper size={12} /> Public Newsroom
          </div>
          <h1 className="newsroom-title text-slate-800 dark:text-white text-4xl xl:text-5xl font-black tracking-tighter decoration-primary decoration-4 underline-offset-8">
            The <span className="text-gradient-premium">Automotive</span> Daily
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-light leading-relaxed">
            Explora noticias exclusivas, reseñas a fondo y análisis del mercado automotriz curados
            por nuestro equipo.
          </p>
        </motion.div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Feed Section */}
        <div className="lg:col-span-3 space-y-12 relative min-h-[400px]">
          {isLoadingPosts && posts.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            publishedPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cyber-glow bg-white dark:bg-slate-900/40 rounded-[48px] overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-700 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex flex-col md:row-span-1 md:flex-row h-full">
                  <div className="w-full md:w-5/12 h-72 md:h-auto relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                        <Newspaper className="text-slate-400 opacity-20" size={64} />
                      </div>
                    )}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                        {post.tags?.[0] || 'NOTICIAS'}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Calendar size={12} className="text-primary" /> {post.date}
                      </span>
                      <span className="flex items-center gap-2 text-slate-500">
                        <Clock size={12} /> Leído rápido
                      </span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-[1.1] group-hover:text-gradient-cyan transition-all">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-lg font-light leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50 relative">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-px">
                          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black">
                            RA
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 underline decoration-primary/30">
                          {post.author}
                        </span>
                      </div>
                      <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        Leer Artículo <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="bg-gradient-to-br from-[#173d57] to-[#0d2232] p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Sparkles className="text-primary" />
              </div>
              <div>
                <h4 className="font-black text-2xl tracking-tighter uppercase mb-2">
                  Be the First
                </h4>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  Noticias exclusivas, análisis de mercado y drops VIP directamente en tu bandeja.
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="email"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  disabled={isSubscribing}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-primary focus:bg-white/10 transition-all font-medium disabled:opacity-50"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full bg-gradient-to-r from-primary to-[#008cb1] hover:brightness-110 disabled:opacity-50 text-white py-4 rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-cyan-950/40"
                >
                  {isSubscribing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Unirse al Newsroom'
                  )}
                </button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12 z-0">
              <Newspaper size={180} />
            </div>
          </div>

          <div className="glass-card p-1 rounded-[40px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
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
            className="fixed inset-0 z-50 bg-[#0d2232]/80 backdrop-blur-xl flex justify-center items-center p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[32px] md:rounded-[48px] shadow-2xl custom-scrollbar border border-slate-200 dark:border-slate-800 relative flex flex-col"
            >
              {/* Close & Share Navbar */}
              <div className="sticky top-0 z-20 flex justify-between items-center p-4 md:p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-900/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSharePost(selectedPost)}
                    className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center justify-center"
                    title="Compartir"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center"
                    title="Cerrar artículo"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Reader View */}
              <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-10 pb-20">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary">
                      <span className="bg-primary/10 px-4 py-1.5 rounded-full">
                        {selectedPost.tags?.[0] || 'Artículo Especial'}
                      </span>
                      <span className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} /> {selectedPost.date}
                      </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white leading-[1.1] tracking-tighter">
                      {selectedPost.title}
                    </h1>

                    <div className="flex items-center gap-4 py-6 border-y border-slate-100 dark:border-slate-800/50 text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-primary">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Por {selectedPost.author}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest">Staff Editorial</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedPost.imageUrl && (
                    <figure className="relative h-[300px] md:h-[400px] rounded-[32px] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50">
                      <img
                        src={selectedPost.imageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </figure>
                  )}

                  <div className="prose prose-lg prose-slate dark:prose-invert prose-p:leading-relaxed prose-headings:font-black prose-headings:tracking-tighter prose-a:text-primary max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedPost.content}
                    </ReactMarkdown>
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
