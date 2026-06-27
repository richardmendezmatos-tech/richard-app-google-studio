'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FinanciamientoFAQ: React.FC<{ faqs: FAQItem[] }> = ({ faqs }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className={`overflow-hidden rounded-3xl border transition-all duration-300 ${
              isOpen
                ? 'border-cyan-500/40 bg-slate-800/60'
                : 'border-white/5 bg-slate-800/30 hover:border-cyan-500/20 hover:bg-slate-800/50'
            }`}
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className={`shrink-0 h-2 w-2 rounded-full transition-all ${
                    isOpen ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'
                  }`}
                />
                <span className="font-bold text-white text-sm leading-snug">{faq.question}</span>
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-cyan-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-white/5 px-6 pb-6 pt-4 text-slate-300 text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
