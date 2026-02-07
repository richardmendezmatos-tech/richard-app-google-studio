import React, { useState, useEffect } from 'react';
import { Target, MessageSquare, Lightbulb, Zap, ArrowRight, TrendingUp, Mic, UserCheck, Calendar } from 'lucide-react';

interface SalesInsight {
    id: string;
    leadName: string;
    score: number;
    intent: string;
    suggestedAction: string;
    framework: 'PAS' | 'AIDA' | 'Benefit-First';
    rebuttal: string;
    persona?: string[];
}

interface LiveVoiceInsight {
    text: string;
    rebuttal: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}

const SalesCopilot: React.FC = () => {
    const [activeCall, setActiveCall] = useState<LiveVoiceInsight | null>(null);

    const insights: SalesInsight[] = [
        {
            id: '1',
            leadName: 'Juan del Pueblo',
            score: 92,
            intent: 'Toyota Tacoma - Pide 0 Pronto',
            suggestedAction: 'Anclaje de Valor & Crédito Local (BPPR/Popular)',
            framework: 'PAS',
            rebuttal: "Juan, entiendo perfectamente la meta del 0 pronto. Sin embargo, analizando con Banco Popular, un pronto de solo $2,500 baja tu pago mensual de $680 a $615 y te asegura la tasa de 6.95%. ¿Preferirías ahorrarte esos $4,000 en intereses para usarlos en accesorios para la Tacoma?",
            persona: ['Busca Ahorro Mensual', 'Crédito 720+', 'Leal a Popular']
        },
        {
            id: '2',
            leadName: 'Maria Mercedes',
            score: 85,
            intent: 'Tesla Model 3 - Duda con Interés',
            suggestedAction: 'Beneficio Cooperativa (Coop Juana Díaz)',
            framework: 'Benefit-First',
            rebuttal: "Maria, para este Tesla, detectamos que la Cooperativa local tiene una tasa promocional de 5.95% para autos eléctricos. Esto es un ahorro de $1,200 vs la banca tradicional. ¿Te gustaría que iniciemos la pre-aprobación con ellos ahora mismo?",
            persona: ['Interés en EV', 'Socia de Cooperativa', 'Vende Trade-in']
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveCall({
                text: "...pero mi banco me ofreció un interés de 8.5%, me parece un poco alto para este carro...",
                rebuttal: "Menciona el acuerdo exclusivo de Richard Automotive con 'Coop Juana Díaz' al 5.95% para bajar su pago mensual.",
                sentiment: 'negative'
            });
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-[#0b1116] rounded-[40px] p-6 lg:p-10 border border-white/5 shadow-2xl overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Target className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sales Copilot AI</h2>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest text-[#00aed9]">Real-time Negotiation Intelligence</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {activeCall && (
                        <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 animate-pulse">
                            <Mic size={14} className="text-red-500" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Call Analysis</span>
                        </div>
                    )}
                    <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-500" />
                        <span className="text-xs font-bold text-white">+18% Closing Rate</span>
                    </div>
                </div>
            </header>

            {activeCall && (
                <div className="mb-10 bg-gradient-to-r from-[#00aed9]/10 to-transparent border border-[#00aed9]/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.2em] bg-[#00aed9]/10 px-3 py-1 rounded-full">Inteligencia de Voz en Vivo</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: CALL_9981</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-xs italic">Cliente dice: "{activeCall.text}"</p>
                        </div>
                        <div className="flex items-center gap-4 bg-[#00aed9] p-5 rounded-2xl shadow-xl shadow-cyan-500/10">
                            <Zap size={24} className="text-white shrink-0" />
                            <div>
                                <p className="text-[10px] text-white/70 uppercase font-black mb-1">Rebuttal Sugerido</p>
                                <p className="text-white font-bold text-sm leading-snug">{activeCall.rebuttal}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {insights.map(insight => (
                    <div key={insight.id} className="group relative bg-[#131f2a] border border-white/5 rounded-3xl p-6 transition-all hover:border-[#00aed9]/30">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${insight.score > 80 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {insight.score}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-none mb-1">{insight.leadName}</h3>
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-tight">{insight.intent}</p>
                                </div>
                            </div>
                            <span className="bg-white/5 text-[9px] font-black text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest border border-white/5 leading-none">
                                {insight.framework}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {insight.persona?.map((tag, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    <UserCheck size={10} className="text-[#00aed9]" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{tag}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2 text-[#00aed9]">
                                <Lightbulb size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Estrategia de Cierre</span>
                            </div>
                            <p className="text-sm text-white font-bold mb-3">{insight.suggestedAction}</p>
                            <div className="p-4 bg-[#0b1116] rounded-xl border border-white/5 italic text-slate-300 text-[11px] leading-relaxed relative">
                                <span className="absolute -top-2 left-3 bg-[#131f2a] px-2 text-[8px] text-[#00aed9] font-black uppercase tracking-widest">Speech Script</span>
                                "{insight.rebuttal}"
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest border border-white/5">
                                <MessageSquare size={14} /> WhatsApp
                            </button>
                            <button className="flex-1 bg-[#00aed9] hover:bg-cyan-500 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                                <Calendar size={14} /> Agendar Cita
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesCopilot;
