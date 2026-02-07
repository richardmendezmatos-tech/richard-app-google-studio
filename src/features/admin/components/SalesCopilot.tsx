import React from 'react';
import { Target, MessageSquare, Lightbulb, Zap, ArrowRight, TrendingUp } from 'lucide-react';

interface SalesInsight {
    id: string;
    leadName: string;
    score: number;
    intent: string;
    suggestedAction: string;
    framework: 'PAS' | 'AIDA' | 'Benefit-First';
    rebuttal: string;
}

const SalesCopilot: React.FC = () => {
    const insights: SalesInsight[] = [
        {
            id: '1',
            leadName: 'Juan del Pueblo',
            score: 92,
            intent: 'Toyota Tacoma - Pide 0 Pronto',
            suggestedAction: 'Anclaje de Valor & Crédito Local (BPPR/Popular)',
            framework: 'PAS',
            rebuttal: "Juan, entiendo perfectamente la meta del 0 pronto. Sin embargo, analizando con Banco Popular, un pronto de solo $2,500 baja tu pago mensual de $680 a $615 y te asegura la tasa de 6.95%. ¿Preferirías ahorrarte esos $4,000 en intereses para usarlos en accesorios para la Tacoma?"
        },
        {
            id: '2',
            leadName: 'Maria Mercedes',
            score: 85,
            intent: 'Tesla Model 3 - Duda con Interés',
            suggestedAction: 'Beneficio Cooperativa (Coop Juana Díaz)',
            framework: 'Benefit-First',
            rebuttal: "Maria, para este Tesla, detectamos que la Cooperativa local tiene una tasa promocional de 5.95% para autos eléctricos. Esto es un ahorro de $1,200 vs la banca tradicional. ¿Te gustaría que iniciemos la pre-aprobación con ellos ahora mismo?"
        }
    ];

    return (
        <div className="bg-[#0b1116] rounded-[40px] p-10 border border-white/5 shadow-2xl">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Target className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sales Copilot AI</h2>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest text-[#00aed9]">Real-time Negotiation Intelligence</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xs font-bold text-white">+18% Closing Rate Suggested</span>
                </div>
            </header>

            <div className="space-y-6">
                {insights.map(insight => (
                    <div key={insight.id} className="group relative bg-[#131f2a] border border-white/5 rounded-3xl p-6 transition-all hover:border-[#00aed9]/30">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${insight.score > 80 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {insight.score}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{insight.leadName}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">{insight.intent}</p>
                                </div>
                            </div>
                            <span className="bg-white/5 text-[10px] font-black text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest border border-white/5">
                                {insight.framework} Framework
                            </span>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2 text-[#00aed9]">
                                <Lightbulb size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Estrategia Recomendada</span>
                            </div>
                            <p className="text-sm text-white font-bold mb-2">{insight.suggestedAction}</p>
                            <div className="p-4 bg-[#0b1116] rounded-xl border border-white/5 italic text-slate-400 text-xs leading-relaxed">
                                "{insight.rebuttal}"
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest border border-white/5">
                                <MessageSquare size={14} /> Copiar a WhatsApp
                            </button>
                            <button className="flex-1 bg-[#00aed9] hover:bg-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                                <Zap size={14} /> Aplicar Estrategia <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesCopilot;
