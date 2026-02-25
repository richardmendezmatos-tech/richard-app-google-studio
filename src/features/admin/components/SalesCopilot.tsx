import React, { useState, useEffect } from 'react';
import { Target, MessageSquare, Lightbulb, Zap, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { subscribeToLeads, Lead } from '@/features/leads/services/crmService';
import { orchestrationService, OrchestrationAction } from '@/services/orchestrationService';
import { getAntigravityLeadAction } from '@/services/antigravityCopilotService';

// Note: LiveVoiceInsight removed as it was part of previous mock

const SalesCopilot: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadActions, setLeadActions] = useState<Record<string, OrchestrationAction>>({});
    const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const unsubscribe = subscribeToLeads(async (data) => {
            // Priority sort: Hot leads (high engagement/score) first
            const sortedLeads = [...data].sort((a, b) => (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0));
            setLeads(sortedLeads.slice(0, 10));
        });
        return () => unsubscribe();
    }, []);

    // Effect to run orchestration on leads
    useEffect(() => {
        const runOrchestration = async () => {
            const entries = await Promise.all(
                leads.map(async (lead) => {
                    const agAction = await getAntigravityLeadAction(lead);
                    if (agAction) return [lead.id, agAction] as const;

                    // Fallback to local orchestration engine
                    const localAction = await orchestrationService.orchestrateLeadFollowUp(lead, null);
                    return [lead.id, localAction] as const;
                })
            );

            setLeadActions(Object.fromEntries(entries) as Record<string, OrchestrationAction>);
        };

        if (leads.length > 0) {
            runOrchestration();
        }
    }, [leads]);
    const handleWhatsAppSend = (lead: Lead, script: string) => {
        if (!lead.phone) return;
        const encodedMsg = encodeURIComponent(script);
        const waUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodedMsg}`;
        window.open(waUrl, '_blank');
    };

    const copyScriptToClipboard = (leadId: string, script: string) => {
        navigator.clipboard.writeText(script).then(() => {
            setCopyStatus(prev => ({ ...prev, [leadId]: true }));
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [leadId]: false }));
            }, 2000);
        });
    };

    return (
        <div className="bg-[#0b1116] rounded-[40px] p-6 lg:p-10 border border-white/5 shadow-2xl overflow-hidden route-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105 hover:rotate-3">
                        <Target className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sales Copilot AI</h2>
                        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest text-[#00aed9]">Real-time Negotiation Intelligence</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-500" />
                        <span className="text-xs font-bold text-white">+18% Closing Rate</span>
                    </div>
                </div>
            </header>

            {/* Active Call Insight place holder was here */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {leads.map((lead: Lead, index: number) => {
                    const action = leadActions[lead.id];
                    if (!action) return null;

                    return (
                        <div
                            key={lead.id}
                            style={{ '--d': `${Math.min(index * 60, 240)}ms` } as React.CSSProperties}
                            className="group relative bg-[#131f2a] border border-white/5 rounded-3xl p-6 transition-all route-fade-in hover:-translate-y-1 hover:border-[#00aed9]/30 delay-var"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${action.priority === 'urgent' ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' :
                                        action.priority === 'high' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                            'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
                                        }`}>
                                        {lead.aiAnalysis?.score || '!!'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-none mb-1">{lead.name}</h3>
                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-tight">{lead.type}</p>
                                    </div>
                                </div>
                                <span className="bg-white/5 text-[9px] font-black text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest border border-white/5 leading-none">
                                    {action.agentId}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00aed9]/10 rounded-full border border-[#00aed9]/20">
                                    <Zap size={10} className="text-[#00aed9]" />
                                    <span className="text-[9px] font-bold text-[#00aed9] uppercase tracking-tighter">AI Orchestrated</span>
                                </div>
                                {action.priority === 'urgent' && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                        <AlertTriangle size={10} className="text-red-500" />
                                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Critical Health</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2 text-[#00aed9]">
                                    <Lightbulb size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Estrategia Sugerida</span>
                                </div>
                                <p className="text-sm text-white font-bold mb-3 leading-tight">{action.suggestedAction}</p>
                                <div className="p-4 bg-[#0b1116] rounded-xl border border-white/5 italic text-slate-300 text-[11px] leading-relaxed relative group/script">
                                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover/script:opacity-100 transition-opacity" />
                                    <span className="relative z-10 block">"{action.message}"</span>
                                    <span className="absolute -top-2 left-3 bg-[#131f2a] px-2 text-[8px] text-[#00aed9] font-black uppercase tracking-widest z-20">
                                        AI Suggested Script
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleWhatsAppSend(lead, action.message)}
                                    disabled={!lead.phone}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed group/wa"
                                >
                                    <MessageSquare size={14} className="group-hover/wa:text-[#25D366] transition-colors" />
                                    {lead.phone ? 'WhatsApp' : 'No Phone'}
                                </button>
                                <button
                                    onClick={() => copyScriptToClipboard(lead.id, action.message)}
                                    className={`flex-1 font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest border ${copyStatus[lead.id]
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                            : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Zap size={14} className={copyStatus[lead.id] ? 'animate-bounce' : ''} />
                                    {copyStatus[lead.id] ? 'Copiado!' : 'Copiar Script'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SalesCopilot;
