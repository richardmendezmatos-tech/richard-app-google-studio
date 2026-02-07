import React, { useState } from 'react';
import { User, DollarSign, Car, Send } from 'lucide-react';

interface ProgressiveFormProps {
    type: 'income' | 'trade-in' | 'credit';
    onSubmit: (data: Record<string, string>) => void;
}

const ProgressiveForm: React.FC<ProgressiveFormProps> = ({ type, onSubmit }) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ [type]: value });
    };

    const config = {
        income: {
            title: 'Ingreso Mensual Estimado',
            placeholder: 'Ej. 3500',
            icon: <DollarSign size={18} />,
            label: 'Ingresos'
        },
        'trade-in': {
            title: 'Auto que deseas entregar',
            placeholder: 'Ej. Toyota Corolla 2020',
            icon: <Car size={18} />,
            label: 'Vehículo actual'
        },
        credit: {
            title: 'Empirica (Credit Score)',
            placeholder: 'Ej. 720',
            icon: <User size={18} />,
            label: 'Crédito'
        }
    }[type];

    return (
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 my-2 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
                {config.icon}
                <span className="text-xs font-black uppercase tracking-widest">{config.title}</span>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={config.placeholder}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-black p-2 rounded-xl transition-colors shadow-lg"
                    aria-label={`Enviar ${config.label}`}
                    title={`Enviar ${config.label}`}
                >
                    <Send size={16} />
                </button>
            </form>
            <p className="text-[10px] text-slate-500 mt-2 italic">Esto nos ayuda a darte una oferta exacta.</p>
        </div>
    );
};

export default ProgressiveForm;
