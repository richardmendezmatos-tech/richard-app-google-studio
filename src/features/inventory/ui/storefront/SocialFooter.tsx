'use client';

import React from 'react';
import {
  Camera,
  Globe,
  X,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { motion } from 'framer-motion';

const SocialFooter: React.FC = () => {
  return (
    <footer
      aria-label="Capa de Salida Táctica de Richard Automotive"
      className="group relative mt-24 overflow-hidden rounded-[50px] border border-white/5 bg-slate-950 p-12 lg:p-20 text-white shadow-3xl lg:mx-6 mb-6"
    >
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#0a1929,#02060a)] opacity-95"></div>
      <div className="absolute inset-0 mesh-bg-elite opacity-10 pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        {/* Brand Command */}
        <div className="space-y-6 lg:col-span-1">
          <motion.h2
            whileHover={{ scale: 1.02 }}
            className="font-cinematic flex items-center gap-2 text-3xl uppercase tracking-widest text-white"
          >
            Richard<span className="text-cyan-400">Automotive</span>
          </motion.h2>
          <p className="text-sm font-medium leading-relaxed text-slate-400 max-w-xs">
            Redefiniendo la experiencia automotriz en Puerto Rico con transparencia y tecnología.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck size={20} className="text-cyan-400" />
            </div>
            <div className="space-y-0.5">
              <p className="font-tech text-[10px] font-black uppercase tracking-widest text-white">
                Certificado Richard Automotive
              </p>
              <p className="text-[9px] text-slate-600">Enterprise Security v2.0</p>
            </div>
          </div>
        </div>

        {/* Strategic Links */}
        <div className="space-y-6">
          <h3 className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            OPERACIONES
          </h3>
          <ul className="space-y-3 font-tech text-sm">
            <li>
              <FooterLink label="Inventario" href="/inventario" />
            </li>
            <li>
              <FooterLink label="Tasación" href="/tasacion" />
            </li>
            <li>
              <FooterLink label="Financiamiento" href="/financiamiento" />
            </li>
            <li>
              <FooterLink label="Chat" href="/api/ai/chat" />
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            NODOS DE RED
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ul className="space-y-3 font-tech text-[11px]">
              <li>
                <FooterLink label="Vega Alta" href="/autos-usados/vega-alta" />
              </li>
              <li>
                <FooterLink label="Bayamón" href="/autos-usados/bayamon" />
              </li>
              <li>
                <FooterLink label="San Juan" href="/autos-usados/san-juan" />
              </li>
              <li>
                <FooterLink label="Dorado" href="/autos-usados/dorado" />
              </li>
            </ul>
            <ul className="space-y-3 font-tech text-[11px]">
              <li>
                <FooterLink label="SUVs Premium" href="/autos-usados/tipo/suv" />
              </li>
              <li>
                <FooterLink label="Pickups" href="/autos-usados/tipo/pickup" />
              </li>
              <li>
                <FooterLink label="Luxury" href="/autos-usados/tipo/luxury" />
              </li>
              <li>
                <FooterLink label="Sedanes" href="/autos-usados/tipo/sedan" />
              </li>
            </ul>
          </div>
        </div>

        {/* Intelligence Pulse */}
        <div className="space-y-6">
          <h3 className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            PULSO EN VIVO
          </h3>
          <div className="rounded-4xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-tech text-[10px] font-bold text-slate-400">SERVIDOR</span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="font-tech text-[10px] text-emerald-500">ACTIVO</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-cinematic text-3xl text-white">2,842</span>
              <span className="font-tech text-[10px] text-slate-600">QUERIES / DAY</span>
            </div>
            <div className="flex gap-3">
{SITE_CONFIG.social.instagram && <SocialIcon icon={<Camera size={16} />} href={SITE_CONFIG.social.instagram} label="Instagram" />}

              {SITE_CONFIG.social.facebook && <SocialIcon icon={<Globe size={16} />} href={SITE_CONFIG.social.facebook} label="Facebook" />}

              {SITE_CONFIG.social.youtube && <SocialIcon icon={<Play size={16} />} href={SITE_CONFIG.social.youtube} label="YouTube" />}

              {SITE_CONFIG.social.twitter && <SocialIcon icon={<X size={16} />} href={SITE_CONFIG.social.twitter} label="Twitter" />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-10 font-tech text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 md:flex-row">
        <p>&copy; 2026 Richard Automotive. Strategic Dominance Protocol.</p>
        <div className="flex gap-8">
          <a href="/privacidad" className="hover:text-cyan-400 transition-colors">
            Privacy
          </a>
          <a href="/terminos" className="hover:text-cyan-400 transition-colors">
            Terms
          </a>
          <a href="/sitemap.xml" className="hover:text-cyan-400 transition-colors">
            Sitemap
          </a>
        </div>
      </div>

      <style>{`
        .mesh-bg-elite {
          background: linear-gradient(-45deg, #00e5ff11, #7000ff11, #ff007005, #00ffaa05);
          background-size: 400% 400%;
          animation: meshGradient 15s ease infinite;
        }
      `}</style>
    </footer>
  );
};

const FooterLink = ({ label, href = '#' }: { label: string; href?: string }) => (
  <a
    href={href}
    className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group"
  >
    <div className="h-1 w-0 bg-cyan-400 group-hover:w-3 transition-all duration-300" />
    {label}
  </a>
);

const SocialIcon = ({ icon, href, label }: { icon: any; href: string; label?: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label || 'Red social'}
    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-500 transition-all active:scale-90"
  >
    {icon}
  </a>
);

export default SocialFooter;
