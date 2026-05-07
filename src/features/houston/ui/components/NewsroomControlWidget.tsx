'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Sparkles, Send, Loader2, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { useBlogPosts, useCreateBlogPost, useDeleteBlogPost } from '@/features/blog/hooks/useBlog';

export const NewsroomControlWidget: React.FC = () => {
  const { data: posts = [], isLoading } = useBlogPosts(10);
  const createPost = useCreateBlogPost();
  const deletePost = useDeleteBlogPost();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/command-center/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context: 'Focus on high-ROI inventory and financing in PR' })
      });
      
      if (res.ok) {
        const aiIntel = await res.json();
        // Create as a draft in Supabase
        await createPost.mutateAsync({
          title: aiIntel.title,
          excerpt: aiIntel.excerpt,
          content: aiIntel.content,
          author: 'Richard AI Editor',
          tags: aiIntel.tags,
          date: new Date().toLocaleDateString('es-PR', { day: 'numeric', month: 'long', year: 'numeric' }),
          imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000' // Placeholder for now
        });
        setTopic('');
      }
    } catch (error) {
      console.error('[NewsroomControl] AI Draft Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-premium p-6 border border-white/5 group hover:border-cyan-500/20 transition-all overflow-hidden relative hud-brackets">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Newspaper className="text-cyan-400" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Editorial Control</h4>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Gestión de Contenido Sentinel</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Generator Input */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
           <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-primary animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Generador de Intel Editorial</span>
           </div>
           <div className="flex gap-2">
             <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tema: ej. 'Beneficios de comprar una F-150'"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-primary/50"
             />
             <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="px-4 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
             >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Generar
             </button>
           </div>
        </div>

        {/* Recent Posts List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="py-8 flex justify-center">
               <Loader2 className="animate-spin text-slate-700" />
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group/item hover:bg-white/[0.04] transition-all">
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-black text-white truncate uppercase tracking-tight">{post.title}</h5>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">{post.date}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                  <button className="p-2 hover:text-primary transition-colors">
                     <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => deletePost.mutate(post.id)}
                    className="p-2 hover:text-rose-500 transition-colors"
                  >
                     <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
           <Newspaper size={14} />
           Ver Todos los Artículos
        </button>
      </div>
    </div>
  );
};
