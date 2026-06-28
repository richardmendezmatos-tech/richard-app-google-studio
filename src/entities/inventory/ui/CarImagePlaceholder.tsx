'use client';

import React from 'react';

interface Props {
  make?: string;
  model?: string;
  year?: number;
  className?: string;
}

// Per-make gradient colors for brand recognition
const MAKE_COLORS: Record<string, [string, string]> = {
  ford: ['#003478', '#0075C9'],
  toyota: ['#EB0A1E', '#9B0000'],
  honda: ['#CC0000', '#890000'],
  chevrolet: ['#D4AF37', '#A07800'],
  nissan: ['#C3002F', '#800020'],
  hyundai: ['#002C5F', '#00499F'],
  kia: ['#05141F', '#1B4078'],
  jeep: ['#2D5F2D', '#1A3D1A'],
  ram: ['#1E1E1E', '#4A4A4A'],
  dodge: ['#D00000', '#900000'],
  gmc: ['#CC0000', '#8B0000'],
  bmw: ['#1C69D4', '#0A3D91'],
  mercedes: ['#1A1A1A', '#3D3D3D'],
  volkswagen: ['#001E50', '#0040B0'],
  audi: ['#BB0A21', '#8B0000'],
  lexus: ['#1A1A2E', '#16213E'],
  subaru: ['#003399', '#0055CC'],
  mazda: ['#910000', '#660000'],
};

const CAR_SILHOUETTE = (
  <svg viewBox="0 0 200 80" fill="currentColor" className="w-full max-w-[140px] opacity-20">
    <path d="M185,45 L175,45 C174,38 167,33 160,33 C153,33 146,38 145,45 L55,45 C54,38 47,33 40,33 C33,33 26,38 25,45 L15,45 L10,40 L10,32 L20,28 L55,22 L90,15 L130,15 L160,22 L185,28 L190,32 L190,40 Z" />
    <circle cx="40" cy="47" r="8" />
    <circle cx="160" cy="47" r="8" />
  </svg>
);

export const CarImagePlaceholder: React.FC<Props> = ({
  make = '',
  model = '',
  year,
  className = '',
}) => {
  const key = make.toLowerCase().split(' ')[0];
  const [from, to] = MAKE_COLORS[key] || ['#0f2a3d', '#173d57'];

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-3 select-none ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <div className="text-white">{CAR_SILHOUETTE}</div>
      <div className="text-center px-4">
        {year && (
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-0.5">
            {year}
          </p>
        )}
        <p className="text-sm font-black uppercase tracking-wider text-white/70 leading-tight">
          {make} {model}
        </p>
      </div>
    </div>
  );
};

export default CarImagePlaceholder;
