
import React, { useState } from 'react';
import { generateBlogPost } from '@/services/geminiService';
import { subscribeToNewsletter } from '@/services/firebaseService';
import { BlogPost } from '@/types/types';
import { Newspaper, Loader2, Sparkles, Calendar, User, ArrowRight, Share2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

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
            url: window.location.href // En producción, usar URL única del post
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
            imageUrl: 'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-limited-rwd-atlas-white-profile?fmt=png-alpha&wid=1200' // Placeholder reuse
        }
    ];

    const displayPosts = posts.length > 0 ? posts : dummyPosts;

    return (
        <div className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-screen space-y-12">

            {/* Header Section */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-[#00aed9] font-black text-xs uppercase tracking-[0.2em] mb-2 animate-in fade-in">
                        <Newspaper size={14} /> Richard Automotive Newsroom
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] to-purple-500">Journalist 2.0</span>
                    </h2>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl text-lg">
                        El primer sistema de redacción automotriz autónomo.
                        <span className="block text-sm opacity-60 mt-1">Powered by Gemini 1.5 Flash Pro</span>
                    </p>
                </div>

                {/* AI CONTROL DECK */}
                <div className="w-full xl:w-auto bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-right duration-500">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* 1. TONE SELECTOR */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tono Editorial</label>
                            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                                {TONE_OPTIONS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTone(t)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${tone === t ? 'bg-white dark:bg-slate-700 text-[#00aed9] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {t === 'hype' ? '🔥' : t.slice(0, 4)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. FORMAT SELECTOR */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Formato</label>
                            <select
                                value={postType}
                                onChange={(e) => setPostType(e.target.value as 'news' | 'review' | 'guide')}
                                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00aed9]"
                            >
                                {POST_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option === 'news' ? '📰 Noticias' : option === 'review' ? '⭐ Review' : '📘 Guía'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* MAIN INPUT */}
                    <div className="relative group w-full md:min-w-[400px]">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={postType === 'review' ? "Ej. Hyundai Tucson 2025..." : "Ej. Ventajas de los Híbridos..."}
                            className="w-full pl-6 pr-16 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#00aed9] outline-none transition-all font-medium placeholder:text-slate-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-r from-[#00aed9] to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:grayscale text-white rounded-xl flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Featured / Latest Post (Takes up 2 columns) */}
                <div className="lg:col-span-2 space-y-8">
                    {displayPosts.map((post) => (
                        <article
                            key={post.id}
                            className="group bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-cyan-900/10 transition-all duration-500 cursor-pointer flex flex-col md:flex-row"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 animate-pulse" />
                                <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10">
                                    {post.tags[0]}
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex flex-col justify-center">
                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                    <span className="flex items-center gap-1 text-[#00aed9]"><User size={12} /> {post.author}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 leading-tight group-hover:text-[#00aed9] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-300 line-clamp-3 mb-6 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center text-[#00aed9] font-bold text-xs uppercase tracking-widest gap-2 mt-auto">
                                    Leer Artículo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#173d57] to-[#0d2232] p-8 rounded-[35px] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black text-xl mb-2">Suscríbete al Newsletter</h4>
                            <p className="text-sm text-blue-100 mb-6">Recibe las últimas noticias de Richard Automotive directamente en tu email.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={subscriberEmail}
                                    onChange={(e) => setSubscriberEmail(e.target.value)}
                                    placeholder="Tu email"
                                    disabled={isSubscribing}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-blue-200/50 outline-none focus:bg-white/20 transition-all disabled:opacity-50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isSubscribing}
                                    className="bg-[#00aed9] hover:bg-cyan-400 disabled:bg-slate-500 text-white px-4 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    {isSubscribing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12">
                            <Newspaper size={150} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[35px] border border-slate-100 dark:border-slate-700">
                        <h4 className="font-black text-lg text-slate-800 dark:text-white mb-4">Trending Topics</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Eléctricos', 'SUV', 'Mantenimiento', 'Off-Road', 'Seguridad', 'Tecnología'].map(tag => (
                                <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold hover:bg-[#00aed9] hover:text-white cursor-pointer transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Article Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-[200] bg-[#0d2232]/90 backdrop-blur-xl flex justify-end animate-in fade-in duration-300">
                    <div className="w-full max-w-3xl bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 relative">
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="fixed top-6 right-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full text-white transition-all"
                        >
                            <ArrowRight size={24} />
                        </button>

                        <div className="h-96 relative">
                            <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12">
                                <div className="flex gap-2 mb-4">
                                    {selectedPost.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[#00aed9] text-white text-[10px] font-black uppercase tracking-widest rounded-full">{tag}</span>
                                    ))}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{selectedPost.title}</h1>
                                <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
                                    <span>{selectedPost.author}</span>
                                    <span>•</span>
                                    <span>{selectedPost.date}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                            <p className="lead font-bold text-xl text-slate-800 dark:text-white mb-8">{selectedPost.excerpt}</p>
                            <div dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/><br/>').replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-[#00aed9]">$1</h2>') }} />
                        </div>

                        <div className="p-8 md:p-12 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-500">¿Te gustó este artículo?</p>
                                <button
                                    onClick={() => handleSharePost(selectedPost)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#173d57] text-white rounded-xl font-bold hover:bg-[#00aed9] transition-colors"
                                >
                                    <Share2 size={18} /> Compartir
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default BlogView;
