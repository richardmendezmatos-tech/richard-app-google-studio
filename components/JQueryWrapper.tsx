import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import { frameworkService } from '../services/frameworkService';
import { Database } from 'lucide-react';

const JQueryWrapper: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const $el = $(containerRef.current);

        // 1. Initial Render with jQuery
        $el.html(`
      <div class="glass-premium p-8 border border-white/10 relative overflow-hidden group h-full">
        <!-- Background Glow -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-slate-500/10 blur-[80px] group-hover:bg-slate-500/20 transition-all duration-700"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20">
              <i class="fas fa-code text-white"></i>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-black text-white uppercase tracking-tighter">jQuery <span class="text-slate-400">Legacy</span></h2>
              <p class="text-[10px] text-slate-400/60 font-black uppercase tracking-widest">Direct DOM Operator</p>
            </div>
          </div>

          <div class="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 mb-6">
            <div class="flex justify-between items-end">
              <div>
                <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Global Shared Count</p>
                <h3 id="jq-count" class="text-5xl font-black text-white" style="text-shadow: 0 0 20px rgba(148, 163, 184, 0.5)">0</h3>
              </div>
              <div class="text-right">
                <p class="text-[9px] uppercase font-black text-slate-400/40 tracking-widest">Last Action From</p>
                <p id="jq-source" class="text-sm font-black text-white uppercase">System</p>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button 
              id="jq-increment"
              class="flex-1 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-slate-500/20 text-xs"
            >
              Legacy Push
            </button>
            <button 
              id="jq-reset"
              class="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 border border-white/10 text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    `);

        // 2. Event Handling with jQuery
        $el.on('click', '#jq-increment', () => {
            frameworkService.increment('jQuery' as any);
        });

        $el.on('click', '#jq-reset', () => {
            frameworkService.reset('jQuery' as any);
        });

        // 3. Reacting to RxJS state changes
        const subscription = frameworkService.getState().subscribe((state) => {
            $('#jq-count').text(state.globalCount);
            $('#jq-source').text(state.source);
        });

        // 4. Cleanup
        return () => {
            $el.off();
            subscription.unsubscribe();
        };
    }, []);

    return <div ref={containerRef} className="h-full"></div>;
};

export default JQueryWrapper;
