'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Search } from 'lucide-react';
import { searchSemanticInventory, SemanticMatch } from '@/shared/api/supabase/supabaseClient';

interface NeuralSearchBarProps {
  onResults?: (results: SemanticMatch[]) => void;
  className?: string;
}

export const NeuralSearchBar: React.FC<NeuralSearchBarProps> = ({ onResults, className = '' }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Convert text to embeddings
      const res = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });

      if (!res.ok) {
        throw new Error('AI Core offline');
      }

      const { embedding } = await res.json();

      // 2. Query Supabase for semantic matches
      const matches = await searchSemanticInventory(embedding, 0.4, 5);
      
      if (onResults) {
        onResults(matches);
      }
    } catch (err: any) {
      console.error(err);
      setError('Neural connection interrupted. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl">
          <div className="pl-4 pr-2 text-primary/50">
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-slate-400 font-tech px-2 py-3 outline-none w-full"
            placeholder="Ejem: Busco una guagua económica que gaste poca gasolina..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary hover:bg-primary/80 text-white p-3 rounded-xl transition shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Search size={20} />
          </button>
        </div>
      </form>
      {error && (
        <p className="absolute -bottom-8 left-0 text-red-400 text-xs font-tech tracking-wider">{error}</p>
      )}
    </div>
  );
};
