import React from 'react';
import Image from 'next/image';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 min-h-screen pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0 bg-slate-950" style={{ zIndex: 1 }} />
      {/* next/image con priority=true genera preload automático + sirve AVIF/WebP optimizado */}
      <Image
        src="/hero.avif"
        alt="Richard Automotive"
        fill
        priority
        sizes="100vw"
        quality={75}
        className="object-cover opacity-30"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent"
        style={{ zIndex: 2 }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.15)_0%,_transparent_70%)]"
        style={{ zIndex: 3 }}
      />
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24"
        style={{ zIndex: 10 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-2">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] font-tech">
              Richard Automotive
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-white font-cinematic">
              Estrena Hoy
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                Tu SUV
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl text-slate-400 font-manrope font-normal not-uppercase tracking-normal block mt-2">
                Ideal para tu Familia
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
