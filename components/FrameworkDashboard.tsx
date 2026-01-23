import React, { useState, useEffect } from 'react';
import { frameworkService, FrameworkState } from '../services/frameworkService';
import VueWrapper from './VueWrapper';
import AngularWrapper from './AngularWrapper';
import PassportDemo from './PassportDemo';
import JQueryWrapper from './JQueryWrapper';
import MemcachedDemo from './MemcachedDemo';
import TestReact from './TestReact';
import PHPShowcase from './PHPShowcase';
import VertexAIDemo from './VertexAIDemo';
import SemanticSearch from './SemanticSearch';
import RichardAIControl from './RichardAIControl';
import { Cpu, RotateCcw, Activity } from 'lucide-react';

const FrameworkDashboard: React.FC = () => {
    const [state, setState] = useState<FrameworkState>(frameworkService.getCurrentState());

    useEffect(() => {
        const sub = frameworkService.getState().subscribe(setState);
        return () => sub.unsubscribe();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass-premium border border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Cpu className="text-cyan-400" size={24} />
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Multi-Framework <span className="text-cyan-400">Core</span></h1>
                    </div>
                    <p className="text-slate-400 font-medium max-w-lg">
                        Sistema de orquestación en tiempo real sincronizando tres frameworks independientes:
                        <span className="text-cyan-400 font-black px-2">React</span> +
                        <span className="text-emerald-400 font-black px-2">Vue</span> +
                        <span className="text-red-500 font-black px-2">Angular</span>
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1 leading-none">Global Event Bus</p>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <button
                        onClick={() => frameworkService.reset('React')}
                        className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Framework Interaction" value={state.globalCount} color="text-cyan-400" />
                <StatCard label="Last Source" value={state.source} color="text-white" />
                <StatCard label="Last Action" value={state.lastAction} color="text-slate-400" />
            </div>

            {/* Component Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* React Component (Native Showcase) */}
                <TestReact />

                {/* Vue Component */}
                <VueWrapper />

                {/* Angular Component */}
                <AngularWrapper />

                {/* Passport.js Demo */}
                <PassportDemo />

                {/* jQuery Legacy Demo */}
                <JQueryWrapper />

                {/* Memcached Demo */}
                <MemcachedDemo />

                {/* PHP Bridge Showcase */}
                <PHPShowcase />

                {/* Vertex AI Enterprise Showcase */}
                <VertexAIDemo />

                {/* Semantic Search RAG Showcase */}
                <SemanticSearch />

                {/* Richard AI: Autonomous Control Center */}
                <RichardAIControl />
            </div>

            <div className="p-6 glass-premium border border-white/5 text-center">
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Richard Automotive Engineering • Experimental Multi-Runtime v1.0</p>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }: any) => (
    <div className="glass-premium p-6 border border-white/5 bg-white/[0.02]">
        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
);

export default FrameworkDashboard;
