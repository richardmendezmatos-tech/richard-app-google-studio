'use client';

import { useState } from 'react';
import { CalendarDays, Clock, User, Mail, Phone, MessageCircle, Loader2, Check } from 'lucide-react';
import { TimeSlotPicker } from '@/features/appointments/ui/TimeSlotPicker';

interface ServiceOption {
  id: string;
  label: string;
  desc: string;
}

interface ServiceFormProps {
  options: ServiceOption[];
}

export function ServiceForm({ options }: ServiceFormProps) {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, date, time,
          type: 'service',
          vehicleInfo,
          message: `${message ? message + ' | ' : ''}Servicio: ${serviceType}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al agendar');
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold">¡Cita Agendada!</h2>
        <p className="text-slate-400">
          Te esperamos el <strong className="text-white">{date}</strong> a las{' '}
          <strong className="text-white">{time}</strong> para tu servicio de{' '}
          {options.find((o) => o.id === serviceType)?.label || serviceType}.
        </p>
        <p className="text-sm text-slate-500">
          Recibirás un recordatorio. Si necesitas cambiar la cita, llámanos al 787-555-1234.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span className={step === 1 ? 'text-cyan-400' : ''}>Servicio</span>
        <span>/</span>
        <span className={step === 2 ? 'text-cyan-400' : ''}>Fecha</span>
        <span>/</span>
        <span className={step === 3 ? 'text-cyan-400' : ''}>Datos</span>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-sm font-bold text-slate-300 mb-2">¿Qué servicio necesitas?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setServiceType(opt.id); setStep(2); }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  serviceType === opt.id
                    ? 'bg-cyan-500/20 border-cyan-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <p className="text-sm font-bold text-white">{opt.label}</p>
                <p className="text-[10px] text-slate-500 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <CalendarDays size={16} className="text-cyan-400" />
              ¿Qué día te gustaría venir?
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <Clock size={16} className="text-cyan-400" />
              ¿A qué hora?
            </span>
            <TimeSlotPicker selected={time} onChange={setTime} />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              Vehículo (año, marca, modelo)
            </span>
            <input
              type="text"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              placeholder="Ej: 2020 Ford Explorer"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!date || !time || !vehicleInfo}
              className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <User size={16} className="text-cyan-400" />
              Nombre completo
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <Mail size={16} className="text-cyan-400" />
              Correo electrónico
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              <Phone size={16} className="text-cyan-400" />
              Teléfono
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="787-555-1234"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
              Notas adicionales (opcional)
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition resize-none"
            />
          </label>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={submitting || !name || !email || !phone}
              className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <MessageCircle size={18} />
                  Agendar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
