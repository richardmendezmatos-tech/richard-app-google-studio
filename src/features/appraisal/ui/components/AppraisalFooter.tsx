import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

export const AppraisalFooter: React.FC = () => {
  return (
    <div className="mt-12 flex items-center justify-center gap-6 opacity-30 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
       <span className="flex items-center gap-2">
         <Lock size={10} /> 256-Bit Secure
       </span>
       <span className="flex items-center gap-2 flex-row-reverse">
         AI Powered <Sparkles size={10} />
       </span>
    </div>
  );
};
