'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Users,
  Star,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

const C = BUSINESS_CONTACT;

const STATS = [
  { value: '15+', label: 'Años de experiencia', icon: TrendingUp },
  { value: '2,400+', label: 'Familias ayudadas', icon: Users },
  { value: '4.9★', label: 'Calificación Google', icon: Star },
  { value: '100%', label: 'Ford Authorized Dealer', icon: ShieldCheck },
];

const CREDENTIALS = [
  'Especialista certificado en Finance & Insurance (F&I)',
  'Dealer Autorizado Ford Motor Company — Central Ford',
  'Licenciado por el DTOP de Puerto Rico',
  'Afiliado a la Puerto Rico Automobile Dealers Association (PRADA)',
  'Certificación Ford Product Training — nivel avanzado',
  'Miembro activo de la cámara de comercio de Vega Alta',
];

const REVIEWS = [
  {
    name: 'Carlos M.',
    city: 'Bayamón',
    rating: 5,
    text: 'Richard me consiguió la tasa más baja que he visto en años. Todo el proceso de financiamiento fue claro, rápido y sin sorpresas. Mi Ford F-150 lo conseguí en 2 días.',
  },
  {
    name: 'Ana R.',
    city: 'San Juan',
    rating: 5,
    text: 'Primera vez comprando auto en PR y Richard me explicó cada paso. Sin presión, sin letra pequeña escondida. Salí con mi Ford Explorer y con confianza total.',
  },
  {
    name: 'Luis T.',
    city: 'Vega Alta',
    rating: 5,
    text: 'Vine con crédito bajo y pensé que no iba a calificar. Richard trabajó con 3 bancos distintos hasta conseguirme la aprobación. Profesional de verdad.',
  },
  {
    name: 'María G.',
    city: 'Caguas',
    rating: 5,
    text: 'Compré mi Ford Maverick con el Bono de $300 y un pago mensual que no me creía. Richard fue súper honesto con todos los números, sin cargos escondidos. Lo recomiendo 100%.',
  },
  {
    name: 'José A.',
    city: 'Arecibo',
    rating: 5,
    text: 'Llamé por WhatsApp y en menos de una hora Richard ya me tenía tres opciones de financiamiento. Nunca había visto tanta eficiencia en un dealer. El proceso fue completamente digital.',
  },
  {
    name: 'Xiomara L.',
    city: 'Ponce',
    rating: 5,
    text: 'Primer auto de mi vida y Richard me hizo sentir segura en cada decisión. Me explicó la diferencia entre las tasas, los plazos y los seguros de forma que entendí todo. ¡Gracias!',
  },
];

const FAQS = [
  {
    question: '¿Dónde está ubicado Richard Automotive?',
    answer: 'Estamos en Carr. #2 KM 28.5, Bo. Espinosa, Vega Alta, Puerto Rico 00692. Frente a Plaza Vega Alta, fácil acceso desde la PR-22.',
  },
  {
    question: '¿Cuáles son los horarios de atención?',
    answer: 'Lunes a viernes de 8:00 AM a 7:00 PM, sábados de 9:00 AM a 5:00 PM. Domingos cerramos. También puedes contactarnos por WhatsApp las 24 horas.',
  },
  {
    question: '¿Tienen financiamiento para crédito malo o sin historial?',
    answer: 'Sí. Trabajamos con programas especiales para primeros compradores, crédito limitado y reconstrucción de crédito. Ofrecemos opciones con $0 down payment y plazos flexibles.',
  },
  {
    question: '¿Puedo hacer el proceso de compra completamente online?',
    answer: 'Sí, desde la precualificación hasta la firma de documentos puede hacerse de forma digital. Solo visitas el dealer para el test drive y la entrega de tu vehículo.',
  },
  {
    question: '¿Aceptan trade-in?',
    answer: 'Absolutamente. Tasamos tu vehículo actual en minutos y aplicamos el valor como parte del pago inicial de tu próximo auto. Aceptamos cualquier marca y modelo en buen estado.',
  },
  {
    question: '¿Qué es el Bono Web de $300?',
    answer: 'Es un descuento exclusivo de $300 para gastos de cierre disponible solo para clientes que nos contactan a través del sitio web o WhatsApp. Aplica en la compra de cualquier vehículo nuevo o usado certificado.',
  },
];

