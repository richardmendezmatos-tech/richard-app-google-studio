import React, { useState } from 'react';
import { MapPin, Star, Share2, TrendingUp, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { localSEOAgent } from '@/features/marketing/application/LocalSEOAgent';
import { Car } from '@/entities/inventory';

export const SentinelLocalSEO: React.FC<{ inventory: Car[] }> = ({ inventory }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews'>('posts');

  const generatePost = async () => {
    if (inventory.length === 0) return;
    setIsGenerating(true);
    const car = inventory[0]; // Propose post for the latest unit
    const text = await localSEOAgent.generateNewArrivalPost(car);
    setProposal(text);
    setIsGenerating(false);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
      {/* Background Radar Animation */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity">
         <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping" />
         <div className="absolute inset-0 border border-primary/20 rounded-full scale-75 animate-ping [animation-delay:1s]" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <MapPin size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Local SEO Radar</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Vega Alta, PR • KM 28.5 • Online</p>
          </div>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
          >
            Reviews
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 relative z-10">
        {[
          { label: 'Map Views', value: '4.2k', change: '+12%', icon: TrendingUp },
          { label: 'CTA Clicks', value: '128', change: '+8%', icon: Zap },
          { label: 'Rating', value: '4.9', change: '★ ★ ★', icon: Star },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
               <stat.icon size={12} className="text-slate-500" />
               <span className="text-[8px] font-black text-emerald-400">{stat.change}</span>
            </div>
            <p className="text-xl font-black text-white italic">{stat.value}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4 relative z-10">
        {activeTab === 'posts' ? (
          <div className="space-y-4">
             {proposal ? (
               <div className="p-5 bg-white/5 rounded-2xl border border-primary/20 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Draft Inteligente</span>
                     <button onClick={() => setProposal(null)} className="text-slate-500 hover:text-white transition-colors">
                        <Share2 size={12} />
                     </button>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                     {proposal}
                  </p>
                  <button className="w-full py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2">
                     <CheckCircle size={14} /> Publicar en Google Maps
                  </button>
               </div>
             ) : (
               <button 
                onClick={generatePost}
                disabled={isGenerating}
                className="w-full py-6 border border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
               >
                 {isGenerating ? (
                   <Loader2 size={24} className="text-primary animate-spin" />
                 ) : (
                   <>
                     <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                       <Zap size={20} className="text-primary" />
                     </div>
                     <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Generar Señal de Inventario</span>
                   </>
                 )}
               </button>
             )}
          </div>
        ) : (
          <div className="space-y-3">
             {[
               { name: 'Carlos Rivera', text: 'Excelente servicio, Richard me ayudó en todo el proceso...', stars: 5 },
               { name: 'Marta Ortiz', text: 'La Tacoma que compré está impecable. Recomendado.', stars: 5 }
             ].map((review, i) => (
               <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">{review.name}</span>
                     <div className="flex text-amber-500 gap-0.5">
                        {[...Array(review.stars)].map((_, s) => <Star key={s} size={10} fill="currentColor" />)}
                     </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium line-clamp-1 italic">"{review.text}"</p>
                  <button className="text-primary text-[8px] font-black uppercase tracking-widest hover:underline">Proponer Respuesta IA</button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
