
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound: React.FC = () => {
    const [seconds, setSeconds] = useState(10);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    // Generate particles only once to keep component pure
    const particles = React.useMemo(() => [...Array(20)].map((_, i) => ({
        id: i,
        width: Math.random() * 4 + 2 + 'px',
        height: Math.random() * 4 + 2 + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDuration: Math.random() * 3 + 2 + 's',
        animationDelay: Math.random() * 2 + 's'
    })), []);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(0,174,217,0.05)_0%,_transparent_40%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(139,92,246,0.05)_0%,_transparent_40%)]"></div>

            {/* Dynamic Particles simulation with CSS */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-[#00aed9] animate-pulse"
                        style={{
                            width: p.width,
                            height: p.height,
                            left: p.left,
                            top: p.top,
                            animationDuration: p.animationDuration,
                            animationDelay: p.animationDelay
                        }}
                    />
                ))}
            </div>

            <div className="max-w-md w-full z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center space-y-6">
                    <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter bg-gradient-to-b from-white to-[#00aed9] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,174,217,0.3)] animate-bounce-subtle">
                        404
                    </h1>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Página no encontrada</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Lo sentimos, la sección <span className="text-[#00aed9] font-black underline underline-offset-4 decoration-2">{location.pathname}</span> no está disponible en nuestro catálogo.
                        </p>
                    </div>

                    <div className="inline-block px-4 py-2 bg-[#00aed9]/10 rounded-full border border-[#00aed9]/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00aed9]">
                            Redirección al inicio en <span className="text-white">{seconds}</span>s
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Volver Atrás
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#00aed9] hover:bg-cyan-500 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                        >
                            <Home size={16} />
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}} />
        </div>
    );
};

export default NotFound;