export function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/6 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-cyan-500/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
              Quiénes Somos
            </span>
            <div className="h-px w-8 bg-cyan-500/50" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
                Richard Méndez<br />
                <span className="text-cyan-400">Matos</span>
              </h1>
              <p className="text-slate-400 text-sm uppercase tracking-[0.2em] font-bold mb-4">
                Especialista F&amp;I · Central Ford, Vega Alta, Puerto Rico
              </p>
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                Con más de 15 años en la industria automotriz de Puerto Rico, Richard Méndez es
                reconocido como uno de los especialistas de Finance &amp; Insurance (F&amp;I) más
                completos de la isla. Su misión: que cada familia puertorriqueña conduzca el auto
                que merece, con el financiamiento que puede pagar.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Como parte del equipo de <strong className="text-white">Central Ford en Vega Alta</strong>,
                Richard ha cerrado más de 2,400 transacciones, siempre con transparencia total en
                tasas, plazos y seguros. No vende productos que no necesitas — te educa para que
                tomes la decisión correcta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/17872146200?text=Hola%20Richard%2C%20vi%20tu%20perfil%20y%20quisiera%20información%20sobre%20un%20auto`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,211,102,0.35)] transition-all hover:scale-[1.02]"
                >
                  <MessageCircle size={16} /> Hablar con Richard
                </a>
                <Link
                  href="/qualify"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Calcular mi Pago →
                </Link>
              </div>
            </div>

            {/* Photo card */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 aspect-[4/5]">
                <img
                  src="/assets/images/richard_real.jpg"
                  alt="Richard Méndez Matos — Especialista F&I Central Ford Vega Alta Puerto Rico"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Credential badge */}
              <div className="absolute -bottom-4 -right-4 bg-slate-950 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-cyan-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Ford Authorized</p>
                    <p className="text-[9px] text-slate-500">Central Ford · Vega Alta PR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 border-y border-white/5 bg-slate-900/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-3">
                <Icon size={20} className="text-cyan-400" />
              </div>
              <p className="text-3xl font-black text-white mb-1">{value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Credenciales / Expertise ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4">
              Certificaciones &amp; Credenciales
            </p>
            <h2 className="text-3xl font-black mb-6 leading-tight">
              Experiencia que<br />
              <span className="text-cyan-400">respalda cada consejo</span>
            </h2>
            <div className="space-y-3">
              {CREDENTIALS.map((cred) => (
                <div key={cred} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{cred}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Central Ford / Brand trust */}
          <div className="space-y-5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4">
              Respaldo de Marca
            </p>
            <h2 className="text-3xl font-black mb-6 leading-tight">
              Dealer Autorizado<br />
              <span className="text-cyan-400">Ford Motor Company</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Richard Automotive opera bajo la franquicia de <strong className="text-white">Central Ford</strong>,
              concesionario oficial de Ford Motor Company en Puerto Rico. Esto significa que toda
              venta está respaldada por la garantía de fábrica Ford, acceso al financiamiento de
              Ford Credit, y soporte post-venta de Ford Puerto Rico.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Garantía Fábrica', value: '3 años / 36k mi' },
                { label: 'Tren Motriz', value: '5 años / 60k mi' },
                { label: 'Ford Credit APR', value: 'Desde 0 %' },
                { label: 'Servicio Autorizado', value: 'Toda PR y EEUU' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-900/60 rounded-2xl border border-white/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews / Trustworthiness ── */}
      <section className="py-20 px-6 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-3">
              Testimonios Verificados
            </p>
            <h2 className="text-3xl md:text-4xl font-black">
              Lo que dicen nuestros <span className="text-cyan-400">clientes</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-xs">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{r.name}</p>
                    <p className="text-[10px] text-slate-500">{r.city}, Puerto Rico</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-6">
            Reseñas reales de Google Maps · Richard Automotive Central Ford
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-3">
              Preguntas Frecuentes
            </p>
            <h2 className="text-3xl md:text-4xl font-black">
              Todo lo que necesitas <span className="text-cyan-400">saber</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/5 bg-slate-900/60 overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none hover:bg-white/[0.02] transition">
                  <span className="text-sm font-bold text-white">{faq.question}</span>
                  <span className="shrink-0 text-cyan-400 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info de contacto / Location ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4">
              Visítanos
            </p>
            <h2 className="text-3xl font-black mb-6 leading-tight">
              Estamos en <span className="text-cyan-400">Vega Alta, Puerto Rico</span>
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-bold">{C.address.full}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Carr. 2 km 28.5 · Frente a Plaza Vega Alta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-cyan-400" />
                <a href={`tel:+1${C.phone.replace(/-/g, '')}`} className="text-sm text-white hover:text-cyan-400 transition">
                  {C.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300 space-y-0.5">
                  <p><span className="text-white font-bold">Lunes – Viernes:</span> {C.hours.weekdays}</p>
                  <p><span className="text-white font-bold">Sábado:</span> {C.hours.saturday}</p>
                  <p><span className="text-slate-500">Domingo:</span> {C.hours.sunday}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/17872146200`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-105"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                Otras formas de contacto →
              </Link>
            </div>
          </div>

          {/* Awards / trust badges */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, label: 'Ford Dealer Award', sub: 'Certificación Oficial' },
              { icon: ShieldCheck, label: 'DTOP Licenciado', sub: 'Puerto Rico' },
              { icon: Star, label: '4.9 / 5.0 estrellas', sub: 'Google Reviews' },
              { icon: Users, label: 'PRADA Miembro', sub: 'Dealers Association PR' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 text-center flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Icon size={18} className="text-cyan-400" />
                </div>
                <p className="text-xs font-black text-white leading-tight">{label}</p>
                <p className="text-[10px] text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer legalE-E-A-T ── */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-400">Richard Automotive</strong> opera como franquiciado de Central Ford bajo licencia de Ford Motor Company.
            Las transacciones de financiamiento están sujetas a aprobación crediticia por entidades financieras independientes.
            APR, plazos y mensualidades son estimados y pueden variar. Dealer licenciado bajo el Departamento de Transportación y Obras Públicas (DTOP) de Puerto Rico.
            La información en este sitio es de carácter educativo y no constituye asesoramiento financiero formal.
          </p>
        </div>
      </div>
    </div>
  );
}
