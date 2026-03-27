import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Zap, ArrowRight, MessageSquare } from 'lucide-react';
import SEO from '@/shared/ui/seo/SEO';
import { motion } from 'motion/react';
import { getAutoDealerSchema } from '@/shared/config/seoSchemas';

interface CityConfig {
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  keywords: string[];
  landmark?: string;
}

const cities: Record<string, CityConfig> = {
  guaynabo: {
    name: 'Guaynabo',
    slug: 'guaynabo',
    description: 'Encuentra los autos usados de lujo más exclusivos en Guaynabo. Richard Automotive ofrece inventario premium para los conductores más exigentes de San Patricio y alrededores.',
    heroImage: '/assets/seo/guaynabo-hero.png',
    keywords: ['autos usados guaynabo', 'dealer de lujo guaynabo', 'venta de autos premium guaynabo'],
    landmark: 'San Patricio / Caparra',
  },
  dorado: {
    name: 'Dorado',
    slug: 'dorado',
    description: 'Servicio de guante blanco para la comunidad de Dorado. Autos usados de lujo certificados y listos para el estilo de vida de Sabanera y Dorado Beach.',
    heroImage: '/assets/seo/dorado-hero.png',
    keywords: ['autos usados dorado', 'dealer de lujo dorado', 'dorado beach cars'],
    landmark: 'Dorado Beach',
  },
  'vega-alta': {
    name: 'Vega Alta',
    slug: 'vega-alta',
    description: 'Descubre los mejores autos usados de lujo en Vega Alta. Richard Automotive ofrece una selección de clase mundial con financiamiento flexible en la zona norte.',
    heroImage: '/assets/seo/vega-alta-hero.png',
    keywords: ['autos usados vega alta', 'dealer de lujo vega alta', 'carros baratos vega alta', 'financiamiento autos vega alta'],
    landmark: 'Gran Caribe / Costa Norte',
  },
  'vega-baja': {
    name: 'Vega Baja',
    slug: 'vega-baja',
    description: 'Expertos en autos usados de lujo en Vega Baja. Inventario seleccionado para garantizar la máxima calidad y prestigio en cada milla.',
    heroImage: '/assets/seo/vega-baja-hero.png',
    keywords: ['autos usados vega baja', 'dealer vega baja'],
  },
  carolina: {
    name: 'Carolina',
    slug: 'carolina',
    description: 'Richard Automotive en Carolina: Elevando el estándar de los autos usados. Descubre nuestra colección exclusiva en la Ciudad Gigante.',
    heroImage: '/assets/seo/carolina-hero.png',
    keywords: ['autos usados carolina', 'dealer de lujo carolina', 'venda de autos carolina'],
    landmark: 'Isla Verde',
  },
  bayamon: {
    name: 'Bayamón',
    slug: 'bayamon',
    description: 'Los mejores autos usados certificados en Bayamón. Richard Automotive ofrece financiamiento experto y trade-ins valorados al máximo en el corazón del área metro.',
    heroImage: '/assets/seo/bayamon-hero.png',
    keywords: ['autos usados bayamon', 'dealer de autos bayamon', 'carros usados certificados bayamon'],
    landmark: 'Plaza Las Américas / Área Metro',
  },
};

export const CitySEOPage: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const config = city ? cities[city.toLowerCase()] : null;

  if (!config) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Ciudad no encontrada</div>;
  }

  const WHATSAPP_LINK = `https://wa.me/17873682880?text=Hola%2C%20estoy%20en%20${config.name}%20y%20me%20gustaría%20información%20sobre%20un%20auto%20de%20lujo`;

  return (
    <div className="bg-[#0a0f1e] text-white min-h-screen font-sans">
      <SEO 
        title={`Autos Usados de Lujo en ${config.name} | Richard Automotive`}
        description={config.description}
        keywords={config.keywords.join(', ')}
        schema={getAutoDealerSchema(config.name)}
      />

      {/* Premium Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={config.heroImage} 
            alt={`Richard Automotive en ${config.name}, Puerto Rico`}
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/80 via-[#0a0f1e]/40 to-[#0a0f1e]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-8">
              <MapPin size={14} className="text-cyan-400" />
              <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">Richard Automotive — {config.name}</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              USADO DE <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent italic">LUJO</span>
              <br />
              EN {config.name.toUpperCase()}
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mb-12 font-medium leading-relaxed">
              Elevamos la experiencia de compra en {config.name}. {config.landmark ? `Desde ${config.landmark} hasta tu hogar` : 'Calidad certificada'}, descubre por qué somos el dealer #1 de autos premium en Puerto Rico.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black uppercase tracking-widest px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,174,217,0.4)] flex items-center gap-3"
              >
                <MessageSquare size={20} />
                Contactar en {config.name}
              </a>
              <Link
                to="/"
                className="bg-white/5 border border-white/10 backdrop-blur-md text-white font-black uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3"
              >
                Ver Inventario
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Blocks */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Star, title: 'Calidad 5 Estrellas', desc: 'Cada unidad es sometida a una inspección rigurosa de 150 puntos.' },
            { icon: ShieldCheck, title: 'Garantía Richard', desc: 'Protección y respaldo total en cada venta realizada en la zona metro.' },
            { icon: Zap, title: 'Entrega en 24h', desc: 'Si estás en ' + config.name + ', te entregamos el auto en la puerta de tu casa.' },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-cyan-500/30 transition-all group">
              <item.icon className="text-cyan-400 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">¿Listo para conducir el auto de tus sueños?</h2>
          <Link
            to="/financiamiento"
            className="inline-flex items-center gap-3 bg-white text-slate-950 font-black uppercase tracking-widest px-12 py-6 rounded-2xl hover:bg-cyan-400 transition-colors shadow-2xl"
          >
            Pre-Cualificar Ahora
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CitySEOPage;
