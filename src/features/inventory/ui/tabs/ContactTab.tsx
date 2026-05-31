'use client';

import React from 'react';
import { Car } from '@/entities/inventory';
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { ProgressRing } from '@/shared/ui/common/ProgressRing';

interface Props {
  car: Car;
  onAction: () => void;
  onCall: () => void;
}

const ContactTab: React.FC<Props> = ({ car, onAction, onCall }) => (
  <div className="h-full flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-white/5 rounded-[64px] border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-linear-to-br from-primary to-cyan-400 rounded-full flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(0,180,216,0.5)]">
          <MessageCircle size={48} className="text-white" />
        </div>
        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
          ¿Listo para tu próximo auto?
        </h3>
        <p className="text-lg text-slate-400 font-medium mb-12 max-w-md">
          Conversa directamente con Richard IA o un estratega certificado para
          coordinar tu prueba de vuelo.
        </p>

        <div className="w-full flex flex-col md:flex-row gap-4">
          <button
            onClick={onAction}
            className="flex-1 py-8 bg-white text-slate-950 rounded-4xl font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-cyan-400 transition-all hover:scale-[1.05] shadow-xl"
          >
            <MessageCircle size={24} /> WhatsApp
          </button>
          <button
            onClick={onCall}
            className="flex-1 py-8 bg-primary text-white rounded-4xl font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-primary/80 transition-all hover:scale-[1.05] shadow-xl shadow-primary/20"
          >
            <Phone size={24} /> Llamar
          </button>
        </div>

        <div className="mt-12 flex items-center gap-4 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest italic text-white">
              Transacción Segura
            </span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-500" />
          <div className="flex items-center gap-2">
            <ProgressRing
              value={car.year > 2024 ? 98 : 95}
              size={45}
              strokeWidth={3}
              label="HP Efficiency"
              color={
                car.make === 'Porsche' || car.price > 80000 ? '#f59e0b' : '#10b981'
              }
            />
            <ProgressRing
              value={100}
              size={45}
              strokeWidth={3}
              label="Security"
              color="#06b6d4"
            />
            <ProgressRing
              value={95}
              size={45}
              strokeWidth={3}
              label="Registro de Actividad"
              color="#8b5cf6"
            />
            <span className="text-[10px] font-black uppercase tracking-widest italic text-white">
              Respuesta Inmediata
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ContactTab;
