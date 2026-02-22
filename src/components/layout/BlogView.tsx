
import React, { useState } from 'react';
import { generateBlogPost } from '@/services/geminiService';
import { subscribeToNewsletter } from '@/services/firebaseService';
import { BlogPost } from '@/types/types';
import { Newspaper, Loader2, Sparkles, Calendar, User, ArrowRight, Share2, X, Bookmark, Clock } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/seo/SEO';
import './BlogView.css';

const TONE_OPTIONS: Array<'professional' | 'casual' | 'hype'> = ['professional', 'casual', 'hype'];
const POST_TYPE_OPTIONS: Array<'news' | 'review' | 'guide'> = ['news', 'review', 'guide'];

const BlogView: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<'professional' | 'casual' | 'hype'>('professional');
    const [postType, setPostType] = useState<'news' | 'review' | 'guide'>('news');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [subscriberEmail, setSubscriberEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsGenerating(true);
        addNotification('info', 'Richard IA está investigando y redactando tu artículo...');

        try {
            const newPost = await generateBlogPost(topic, tone, postType);
            setPosts(prev => [newPost, ...prev]);
            setTopic('');
            addNotification('success', '¡Artículo publicado con éxito en el Newsroom!');
        } catch (error) {
            console.error(error);
            addNotification('error', 'No se pudo generar el artículo. Intenta otro tema.');
        } finally {
            setIsGenerating(false);
        }
    };

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
            url: window.location.href
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

    const dummyPosts: BlogPost[] = [
        {
            id: '1',
            title: 'El Futuro Eléctrico: ¿Por qué el IONIQ 5 está cambiando el juego?',
            excerpt: 'Exploramos cómo la arquitectura E-GMP de Hyundai está redefiniendo lo que esperamos de un vehículo eléctrico en términos de carga y espacio.',
            content: 'El Hyundai IONIQ 5 no es solo un auto nuevo; es una declaración de intenciones...',
            author: 'Richard AI Editor',
            date: '10 de octubre de 2025',
            tags: ['EV', 'Tecnología', 'Futuro'],
            imageUrl: 'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-limited-rwd-atlas-white-profile?fmt=png-alpha&wid=1200'
        }
    ];

    const displayPosts = posts.length > 0 ? posts : dummyPosts;

    return (
        <div className="p-6 lg:p-12 max-w-[1700px] mx-auto min-h-screen space-y-16">
            <SEO
                title="Blog | Richard Automotive Newsroom"
                description="Inteligencia editorial y noticias exclusivas de Richard Automotive."
                url="/blog"
                type="website"
            />

            {/* Header Section */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aed9]/10 text-[#00aed9] font-black text-[10px] uppercase tracking-widest border border-[#00aed9]/20">
                        <Newspaper size={12} /> Newsroom Command Center
                    </div>
                    <h2 className="newsroom-title text-slate-800 dark:text-white">
                        AI <span className="text-gradient-premium">Journalist 2.0</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-xl font-light leading-relaxed">
                        Experimenta el futuro de la comunicación automotriz a través de nuestra IA editorial de alto rendimiento.
                    </p>
                </motion.div>

                {/* AI CONTROL DECK - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full xl:w-[500px] glass-card p-1 rounded-[32px] overflow-hidden"
                >
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* 1. TONE SELECTOR */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#00aed9]/60">Editorial Tone</label>
                                <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1 relative">
                                    {TONE_OPTIONS.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase relative z-10 transition-colors"
                                        >
                                            <span className={tone === t ? 'text-[#00aed9] dark:text-white' : 'text-slate-400'}>
                                                {t === 'hype' ? '🔥' : t.slice(0, 4)}
                                            </span>
                                            {tone === t && (
                                                <motion.div
                                                    layoutId="tone-indicator"
                                                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. FORMAT SELECTOR */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#00aed9]/60">Format</label>
                                <select
                                    value={postType}
                                    onChange={(e) => setPostType(e.target.value as 'news' | 'review' | 'guide')}
                                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-700 dark:text-slate-200 outline-none focus:border-[#00aed9] transition-all cursor-pointer"
                                >
                                    {POST_TYPE_OPTIONS.map((option) => (
                                        <option key={option} value={option} className="uppercase font-bold">
                                            {option === 'news' ? '📰 News' : option === 'review' ? '⭐ Review' : '📘 Guide'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* MAIN INPUT */}
                        <div className="relative group">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={postType === 'review' ? "What car should I review?" : "Enter news topic..."}
                                className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-1 focus:ring-[#00aed9] outline-none transition-all font-medium placeholder:text-slate-400 text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic.trim()}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-[#00aed9] hover:bg-cyan-400 disabled:opacity-30 disabled:grayscale text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-[#00aed9]/20 hover:scale-105 active:scale-95"
                            >
                                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                {/* Feed Section */}
                <div className="lg:col-span-3 space-y-12">
                    {displayPosts.map((post, idx) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group cyber-glow bg-white dark:bg-slate-900/40 rounded-[48px] overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:border-[#00aed9]/30 transition-all duration-700 cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="flex flex-col md:row-span-1 md:flex-row h-full">
                                <div className="w-full md:w-5/12 h-72 md:h-auto relative overflow-hidden">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                            {post.tags[0]}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                                    <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><Calendar size={12} className="text-[#00aed9]" /> {post.date}</span>
                                        <span className="flex items-center gap-2 text-slate-500"><Clock size={12} /> 4 min read</span>
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-[1.1] group-hover:text-gradient-cyan transition-all">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-lg font-light leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00aed9] to-purple-500 p-[1px]">
                                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black">
                                                    RA
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 underline decoration-[#00aed9]/30">{post.author}</span>
                                        </div>
                                        <div className="flex items-center text-[#00aed9] font-black text-[10px] uppercase tracking-widest gap-2 bg-[#00aed9]/5 px-4 py-2 rounded-full border border-[#00aed9]/10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            Open <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                    <div className="bg-gradient-to-br from-[#173d57] to-[#0d2232] p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Sparkles className="text-[#00aed9]" />
                            </div>
                            <div>
                                <h4 className="font-black text-2xl tracking-tighter uppercase mb-2">Be the First</h4>
                                <p className="text-sm text-slate-300 font-light leading-relaxed">Exclusive news, market analysis and VIP drops in your inbox.</p>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    value={subscriberEmail}
                                    onChange={(e) => setSubscriberEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={isSubscribing}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 outline-none focus:bg-white/10 transition-all font-medium disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isSubscribing}
                                    className="w-full bg-gradient-to-r from-[#00aed9] to-[#008cb1] hover:brightness-110 disabled:opacity-50 text-white py-4 rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-cyan-950/40"
                                >
                                    {isSubscribing ? <Loader2 size={18} className="animate-spin" /> : "Join the Newsroom"}
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12 -z-0">
                            <Newspaper size={180} />
                        </div>
                    </div>

                    <div className="glass-card p-1 rounded-[40px]">
                        <div className="p-8 space-y-6">
                            <h4 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tighter">Trending Now</h4>
                            <div className="flex flex-wrap gap-2">
                                {['EV-Revolution', 'SUV-Trends', 'Porsche-Review', 'Off-Road', 'Cyber-Truck', 'AI-Drives'].map(tag => (
                                    <button key={tag} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00aed9] hover:text-white hover:shadow-lg hover:shadow-[#00aed9]/20 transition-all">
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

            </div>

            {/* Immersive Article Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-[#0d2232]/80 backdrop-blur-xl flex justify-center items-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-5xl bg-white dark:bg-black h-full max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col md:flex-row immersive-modal overflow-y-auto md:overflow-hidden"
                        >
                            {/* Close Button UI */}
                            <div className="absolute top-8 left-8 z-50 flex gap-2">
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white transition-all border border-white/20 group shadow-xl"
                                >
                                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            <div className="absolute top-8 right-8 z-50">
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white transition-all border border-white/20 shadow-xl">
                                    <Bookmark size={20} />
                                </button>
                            </div>

                            {/* Modal Content - Side Image */}
                            <div className="w-full md:w-5/12 h-[300px] md:h-full relative shrink-0">
                                <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                                    <div className="flex gap-2">
                                        {selectedPost.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-[#00aed9] text-white text-[9px] font-black uppercase tracking-widest rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase tracking-tighter">{selectedPost.title}</h1>
                                </div>
                            </div>

                            {/* Modal Content - Body Scrollable */}
                            <div className="flex-1 p-8 md:p-16 overflow-y-auto immersive-modal bg-white dark:bg-slate-950">
                                <div className="max-w-2xl mx-auto space-y-12 pb-12">
                                    <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-slate-800/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[#00aed9]">RA</div>
                                            <div>
                                                <p className="font-black text-sm text-slate-800 dark:text-white uppercase leading-none mb-1">{selectedPost.author}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPost.date} • 4 min read</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSharePost(selectedPost)}
                                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#00aed9] transition-all"
                                        >
                                            <Share2 size={20} className="text-[#00aed9]" />
                                        </button>
                                    </div>

                                    <div className="prose prose-lg dark:prose-invert max-w-none">
                                        <p className="text-xl font-bold text-[#00aed9] italic mb-8 border-l-4 border-[#00aed9] pl-6 py-2">
                                            {selectedPost.excerpt}
                                        </p>
                                        <div
                                            className="text-slate-700 dark:text-slate-300 font-light leading-relaxed space-y-6 text-lg"
                                            dangerouslySetInnerHTML={{
                                                __html: selectedPost.content
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>')
                                                    .replace(/\n/g, '<br/>')
                                                    .replace(/## (.*)/g, '<h2 class="text-3xl font-black mt-12 mb-6 text-slate-800 dark:text-white uppercase tracking-tighter border-b border-[#00aed9]/20 pb-2">$1</h2>')
                                            }}
                                        />
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800/50 text-center space-y-6">
                                        <h4 className="font-black text-xl text-slate-800 dark:text-white uppercase tracking-tighter">Did you find this insightful?</h4>
                                        <div className="flex justify-center gap-4">
                                            <button className="px-8 py-3 bg-[#00aed9] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#00aed9]/20 hover:scale-105 transition-all">Yes, I loved it</button>
                                            <button className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Share it</button>
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

export default BlogView;
