'use client';

import React from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import SEO from '@/shared/ui/seo/SEO';
import { RewardPicker } from '@/features/gamification/ui/RewardPicker';

interface Props {
  onExit?: () => void;
}

export const GamificationVIPView: React.FC<Props> = ({ onExit }) => {
  const navigate = useNavigate();

  const handleExit = onExit || (() => navigate('/'));

  const handleComplete = () => {
    // Redirigir a la precalificación estructurada con las recompensas ya ganadas
    navigate('/qualify');
  };

  return (
    <div className="min-h-screen bg-[#0b1116] text-white flex flex-col font-sans">
      <SEO
        title="Club de Entrega VIP | Recompensas Richard Automotive"
        description="Personaliza los beneficios exclusivos para la entrega de tu carro y gira la Llave de Oro para tu bono de pronto."
        url="/recompensas-vip"
        type="website"
      />

      {/* Fintech Header */}
      <div className="bg-[#0f1922] border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            title="Volver"
          >
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-primary">RICHARD</span> VIP REWARDS
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold bg-[#C5A880]/10 text-[#C5A880] px-3 py-1.5 rounded-full border border-[#C5A880]/20">
          <Lock size={10} /> SECURE VIP ENTRY
        </div>
      </div>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Visual Sidebar with Sofia / Trust info */}
        <div className="w-full md:w-1/3 p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Sofia Avatar Area */}
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-4xl animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center shadow-lg border-2 border-[#C5A880]/30">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4128/4128335.png"
                  alt="Asistente Sofia"
                  className="w-10 h-10 object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente Sofia</h3>
                <p className="text-xs text-[#C5A880] font-mono">CLUB DE ENTREGA VIP</p>
              </div>
            </div>
            <div className="relative bg-slate-900/80 p-4 rounded-xl rounded-tl-sm border border-[#C5A880]/20">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "¡Hola! Soy Sofia. Selecciona tus regalos preferidos para el día de tu entrega y gira la Llave de Oro para tu bono de pronto. ¡Comencemos!"
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 relative z-10 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <div className="flex items-center justify-center gap-4 text-slate-500">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-[#C5A880]" />
                <span className="text-[9px] font-bold uppercase tracking-widest">VIP PRIVILEGES</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={14} className="text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest">SSL SECURED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reward Picker Funnel Area */}
        <div className="w-full md:w-2/3 p-4 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-[#131f2a] p-8 md:p-10 rounded-[30px] border border-white/5 shadow-2xl relative overflow-hidden">
            <RewardPicker onComplete={handleComplete} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamificationVIPView;
