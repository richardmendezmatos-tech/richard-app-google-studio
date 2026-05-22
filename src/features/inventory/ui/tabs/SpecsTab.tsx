'use client';

import React from 'react';
import { Car } from '@/entities/inventory';
import {
  Zap,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { ProgressRing } from '@/shared/ui/common/ProgressRing';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';

interface Props {
  car: Car;
}

const SpecsTab: React.FC<Props> = ({ car }) => (
  <div className="h-full bg-white/5 rounded-5xl border border-white/10 p-8 lg:p-12 overflow-y-auto custom-scrollbar shadow-2xl">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-cyan-400" />
          <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">
            Matriz de Energía
          </h4>
        </div>
        <div className="space-y-6">
          {[
            { label: 'Caballos de Fuerza (HP)', value: car.hp || 'N/A' },
            {
              label: 'Transmisión',
              value: car.transmission || 'Automática Selective',
            },
            { label: 'Tracción', value: 'Delantera AWD System' },
            { label: 'Motor', value: car.engine || 'Turbocard Intercooled' },
          ].map((spec) => (
            <div key={spec.label} className="group">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">
                {spec.label}
              </p>
              <p className="text-sm font-black text-white italic">{spec.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-cyan-400" />
          <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">
            Sentinel Security
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[
            'Frenado Autónomo',
            'Sensores Blind-Spot',
            'Cámara 360 Scan',
            'Alerta de Tráfico Cruzado',
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5"
            >
              <CheckCircle2 size={16} className="text-cyan-400" />
              <span className="text-xs font-black text-slate-300 uppercase italic">
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-cyan-400" />
          <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">
            Estado de Unidad
          </h4>
        </div>
        <GlassContainer
          intensity="low"
          className="p-6 rounded-4xl border border-white/10"
        >
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing
              value={100}
              max={100}
              size={50}
              label="CERT"
              strokeWidth={4}
              color="#00e5ff"
            />
            <div>
              <p className="text-xs font-black text-white italic uppercase">
                Nivel 13 Aprobado
              </p>
              <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase italic">
                Inspección Rigurosa 2026
              </p>
            </div>
          </div>
          <div className="p-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Esta unidad ha sido sometida a un escaneo digital completo y validada
              por Sentinel Engine.
            </p>
          </div>
        </GlassContainer>
      </div>
    </div>
  </div>
);

export default SpecsTab;
