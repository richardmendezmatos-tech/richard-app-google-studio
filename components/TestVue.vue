<template>
  <div class="glass-premium p-8 border border-white/10 relative overflow-hidden group">
    <!-- Background Glow -->
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>

    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
        </div>
        <div>
          <h2 class="text-xl font-black text-white uppercase tracking-tighter">Vue <span class="text-emerald-400">Layer</span></h2>
          <p class="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">State Subscriber</p>
        </div>
      </div>

      <div class="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 mb-6">
        <div class="flex justify-between items-end">
          <div>
            <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Global Shared Count</p>
            <h3 class="text-5xl font-black text-white text-glow">{{ state.globalCount }}</h3>
          </div>
          <div class="text-right">
            <p class="text-[9px] uppercase font-black text-emerald-400/40 tracking-widest">Last Action From</p>
            <p class="text-sm font-black text-white uppercase">{{ state.source }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="increment"
          class="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-xs"
        >
          Push State
        </button>
        <button 
          @click="reset"
          class="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 border border-white/10 text-xs"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { frameworkService } from '../services/frameworkService';

const state = ref(frameworkService.getCurrentState());
let subscription;

onMounted(() => {
  subscription = frameworkService.getState().subscribe((newState) => {
    state.value = newState;
  });
});

onUnmounted(() => {
  if (subscription) subscription.unsubscribe();
});

const increment = () => frameworkService.increment('Vue');
const reset = () => frameworkService.reset('Vue');
</script>

<style scoped>
.text-glow {
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}
</style>
