import React, { useState } from 'react';
import { User, DollarSign, Car, Send, ShieldCheck, AlertCircle } from 'lucide-react';

interface ProgressiveFormProps {
  type: 'income' | 'trade-in' | 'credit';
  onSubmit: (data: Record<string, string>) => void;
}

const ProgressiveForm: React.FC<ProgressiveFormProps> = ({ type, onSubmit }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Por favor, ingresa un valor válido para continuar.');
      return;
    }
    setError(null);
    onSubmit({ [type]: value });
  };

  const config = {
    income: {
      title: 'TU CAPACIDAD MENSUAL',
      placeholder: '¿Cuánto ganas aprox.? (Ej. 3500)',
      icon: <DollarSign size={18} />,
      label: 'Ingresos',
      cta: 'Ver Opciones Reales',
    },
    'trade-in': {
      title: 'VALORAMOS TU AUTO ACTUAL',
      placeholder: 'Marca y Año (Ej. Toyota 2020)',
      icon: <Car size={18} />,
      label: 'Vehículo actual',
      cta: 'Cotizar mi Auto',
    },
    credit: {
      title: 'TU SCORE DE CRÉDITO',
      placeholder: 'Puntaje estimado (Ej. 720)',
      icon: <User size={18} />,
      label: 'Crédito',
      cta: 'Verificar sin Impacto',
    },
  }[type];

  return (
    <div className="bg-slate-900/80 border border-primary/30 rounded-2xl p-5 my-2 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-3 text-primary">
        {config.icon}
        <span className="text-xs font-black uppercase tracking-widest">{config.title}</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder={config.placeholder}
            className={`flex-1 bg-black/40 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 min-h-[48px] text-[15px] text-white focus:ring-2 focus:ring-primary outline-none transition-all`}
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black px-5 min-h-[48px] rounded-xl transition-all shadow-lg font-bold text-[15px] active:scale-95"
            aria-label={config.cta}
            title={config.cta}
          >
            <span>{config.cta}</span>
            <Send size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Inline Error Validation */}
        {error && (
          <div className="flex items-center gap-1 text-[11px] text-red-400 mt-1 animate-in fade-in">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
      </form>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <p className="text-[11px] text-slate-400 font-medium">
          Toma <strong className="text-white">5 segundos</strong> y nos ayuda a darte la mejor
          oferta.
        </p>

        {/* CRO Trust Signal */}
        <div className="flex items-center gap-1 xl:gap-2 text-[11px] text-slate-300 font-bold bg-slate-800/50 px-2 py-1 rounded-md">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Datos Seguros</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveForm;
