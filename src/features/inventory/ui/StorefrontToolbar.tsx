import React from 'react';
import { Search, BrainCircuit, Camera, ArrowUpDown, Sparkles, Heart } from 'lucide-react';
import { CarType } from '@/domain/entities';

interface Props {
  state: any;
  actions: any;
}

export const StorefrontToolbar: React.FC<Props> = ({ state, actions }) => {
  return (
    <>
      <div className="sticky top-2 z-30 glass-premium px-4 py-4 md:top-4 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-cyan-200">
            Inventario Inteligente
          </p>
          <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-slate-300">
            {state.displayCars.length} unidades visibles
          </p>
        </div>
        <div className="flex flex-col items-center gap-5 lg:flex-row">
          {/* Search Bar */}
          <div className="group relative w-full flex-1">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-400"
              size={22}
            />
            <input
              type="text"
              placeholder={
                state.visualContext
                  ? `Buscando similares a: ${state.searchTerm}...`
                  : 'Buscar modelo, año o características...'
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl py-4 pl-14 pr-28 text-base font-semibold text-white outline-none placeholder:text-slate-500 transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/20"
              value={state.searchTerm}
              onChange={(e) => {
                state.setSearchTerm(e.target.value);
                state.setVisualContext(null);
                state.setSemanticResultIds([]);
              }}
            />

            <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 gap-2">
              <button
                onClick={() => actions.openNeuralMatch('search_bar')}
                className="btn-glow hidden items-center gap-2 rounded-xl border border-primary/20 bg-slate-800/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200 transition-all hover:border-primary/40 hover:bg-primary hover:text-white md:flex"
                title="Encuentra tu auto ideal por estilo de vida"
              >
                <BrainCircuit size={16} /> Neural Match
              </button>
              <button
                onClick={() => actions.openVisualSearch('search_bar')}
                className="btn-glow rounded-xl bg-slate-800/90 p-3 text-cyan-200 transition-all hover:bg-primary hover:text-white"
                title="Búsqueda Visual por IA"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>

          {/* Filters & Sorting */}
          <div className="scrollbar-hide flex w-full items-center gap-3 overflow-x-auto pb-1 lg:w-auto lg:pb-0">
            {/* Car Type Filter */}
            <div className="flex gap-2 rounded-full border border-white/10 bg-slate-900/60 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
              {['all', 'suv', 'sedan', 'pickup'].map((type) => (
                <button
                  key={type}
                  onClick={() => state.setFilter(type as CarType | 'all')}
                  className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                    state.filter === type
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  {type === 'all' ? 'Todos' : type}
                </button>
              ))}
            </div>

            {/* Price Sorting */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 p-1.5 backdrop-blur-xl">
              <button
                onClick={() => state.setSortOrder((prev: any) => (prev === 'asc' ? null : 'asc'))}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all ${
                  state.sortOrder === 'asc'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Menor Precio"
              >
                <ArrowUpDown size={14} className="rotate-180" />{' '}
                <span className="hidden sm:inline">$-$$$</span>
              </button>
              <button
                onClick={() => state.setSortOrder((prev: any) => (prev === 'desc' ? null : 'desc'))}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all ${
                  state.sortOrder === 'desc'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Mayor Precio"
              >
                <ArrowUpDown size={14} /> <span className="hidden sm:inline">$$$-$</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Banner */}
      <div className="mb-7 mt-6 flex flex-wrap items-end justify-between gap-3 px-2 sm:mt-8">
        <div>
          <h2
            id="inventory-heading"
            className="font-cinematic text-4xl leading-none tracking-[0.08em] text-cyan-100"
          >
            {state.displayCars.length} {state.isSearching ? 'Resultados' : 'Vehículos'}
          </h2>
          <p className="font-tech mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Selección activa para Puerto Rico
          </p>
          {state.savedCars.savedIds.length > 0 && (
            <button
              onClick={() => actions.onOpenGarage && actions.onOpenGarage()}
              className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200"
            >
              <Heart size={14} fill="currentColor" /> Ver Mi Garaje Digital (
              {state.savedCars.savedIds.length})
            </button>
          )}
        </div>
        {state.visualContext && (
          <div className="flex items-center gap-3 rounded-r-xl border-l-4 border-primary bg-primary/10 p-3 backdrop-blur-md">
            <Sparkles size={16} className="text-primary" />
            <p className="text-xs text-slate-300">
              <span className="font-bold text-primary">IA:</span> Resultados visuales
              activos.
            </p>
            <button
              onClick={() => {
                state.setVisualContext(null);
                state.setSearchTerm('');
                state.setFilter('all');
                state.setSemanticResultIds([]);
              }}
              className="ml-2 text-[10px] font-bold underline hover:text-primary-hover"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>
    </>
  );
};
