'use client';

import { useState, useCallback, useEffect } from 'react';
import { Gift, MessageCircle, Link, Check, DollarSign, Loader2 } from 'lucide-react';

interface ReferralWidgetProps {
  phone: string;
  name?: string;
  referralCode?: string;
  stats?: { total: number; pending: number; converted: number; earned: number };
  onShare?: (method: string) => void;
}

export function ReferralWidget({
  phone,
  name,
  referralCode: initialCode,
  stats: initialStats,
  onShare,
}: ReferralWidgetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState(initialCode || '');
  const [stats, setStats] = useState(
    initialStats || { total: 0, pending: 0, converted: 0, earned: 0 },
  );
  const [loading, setLoading] = useState(!initialCode);

  useEffect(() => {
    if (initialCode) return;
    const params = new URLSearchParams({ phone });
    if (name) params.set('name', name);
    fetch(`/api/referrals?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code) setCode(data.code);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {
        /* API unavailable — keep default empty state */
      })
      .finally(() => setLoading(false));
  }, [phone, initialCode, name]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://richard-automotive.com';
  const referralUrl = `${baseUrl}/recomienda?ref=${code}`;
  const encodedUrl = encodeURIComponent(referralUrl);

  const shareText =
    name
      ? `🎁 ${name} te invita a Richard Automotive — Recibe $100 de descuento en tu compra. Usa su código: ${code}`
      : `🎁 Recibe $100 de descuento en tu compra en Richard Automotive. Usa el código: ${code}`;

  const handleWhatsApp = useCallback(() => {
    const message = `${shareText}%0A%0A${encodedUrl}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
    onShare?.('whatsapp');
    setOpen(false);
  }, [shareText, encodedUrl, onShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.('copy');
    } catch {
      // clipboard unavailable
    }
  }, [referralUrl, onShare]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl text-sm text-emerald-400 font-bold transition-all border border-emerald-500/20"
      >
        <Gift size={16} />
        <span>Recomienda y Gana $200</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 min-w-[320px] backdrop-blur-xl">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-emerald-400" size={24} />
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-black text-white">Recomienda y Gana</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Comparte tu código y gana $200 por cada amigo que compre
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-4 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                    Tu Código
                  </p>
                  <p className="text-2xl font-black tracking-[0.2em] text-cyan-400">{code}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-lg font-black text-white">{stats.total}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enviados</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-lg font-black text-amber-400">{stats.pending}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pendientes</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-lg font-black text-emerald-400">{stats.converted}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ganados</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ganado</span>
                  </div>
                  <span className="text-xl font-black text-emerald-400">${stats.earned.toLocaleString()}</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-green-400 hover:bg-green-500/10 rounded-lg transition"
                  >
                    <MessageCircle size={18} />
                    Compartir por WhatsApp
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition"
                  >
                    {copied ? (
                      <Check size={18} className="text-emerald-400" />
                    ) : (
                      <Link size={18} className="text-slate-400" />
                    )}
                    {copied ? '¡Enlace copiado!' : 'Copiar enlace de referido'}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 text-center">
                  <a
                    href="/recomienda"
                    className="text-xs text-cyan-400 hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Ver detalles del programa
                  </a>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}


