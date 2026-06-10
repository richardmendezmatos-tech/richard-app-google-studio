import React from 'react';
import { ThemeApplier } from './ThemeApplier';
import { ScrollToTop } from './ScrollToTop';

export const MarketingCinemaLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
      <ThemeApplier />
      <ScrollToTop />
      <main id="cinema-content" className="relative z-10 min-h-full">
        {children}
      </main>
    </div>
  );
};
