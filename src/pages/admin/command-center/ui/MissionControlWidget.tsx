import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import * as whatsappService from '@/features/leads/model/whatsappService';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal';
  roi: string;
  action: string;
  type: 'whatsapp' | 'campaign' | 'strategy';
  metadata?: {
    phone?: string;
    message?: string;
  };
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Liquidación de Stock Antiguo',
    description: '3 unidades con >90 días en inventario tienen alta demanda semántica en tu zona.',
    priority: 'urgent',
    roi: '1.4x',
    action: 'Lanzar Campaña Flash',
    type: 'campaign',
  },
  {
    id: '17873682880',
    title: 'Seguimiento de Alta Probabilidad',
    description: 'Juan Rivera ha interactuado 5 veces con el Hyundai Tucson en las últimas 24h.',
    priority: 'high',
    roi: '2.8x',
    action: 'Enviar Nudge de IA',
    type: 'whatsapp',
    metadata: {
      phone: '17873682880',
      message:
        'Hola Juan! 👋 Vi que te interesó el Tucson. ¿Te gustaría pasar a verlo hoy? Tenemos un bono especial para ti.',
    },
  },
  {
    id: '3',
    title: 'Optimización de Margen',
    description:
      'Se detectó una oportunidad de ajuste de +2% en Sedan premium según tendencias de mercado.',
    priority: 'normal',
    roi: '1.2x',
    action: 'Aplicar Estrategia',
    type: 'strategy',
  },
];

export const MissionControlWidget: React.FC = () => {
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleAction = async (opp: Opportunity) => {
    setExecutingId(opp.id);

    try {
      if (opp.type === 'whatsapp' && opp.metadata?.phone) {
        await whatsappService.sendWhatsAppMessage(opp.metadata.phone, opp.metadata.message || '');
      } else {
        // Simulate other strategic actions
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setCompletedIds((prev) => new Set(prev).add(opp.id));
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="glass-premium p-8 border border-white/10 relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <Zap size={18} className="text-primary fill-primary/30" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                AI Mission Control
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">
              Monitoreo Proactivo de Oportunidades
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">
                Status
              </p>
              <p className="text-[11px] font-black text-emerald-500 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Operativo
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_OPPORTUNITIES.map((opp, idx) => {
            const isExecuting = executingId === opp.id;
            const isCompleted = completedIds.has(opp.id);

            return (
              <div
                key={opp.id}
                className={`bg-white/3 border border-white/5 rounded-3xl p-6 transition-all duration-300 group/card relative overflow-hidden flex flex-col h-full ${isCompleted ? 'opacity-50 grayscale' : 'hover:border-primary/30 hover:bg-white/5'}`}
              >
                {/* Priority Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      opp.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-500'
                        : opp.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-cyan-500/20 text-cyan-500'
                    }`}
                  >
                    {opp.priority}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-white/50">
                    <TrendingUp size={12} className="text-primary" /> {opp.roi} ROI
                  </div>
                </div>

                <h3 className="font-black text-white text-md mb-2 leading-tight pr-4">
                  {opp.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-1">
                  {opp.description}
                </p>

                <button
                  onClick={() => handleAction(opp)}
                  disabled={isExecuting || isCompleted}
                  className={`w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 group/btn ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {isExecuting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isCompleted ? (
                    <>
                      <CheckCircle2 size={14} /> Ejecutado
                    </>
                  ) : (
                    <>
                      {opp.type === 'whatsapp' && <MessageCircle size={14} />}
                      {opp.action}{' '}
                      <ArrowRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>

                {/* Decorative elements */}
                {idx === 0 && (
                  <div className="absolute -bottom-4 -right-4 text-primary/10 rotate-12">
                    <Sparkles size={80} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5 px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Último Análisis: Hace 4 min
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Precisión: 98.4%
              </span>
            </div>
          </div>
          <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
            Ver Todo el Historial <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionControlWidget;
