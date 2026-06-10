'use client';

import React from 'react';
import Image from 'next/image';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 min-h-screen" style={{ zIndex: 0 }}>
      <div className="absolute inset-0 bg-slate-950" style={{ zIndex: 1 }} />
      <Image
        src="/hero.avif"
        alt=""
        fill
        priority
        className="object-cover opacity-30"
        sizes="100vw"
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
    </div>
  );
}
