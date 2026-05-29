'use client';

import { useState } from 'react';
import { User, Phone, Mail, MessageCircle, Loader2, Check, Gift } from 'lucide-react';

export function RecomiendaForm() {
  const [step, setStep] = useState(1);
  const [referrerName, setReferrerName] = useState('');
  const [referrerPhone, setReferrerPhone] = useState('');
  const [refereeName, setRefereeName] = useState('');
  const [refereePhone, setRefereePhone] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [resultCode, setResultCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerName,
          referrerPhone,
          refereeName,
          refereePhone,
          refereeEmail: refereeEmail || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar referido');
      }

      setResultCode(data.code);
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const shareText = encodeURIComponent(
      `🎁 Te invito a Richard Automotive — Recibe $100 de descuento en tu compra. Usa mi código: ${resultCode}`,
    );
    const shareUrl = encodeURIComponent('https://richard-automotive.com/recomienda');

    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold">¡Referido Registrado!</h2>
        <p className="text-slate-400">
          Gracias por recomendar a <strong className="text-white">{refereeName}</strong>.
          {refereePhone && (
            <>
              {' '}Le enviaremos un WhatsApp con su código de descuento de{' '}
              <strong className="text-emerald-400">$100</strong>.
            </>
          )}
        </p>

        <div className="bg-white/5 rounded-xl p-4 inline-block">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
            Tu código de referido
          </p>
          <p className="text-3xl font-black tracking-[0.2em] text-cyan-400">{resultCode}</p>
        </div>

        <p className="text-sm text-slate-500">
          Comparte tu código con más amigos y sigue ganando{' '}
          <strong className="text-emerald-400">$200</strong> por cada compra.
        </p>

        <a
          href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
        >
          <MessageCircle size={18} />
          Compartir por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span className={step === 1 ? 'text-cyan-400' : ''}>Tus Datos</span>
        <span className="text-slate-700">/</span>
        <span className={step === 2 ? 'text-cyan-400' : ''}>Datos de tu Amigo</span>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Tu Nombre
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={referrerName}
                onChange={(e) => setReferrerName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Tu Teléfono
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="tel"
                value={referrerPhone}
                onChange={(e) => setReferrerPhone(e.target.value)}
                placeholder="Ej: 787-555-1234"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!referrerName || !referrerPhone}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 shadow-lg shadow-cyan-500/25"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Nombre de tu Amigo
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={refereeName}
                onChange={(e) => setRefereeName(e.target.value)}
                placeholder="Ej: María García"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Teléfono de tu Amigo
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="tel"
                value={refereePhone}
                onChange={(e) => setRefereePhone(e.target.value)}
                placeholder="Ej: 787-555-5678"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email de tu Amigo <span className="text-slate-600">(opcional)</span>
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                value={refereeEmail}
                onChange={(e) => setRefereeEmail(e.target.value)}
                placeholder="Ej: maria@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={submitting || !refereeName || !refereePhone}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Gift size={18} />
                  Recomendar Amigo
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
