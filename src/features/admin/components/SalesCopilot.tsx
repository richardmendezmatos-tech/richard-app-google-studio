import React, { useState, useEffect } from 'react';
import { Target, MessageSquare, Lightbulb, Zap, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { subscribeToLeads, Lead } from '@/features/leads/services/crmService';
import { orchestrationService, OrchestrationAction } from '@/services/orchestrationService';

// Note: LiveVoiceInsight removed as it was part of previous mock

const SalesCopilot: React.FC = () => {
    // Note: activeCall is temporarily disabled while we focus on lead orchestration
    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadActions, setLeadActions] = useState<Record<string, OrchestrationAction>>({});

    useEffect(() => {
        const unsubscribe = subscribeToLeads(async (data) => {
            // Sort by creation or priority if possible
            const topLeads = data.slice(0, 10);
            setLeads(topLeads);
        });
        return () => unsubscribe();
    }, []);

    // Effect to run orchestration on leads
    useEffect(() => {
        const runOrchestration = async () => {
            const newActions: Record<string, OrchestrationAction> = {};
            for (const lead of leads) {
                // In a real scenario, we'd fetch health for each or have a bulk hook
                // For simplicity, we'll simulate the health check context here 
                // normally orchestrationService handles the logic
                const action = await orchestrationService.orchestrateLeadFollowUp(lead, null);
                newActions[lead.id] = action;
            }
            setLeadActions(newActions);
        };

        if (leads.length > 0) {
            runOrchestration();
        }
    }, [leads]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0b1116] rounded-[40px] p-6 lg:p-10 border border-white/5 shadow-2xl overflow-hidden"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20"
                    >
                        <Target className="text-white" size={24} />
                    </motion.div>
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
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, borderColor: 'rgba(0,174,217,0.3)' }}
                            className="group relative bg-[#131f2a] border border-white/5 rounded-3xl p-6 transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${action.priority === 'urgent' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                                        action.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-blue-500/10 text-blue-500'
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
                                <p className="text-sm text-white font-bold mb-3">{action.suggestedAction}</p>
                                <div className="p-4 bg-[#0b1116] rounded-xl border border-white/5 italic text-slate-300 text-[11px] leading-relaxed relative">
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute -top-2 left-3 bg-[#131f2a] px-2 text-[8px] text-[#00aed9] font-black uppercase tracking-widest"
                                    >
                                        Auto-Response Script
                                    </motion.span>
                                    "{action.message}"
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest border border-white/5"
                                >
                                    <MessageSquare size={14} /> WhatsApp
                                </motion.button>
                                <motion.button
                                    whileHover={{ backgroundColor: '#00c3f5' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 bg-[#00aed9] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20"
                                >
                                    <Calendar size={14} /> Agendar Cita
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default SalesCopilot;
