import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Share2,
  TrendingUp,
  Zap,
  CheckCircle,
  Loader2,
  Globe,
  Search,
  RefreshCcw,
  Phone,
  MousePointerClick,
  Navigation,
} from 'lucide-react';
import { localSEOAgent } from '@/features/marketing/application/LocalSEOAgent';
import { Car } from '@/entities/inventory';

interface GBPStat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

interface GBPReview {
  id: string;
  name: string;
  text: string;
  stars: number;
  createTime: string;
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  map: <MapPin size={12} className="text-slate-500" />,
  search: <Search size={12} className="text-slate-500" />,
  phone: <Phone size={12} className="text-slate-500" />,
  click: <MousePointerClick size={12} className="text-slate-500" />,
  directions: <Navigation size={12} className="text-slate-500" />,
};

export const SentinelLocalSEO: React.FC<{ inventory: Car[] }> = ({ inventory }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'indexing'>('posts');
  const [lastIndexed, setLastIndexed] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState<string | null>(null);
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>({});
  const [proposal, setProposal] = useState<string | null>(null);
  const [gbpConnected, setGbpConnected] = useState(false);
  const [stats, setStats] = useState<GBPStat[]>([]);
  const [reviews, setReviews] = useState<GBPReview[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/gbp/insights');
      if (res.ok) {
        const json = await res.json();
        setGbpConnected(json.connected);
        if (json.stats && json.stats.length > 0) {
          setStats(json.stats);
        } else {
          setStats(defaultStats);
        }
      } else {
        setStats(defaultStats);
      }
    } catch {
      setStats(defaultStats);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/gbp/reviews');
      if (res.ok) {
        const json = await res.json();
        if (json.reviews && json.reviews.length > 0) {
          setReviews(json.reviews);
        }
      }
    } catch {
      // keep empty
    }
  };

  const generatePost = async () => {
    if ((inventory || []).length === 0) return;
    setIsGenerating(true);
    const car = inventory[0];
    const text = await localSEOAgent.generateNewArrivalPost(car);
    setProposal(text);
    setIsGenerating(false);
  };

  const handlePublishPost = async () => {
    if (!proposal) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/gbp/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: proposal }),
      });
      if (res.ok) {
        setProposal(null);
      }
    } catch {
      console.error('Failed to publish GBP post');
    } finally {
      setPublishing(false);
    }
  };

  const handleReindex = async () => {
    setIsIndexing(true);
    try {
      const res = await fetch('/api/seo/reindex', { method: 'POST' });
      if (res.ok) {
        setLastIndexed(new Date().toLocaleTimeString());
      }
    } catch {
      console.error('Indexing failed');
    } finally {
      setIsIndexing(false);
    }
  };

  const proposeReply = async (review: GBPReview) => {
    setIsReplying(review.id);
    try {
      const reply = await localSEOAgent.generateReviewReply(review.text, review.stars, review.name);
      setReviewReplies((prev) => ({ ...prev, [review.id]: reply }));
    } catch {
      console.error('Reply generation failed');
    } finally {
      setIsReplying(null);
    }
  };

  const handlePostReply = async (reviewId: string) => {
    const replyText = reviewReplies[reviewId];
    if (!replyText) return;
    try {
      const res = await fetch(`/api/gbp/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });
      if (res.ok) {
        setReviewReplies((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    } catch {
      console.error('Failed to post reply');
    }
  };

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
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
            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">
              Local SEO Radar
            </h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
              Vega Alta, PR • KM 28.5 • N27
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gbpConnected && (
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">GBP Live</span>
            </span>
          )}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'posts' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('indexing')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'indexing' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              Indexing
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
            >
              Reviews
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 relative z-10">
        {loadingStats
          ? defaultStats.map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">{STAT_ICONS[stat.icon] || <TrendingUp size={12} className="text-slate-500" />}</div>
                <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-12 bg-white/5 rounded mt-2 animate-pulse" />
              </div>
            ))
          : displayStats.map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  {STAT_ICONS[stat.icon] || <TrendingUp size={12} className="text-slate-500" />}
                  <span className="text-[8px] font-black text-emerald-400">{stat.change}</span>
                </div>
                <p className="text-xl font-black text-white italic">{stat.value}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
      </div>

      <div className="space-y-4 relative z-10">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {proposal ? (
              <div className="p-5 bg-white/5 rounded-2xl border border-primary/20 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">
                    Draft Inteligente
                  </span>
                  <button onClick={() => setProposal(null)} className="text-slate-500 hover:text-white transition-colors">
                    <Share2 size={12} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                  {proposal}
                </p>
                <button
                  onClick={handlePublishPost}
                  disabled={publishing}
                  className="w-full py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {publishing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  {gbpConnected ? 'Publicar en Google Maps' : 'Guardar Borrador'}
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
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                      Generar Señal de Inventario
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {activeTab === 'indexing' && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Sitemap Sovereignty
                  </span>
                </div>
                {lastIndexed && (
                  <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">
                    Last: {lastIndexed}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Inventory Nodes</span>
                  <span className="text-white font-mono">{(inventory || []).length}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">City Pages</span>
                  <span className="text-white font-mono">12</span>
                </div>
              </div>
              <button
                onClick={handleReindex}
                disabled={isIndexing}
                className="w-full py-4 bg-linear-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
              >
                {isIndexing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <><RefreshCcw size={14} /> Ping Search Engines</>
                )}
              </button>
              <p className="text-[8px] text-slate-600 text-center uppercase font-bold tracking-tighter">
                Forces Google to re-crawl sitemap and inventory nodes
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {(reviews.length > 0 ? reviews : defaultReviews).map((review, i) => (
              <div
                key={review.id || i}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 transition-all hover:bg-white/10"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">
                      {review.name[0]}
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {review.name}
                    </span>
                  </div>
                  <div className="flex text-amber-500 gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        size={8}
                        fill={s < review.stars ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-medium italic">"{review.text}"</p>

                {reviewReplies[review.id] ? (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-[9px] text-primary-200 leading-relaxed font-medium">
                      {reviewReplies[review.id]}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setReviewReplies((prev) => {
                            const next = { ...prev };
                            delete next[review.id];
                            return next;
                          })
                        }
                        className="flex-1 py-1.5 bg-slate-800 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handlePostReply(review.id)}
                        className="flex-1 py-1.5 bg-primary text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all"
                      >
                        {gbpConnected ? 'Publicar en Google' : 'Guardar Respuesta'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => proposeReply(review)}
                    disabled={isReplying === review.id}
                    className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-primary text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    {isReplying === review.id ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <Zap size={10} />
                    )}
                    Proponer Respuesta IA
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const defaultStats: GBPStat[] = [
  { label: 'Map Views', value: '4.2k', change: '+12%', icon: 'map' },
  { label: 'Search Views', value: '8.1k', change: '+5%', icon: 'search' },
  { label: 'Calls', value: '47', change: '+18%', icon: 'phone' },
  { label: 'Clicks', value: '128', change: '+8%', icon: 'click' },
  { label: 'Directions', value: '93', change: '+22%', icon: 'directions' },
];

const defaultReviews: GBPReview[] = [
  { id: '1', name: 'Carlos Rivera', text: 'Excelente servicio, Richard me ayudó en todo el proceso...', stars: 5, createTime: '' },
  { id: '2', name: 'Marta Ortiz', text: 'La Tacoma que compré está impecable. Recomendado.', stars: 5, createTime: '' },
  { id: '3', name: 'Jose Davila', text: 'Esperaba un poco más de rapidez en la entrega, pero el auto está bien.', stars: 3, createTime: '' },
];
