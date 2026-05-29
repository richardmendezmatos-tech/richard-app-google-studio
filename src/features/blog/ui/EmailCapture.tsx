'use client';

import { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/shared/api/supabase/client';

export function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const supabase = createClient();
      const { error } = await supabase.from('subscribers').insert([
        { email, source: 'blog' },
      ]);

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          return;
        }
        throw error;
      }
      setStatus('success');
    } catch (err) {
      console.error('[EmailCapture] Error:', err);
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <Check className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-300 font-medium">
          ¡Gracias! Ahora recibirás noticias Ford y guías automotrices en tu correo.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl"
    >
      <div className="flex items-center gap-3 flex-1">
        <Mail className="w-5 h-5 text-slate-500 shrink-0" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Suscribirme'
        )}
      </button>
    </form>
  );
}
