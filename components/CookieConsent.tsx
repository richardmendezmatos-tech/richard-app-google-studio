
import React, { useState, useEffect } from 'react';
import { getCookie, setCookie, trackUserVisit } from '../services/cookieService';
import { Cookie, ShieldCheck, X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya aceptó las cookies
    const consent = getCookie('richard_cookie_consent');
    if (!consent) {
      // Pequeño delay para no ser intrusivo inmediatamente al cargar
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Si ya aceptó, trackeamos la visita silenciosamente
      trackUserVisit();
    }
  }, []);

  const handleAccept = () => {
    setCookie('richard_cookie_consent', 'true', 365); // Validez de 1 año
    trackUserVisit();
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Guardamos que rechazó por 7 días para no molestar, pero no trackeamos
    setCookie('richard_cookie_consent', 'false', 7); 
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-6 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-[#0d2232]/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-3xl p-6 md:p-8 max-w-4xl w-full flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00aed9] to-transparent opacity-50"></div>
        
        <div className="flex items-center justify-center w-16 h-16 bg-[#00aed9]/10 rounded-full shrink-0">
            <Cookie size={32} className="text-[#00aed9]" />
        </div>

        <div className="flex-1 text-center md:text-left">
            <h4 className="text-white font-black text-lg mb-2">Valoramos tu Privacidad</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
                Utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido del inventario. Al hacer clic en <span className="text-white font-bold">"Aceptar todo"</span>, consientes el uso de todas las cookies.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button 
                onClick={handleDecline}
                className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold uppercase tracking-widest transition-colors"
            >
                Rechazar
            </button>
            <button 
                onClick={handleAccept}
                className="px-8 py-3 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
                <ShieldCheck size={16} /> Aceptar Todo
            </button>
        </div>

        <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors md:hidden"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
