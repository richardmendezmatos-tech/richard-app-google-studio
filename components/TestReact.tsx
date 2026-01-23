import React, { useState, useEffect } from 'react';
import { frameworkService, FrameworkState } from '../services/frameworkService';
import { Atom, Activity, LucideIcon } from 'lucide-react';

const TestReact: React.FC = () => {
    const [state, setState] = useState<FrameworkState>(frameworkService.getCurrentState());

    useEffect(() => {
        const sub = frameworkService.getState().subscribe(setState);
        return () => sub.unsubscribe();
    }, []);

    const handleIncrement = () => {
        frameworkService.increment('React');
    };

    const handleReset = () => {
        frameworkService.reset('React');
    };

    return (
        <div className="glass-premium p-8 border border-cyan-500/20 relative overflow-hidden group h-full">
            {/* Background Animated Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-1000"></div>

            <div className="relative z-10">
                <header className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-spin-slow">
                        <Atom className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">React <span className="text-cyan-400">Native</span></h2>
                        <p className="text-[10px] text-cyan-400/60 font-black uppercase tracking-widest font-mono">Component Runtime</p>
                    </div>
                </header>

                <section className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 mb-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1 font-mono">Global Shared Count</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
                                {state.globalCount}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase font-black text-slate-500/40 tracking-widest mb-1">State Source</p>
                            <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                                <span className="text-[10px] font-black text-cyan-400 uppercase">{state.source}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex gap-3">
                    <button
                        onClick={handleIncrement}
                        className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-cyan-500/20 text-xs border border-cyan-400/30"
                    >
                        React Push
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 border border-white/10 text-xs"
                    >
                        Reset
                    </button>
                </div>

                <footer className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${state.source === 'React' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active State</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-600 uppercase">Richard Automotive</p>
                </footer>
            </div>
        </div>
    );
};

export default TestReact;
