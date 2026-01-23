import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { frameworkService, FrameworkState } from '../services/frameworkService';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-test-angular',
  imports: [CommonModule],
  template: `
    <div class="glass-premium p-8 border border-white/10 relative overflow-hidden group">
      <!-- Background Glow -->
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 blur-[80px] group-hover:bg-red-500/20 transition-all duration-700"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m3.5 13.5 2 7 8 2 8-2 2-7"/><path d="m12 2 4.5 9h-9L12 2Z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-white uppercase tracking-tighter">Angular <span class="text-red-500">Core</span></h2>
            <p class="text-[10px] text-red-500/60 font-black uppercase tracking-widest">Reactive Subscriber</p>
          </div>
        </div>

        <div class="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 mb-6">
          <div class="flex justify-between items-end">
            <div>
              <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Global Shared Count</p>
              <h3 class="text-5xl font-black text-white text-glow">{{ state?.globalCount }}</h3>
            </div>
            <div class="text-right">
              <p class="text-[9px] uppercase font-black text-red-400/40 tracking-widest">Last Action From</p>
              <p class="text-sm font-black text-white uppercase">{{ state?.source }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            (click)="increment()"
            class="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-red-500/20 text-xs"
          >
            Emit State
          </button>
          <button 
            (click)="reset()"
            class="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 border border-white/10 text-xs"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .text-glow {
      text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
    }
  `]
})
export class TestAngularComponent implements OnInit, OnDestroy {
  state: FrameworkState | null = null;
  private sub: Subscription | null = null;

  ngOnInit() {
    this.sub = frameworkService.getState().subscribe(s => this.state = s);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  increment() {
    frameworkService.increment('Angular');
  }

  reset() {
    frameworkService.reset('Angular');
  }
}
