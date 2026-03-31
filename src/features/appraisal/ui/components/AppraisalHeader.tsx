import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AppraisalHeaderProps {
  step: number;
}

export const AppraisalHeader: React.FC<AppraisalHeaderProps> = ({ step }) => {
  return (
    <div className="relative mb-12 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
          <ShieldCheck className="text-primary" size={24} />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Richard Certified Appraisal</h3>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-cinematic">
            Tasa tu Auto <span className="text-primary/70">VIP</span>
          </h2>
        </div>
      </div>
      
      {step < 4 && (
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-slate-800'
              }`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
