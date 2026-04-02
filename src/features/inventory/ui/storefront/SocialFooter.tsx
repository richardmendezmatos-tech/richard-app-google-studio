"use client";

import React from 'react';
import { Globe, Instagram, Facebook, Twitter, Youtube, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { motion } from 'motion/react';

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
          <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-xs">
            Redefiniendo la soberanía automotriz en Puerto Rico a través de Inteligencia Artificial y transparencia de Command Center.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck size={20} className="text-cyan-400" />
            </div>
            <div className="space-y-0.5">
              <p className="font-tech text-[10px] font-black uppercase tracking-widest text-white">Sentinel Certified</p>
              <p className="text-[9px] text-slate-600">Enterprise Security v2.0</p>
            </div>
          </div>
        </div>

        {/* Strategic Links */}
        <div className="space-y-6">
          <h3 className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">OPERATIONS</h3>
          <ul className="space-y-3 font-tech text-sm">
            <li><FooterLink label="Inventario Elite" /></li>
            <li><FooterLink label="Neural Appraisal" /></li>
            <li><FooterLink label="Mission: Financials" /></li>
            <li><FooterLink label="Richard AI Portal" /></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">COMMAND HUB</h3>
          <ul className="space-y-3 font-tech text-sm">
            <li><FooterLink label="Bayamón HQ" /></li>
            <li><FooterLink label="Fleet Solutions" /></li>
            <li><FooterLink label="VIP Concierge" /></li>
            <li><FooterLink label="Tech Support" /></li>
          </ul>
        </div>

        {/* Intelligence Pulse */}
        <div className="space-y-6">
          <h3 className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">LIVE PULSE</h3>
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-tech text-[10px] font-bold text-slate-400">AI SERVER</span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="font-tech text-[10px] text-emerald-500">ONLINE</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-cinematic text-3xl text-white">2,842</span>
              <span className="font-tech text-[10px] text-slate-600">QUERIES / DAY</span>
            </div>
            <div className="flex gap-3">
              <SocialIcon icon={<Instagram size={16} />} href={SITE_CONFIG.social.instagram} />
              <SocialIcon icon={<Facebook size={16} />} href={SITE_CONFIG.social.facebook} />
              <SocialIcon icon={<Youtube size={16} />} href={SITE_CONFIG.social.youtube} />
              <SocialIcon icon={<Twitter size={16} />} href={SITE_CONFIG.social.twitter} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-10 font-tech text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 md:flex-row">
        <p>&copy; 2026 Richard Automotive. Strategic Dominance Protocol.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Sitemap</a>
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

const FooterLink = ({ label }: { label: string }) => (
  <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
    <div className="h-1 w-0 bg-cyan-400 group-hover:w-3 transition-all duration-300" />
    {label}
  </a>
);

const SocialIcon = ({ icon, href }: { icon: any; href?: string }) => (
  <a 
    href={href} 
    target="_blank"
    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-500 transition-all active:scale-90"
  >
    {icon}
  </a>
);

export default SocialFooter;
