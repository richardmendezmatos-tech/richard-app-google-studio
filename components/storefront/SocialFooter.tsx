
import React from 'react';
import { Globe, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const SocialFooter: React.FC = () => {
    return (
        <footer className="mt-12 py-12 px-8 lg:px-16 rounded-[40px] bg-[#173d57] dark:bg-[#0d2232] text-white relative overflow-hidden group shadow-2xl shadow-cyan-900/10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -top-20 -right-20 p-20 opacity-5 pointer-events-none rotate-12 transition-transform duration-[2s] group-hover:rotate-45">
                <Globe size={400} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 justify-center md:justify-start">
                        Richard<span className="text-[#00aed9]">Automotive</span>
                    </h3>
                    <p className="text-blue-200 text-sm mt-2 max-w-md">
                        Redefiniendo la compra de autos en Puerto Rico con Inteligencia Artificial y transparencia total.
                    </p>
                </div>

                <div className="flex gap-4">
                    <SocialButton icon={<Instagram size={20} />} label="Instagram" href="#" />
                    <SocialButton icon={<Facebook size={20} />} label="Facebook" href="#" />
                    <SocialButton icon={<Youtube size={20} />} label="YouTube" href="#" />
                    <SocialButton icon={<Twitter size={20} />} label="X / Twitter" href="#" />
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-400 gap-6">
                <p>&copy; 2025 Richard Automotive. Todos los derechos reservados.</p>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                    <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
                    <a href="#" className="hover:text-white transition-colors">Mapa del Sitio</a>
                </div>
            </div>
        </footer>
    );
};

const SocialButton = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-white/10 hover:bg-[#00aed9] hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-sm group"
        title={label}
    >
        <span className="text-white group-hover:animate-bounce">{icon}</span>
    </a>
);

export default SocialFooter;
