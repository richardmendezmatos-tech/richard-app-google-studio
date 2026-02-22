
import React from 'react';
import { Globe, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { SITE_CONFIG } from '@/constants/siteConfig';

const SocialFooter: React.FC = () => {
    return (
        <footer aria-label="Contacto y Redes Sociales" className="group relative mt-12 overflow-hidden rounded-[40px] border border-cyan-100/15 bg-[linear-gradient(135deg,#10283b,#08111d)] px-8 py-12 text-white shadow-2xl shadow-cyan-900/10 lg:px-16">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
            <div className="pointer-events-none absolute -right-20 -top-20 rotate-12 p-20 opacity-5 transition-transform duration-[2s] group-hover:rotate-45">
                <Globe size={400} />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row">
                <div className="text-center md:text-left">
                    <h2 className="font-cinematic flex items-center justify-center gap-2 text-3xl uppercase tracking-[0.08em] md:justify-start">
                        Richard<span className="text-[#00aed9]">Automotive</span>
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-slate-300">
                        Redefiniendo la compra de autos en Puerto Rico con Inteligencia Artificial y transparencia total.
                    </p>
                </div>

                <div className="flex gap-4">
                    {SITE_CONFIG.social.instagram && (
                        <SocialButton icon={<Instagram size={20} />} label="Instagram" href={SITE_CONFIG.social.instagram} />
                    )}
                    {SITE_CONFIG.social.facebook && (
                        <SocialButton icon={<Facebook size={20} />} label="Facebook" href={SITE_CONFIG.social.facebook} />
                    )}
                    {SITE_CONFIG.social.youtube && (
                        <SocialButton icon={<Youtube size={20} />} label="YouTube" href={SITE_CONFIG.social.youtube} />
                    )}
                    {SITE_CONFIG.social.twitter && (
                        <SocialButton icon={<Twitter size={20} />} label="X / Twitter" href={SITE_CONFIG.social.twitter} />
                    )}
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-xs font-bold text-slate-400 md:flex-row">
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
        className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-cyan-200/40 hover:bg-[#00aed9]"
        title={label}
    >
        <span className="text-white group-hover:animate-bounce">{icon}</span>
    </a>
);

export default SocialFooter;
