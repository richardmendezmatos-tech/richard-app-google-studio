import React from 'react';
import { CreditApplicationForm } from '@/features/lead-capture/ui/CreditApplicationForm';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const CreditAppPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Volver a la Vitrina
        </Link>
      </div>
      <CreditApplicationForm />
    </div>
  );
};

export default CreditAppPage;
