"use client";

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Key, Timer, Sparkles, Check, Info, ShieldAlert } from 'lucide-react';
import { useGamificationStore, PREMIUM_DELIVERY_GIFTS } from '../model/useGamificationStore';

interface RewardPickerProps {
  onComplete: () => void;
}

export const RewardPicker: React.FC<RewardPickerProps> = ({ onComplete }) => {
  const {
    selectedRewards,
    prontoBonus,
    countdownSeconds,
    isKeySpun,
    timerActive,
    selectReward,
    deselectReward,
    spinKey,
    tickTimer
  } = useGamificationStore();

  const [spinning, setSpinning] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const controls = useAnimation();

  // Tick the global session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, tickTimer]);

  // Formato del temporizador (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRewardToggle = (rewardId: string) => {
    if (selectedRewards.includes(rewardId)) {
      deselectReward(rewardId);
    } else {
      if (selectedRewards.length < 2) {
        selectReward(rewardId);
      }
    }
  };

  const handleSpin = async () => {
    if (spinning || isKeySpun) return;

    setSpinning(true);
    const wonBonus = spinKey();

    // Mapeo de ángulos para el dial (4 cuñas):
    // $200 (Index 0) -> Centro 45deg
    // $450 (Index 1) -> Centro 135deg
    // $600 (Index 2) -> Centro 225deg
    // $800 (Index 3) -> Centro 315deg
    const bonusAngles: Record<number, number> = {
      200: 45,
      450: 135,
      600: 225,
      800: 315
    };

    const targetAngle = bonusAngles[wonBonus] || 135;
    // Rotar 5 vueltas completas (1800deg) + el ángulo invertido para alinear el premio al indicador superior
    const finalRotation = 1800 + (360 - targetAngle);

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 4,
        ease: [0.25, 0.1, 0.25, 1] // Inercia natural suave
      }
    });

    setSpinning(false);
    setShowPrizeModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Temporizador de Urgencia Temu-Style */}
      {timerActive && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Timer className="text-amber-500 animate-spin" size={20} style={{ animationDuration: '4s' }} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Reserva Temporal Activa
              </p>
              <p className="text-xs text-slate-300">
                Completa tu solicitud para asegurar tus regalos elegidos.
              </p>
            </div>
          </div>
          <div className="bg-[#0b1116] px-4 py-2 rounded-xl border border-amber-500/30">
            <span className="font-mono text-xl font-black text-amber-400">
              {formatTime(countdownSeconds)}
            </span>
          </div>
        </div>
      )}

      {/* Título y Copy Psicológico */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
          <Sparkles size={12} /> Club de Entrega VIP Richard
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
          Tus Regalos Exclusivos
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          En Richard Automotive celebramos tu compra desde el primer segundo. Selecciona hasta{' '}
          <span className="text-white font-bold">2 regalos de entrega</span> y gira la Llave de Oro para financiar tu pronto.
        </p>
      </div>

      {/* Grid del Selector de Regalos (Efecto Dotación) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PREMIUM_DELIVERY_GIFTS.map((gift) => {
          const isSelected = selectedRewards.includes(gift.id);
          const isDisabled = !isSelected && selectedRewards.length >= 2;

          return (
            <div
              key={gift.id}
              onClick={() => !isDisabled && handleRewardToggle(gift.id)}
              className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex items-start gap-4 ${
                isSelected
                  ? 'bg-slate-900/90 border-primary shadow-[0_0_30px_rgba(0,174,217,0.15)] scale-[1.02]'
                  : isDisabled
                  ? 'bg-slate-950/20 border-white/5 opacity-40 cursor-not-allowed'
                  : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-800/30'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Gift size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm md:text-base">{gift.label}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                  Valor: ${gift.value} USD
                </p>
              </div>

              {/* Check Indicator */}
              <div className="absolute right-4 top-4">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-primary border-primary text-white' : 'border-white/10'
                  }`}
                >
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Giro de Llave Virtual (Ruleta Ponderada de Pronto) */}
      <div className="bg-slate-900/50 p-6 md:p-8 rounded-4xl border border-white/5 flex flex-col items-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,174,217,0.05)_0%,transparent_100%)] pointer-events-none" />

        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">
            Aportación Financiera F&I
          </p>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
            Gira la Llave de Oro de Richard
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Desbloquea un bono dinámico directo a tu pronto para rebajar tu pago mensual.
          </p>
        </div>

        {/* Dial de la Llave en HTML5/CSS y Framer Motion */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* Dial Base */}
          <motion.div
            animate={controls}
            className="w-full h-full rounded-full border-4 border-slate-800 bg-[#0e1720] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex items-center justify-center"
            style={{ transformOrigin: 'center' }}
          >
            {/* Cuñas de la ruleta */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {/* $200 Wedge */}
              <div className="border-r border-b border-white/5 flex items-center justify-center p-6 bg-slate-950/40">
                <span className="font-black text-slate-500 text-lg rotate-[45deg]">$200</span>
              </div>
              {/* $450 Wedge */}
              <div className="border-l border-b border-white/5 flex items-center justify-center p-6 bg-primary/5">
                <span className="font-black text-primary text-xl rotate-[-45deg]">$450</span>
              </div>
              {/* $800 Wedge (Bottom Left) */}
              <div className="border-r border-t border-white/5 flex items-center justify-center p-6 bg-amber-500/5">
                <span className="font-black text-amber-500 text-lg rotate-[-135deg]">$800</span>
              </div>
              {/* $600 Wedge (Bottom Right) */}
              <div className="border-l border-t border-white/5 flex items-center justify-center p-6 bg-slate-900/60">
                <span className="font-black text-slate-300 text-lg rotate-[135deg]">$600</span>
              </div>
            </div>

            {/* Centro del Dial */}
            <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-white/10 z-10 flex items-center justify-center shadow-2xl">
              <Key className="text-amber-500" size={24} />
            </div>
          </motion.div>

          {/* Marcador Superior Estático (Needle) */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-primary drop-shadow-[0_0_10px_#00aed9]" />
          </div>
        </div>

        {/* Botón de Giro */}
        {!isKeySpun ? (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="px-8 py-4 bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Key size={16} /> {spinning ? 'Girando Llave...' : 'Girar Llave de Oro'}
          </button>
        ) : (
          <div className="text-center bg-slate-950/50 px-6 py-3 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Bono Acreditado Seguro
            </p>
            <p className="text-2xl font-black text-emerald-400">
              +${prontoBonus} USD a tu Pronto
            </p>
          </div>
        )}
      </div>

      {/* Botón Siguiente (Valida selección de al menos 1 regalo y el giro) */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onComplete}
          disabled={selectedRewards.length === 0 || !isKeySpun}
          className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            selectedRewards.length > 0 && isKeySpun
              ? 'bg-primary hover:bg-cyan-500 text-white shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {selectedRewards.length === 0
            ? 'Selecciona tus Regalos'
            : !isKeySpun
            ? 'Gira la Llave para Continuar'
            : 'Confirmar Recompensas VIP'}
        </button>
      </div>

      {/* Modal / Alerta de Felicitaciones al Ganar */}
      {showPrizeModal && (
        <div className="fixed inset-0 bg-[#070b0e]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-5xl shadow-[0_0_80px_rgba(0,174,217,0.2)] text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Sparkles size={36} className="text-emerald-400" />
            </div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">
              ¡Felicidades, Ganador!
            </p>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
              +${prontoBonus} USD
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Hemos inyectado este bono de pronto en tu cotización financiera. Se aplicará de forma automática en el siguiente paso.
            </p>
            <button
              onClick={() => setShowPrizeModal(false)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Excelente, Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
