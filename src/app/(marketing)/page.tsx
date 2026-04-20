import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/pages/storefront/ui/Storefront';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Richard Automotive | Dealer de Autos Usados en Vega Alta y Bayamón',
  description: 'Compra autos, guaguas y pickups de lujo en Central Ford, Vega Alta. Financiamiento expreso desde 4.9% APR. El inventario más exclusivo de Puerto Rico.',
  keywords: ['autos usados puerto rico', 'dealer vega alta', 'central ford vega alta', 'richard automotive', 'guaguas usadas', 'pickups puerto rico'],
  alternates: {
    canonical: 'https://richard-automotive.com/',
  },
  openGraph: {
    title: 'Richard Automotive | Dealer de Autos Usados Certificados',
    description: 'Ubicados en Central Ford, Vega Alta. Los mejores precios y financiamiento en PR.',
    url: 'https://richard-automotive.com/',
    siteName: 'Richard Automotive',
    images: [
      {
        url: 'https://richard-automotive.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Richard Automotive Storefront',
      },
    ],
    locale: 'es_PR',
    type: 'website',
  },
};

function HomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: BUSINESS_CONTACT.name,
    legalName: BUSINESS_CONTACT.legalName,
    url: 'https://richard-automotive.com',
    logo: 'https://richard-automotive.com/logo.png',
    image: 'https://richard-automotive.com/dealership-front.jpg',
    description: 'Dealer de autos usados certificados, especializado en pickups y guaguas de lujo. Ubicado en las facilidades de Central Ford.',
    telephone: BUSINESS_CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONTACT.address.street,
      addressLocality: BUSINESS_CONTACT.address.city,
      addressRegion: BUSINESS_CONTACT.address.state,
      postalCode: BUSINESS_CONTACT.address.zip,
      addressCountry: BUSINESS_CONTACT.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONTACT.geo.latitude,
      longitude: BUSINESS_CONTACT.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    sameAs: [
      BUSINESS_CONTACT.social.facebook,
      BUSINESS_CONTACT.social.instagram,
    ],
    priceRange: '$$$',
    areaServed: {
      '@type': 'Country',
      name: 'Puerto Rico',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export const experimental_ppr = true;

/**
 * Next.js App Router Home Page
 * Optimized for Local SEO and Strategic Conversion.
 */
export default async function HomePage() {
  let inventory: any[] = [];
  
  try {
    inventory = await fetchInventoryFromJava(12);
  } catch (error) {
    console.error('Error fetching inventory for SSR:', error);
  }

  return (
    <>
      <HomeJsonLd />
      
      <main className="relative">
        <Suspense fallback={null}>
          <Storefront inventory={inventory} />
        </Suspense>

        {/* Local SEO / Location Section */}
        <section className="bg-slate-950 py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em]">Visítanos Hoy</span>
                <h2 className="text-4xl font-black text-white leading-tight">
                  Tu Destino de Confianza en <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Vega Alta</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Estamos ubicados estratégicamente en las facilidades de **Central Ford**. Ven y experimenta el inventario de autos usados más exclusivo de Puerto Rico con atención personalizada.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContactInfoItem 
                  icon={<MapPin className="text-cyan-400" />} 
                  label="Ubicación" 
                  value={BUSINESS_CONTACT.address.full} 
                />
                <ContactInfoItem 
                  icon={<Phone className="text-cyan-400" />} 
                  label="Teléfono" 
                  value={BUSINESS_CONTACT.phone} 
                />
                <ContactInfoItem 
                  icon={<Clock className="text-cyan-400" />} 
                  label="Horario" 
                  value={`${BUSINESS_CONTACT.hours.weekdays} (Sáb: ${BUSINESS_CONTACT.hours.saturday})`} 
                />
                <ContactInfoItem 
                  icon={<ShieldCheck className="text-cyan-400" />} 
                  label="Garantía" 
                  value="Unidades Inspeccionadas y Certificadas" 
                />
              </div>

              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${BUSINESS_CONTACT.geo.latitude},${BUSINESS_CONTACT.geo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 hover:text-black transition-all group"
              >
                Obtener Direcciones
                <MapPin className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Map Embed Container */}
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
              <iframe
                title="Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.8872688469887!2d-66.3378775238217!3d18.4116410826606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c03164964560737%3A0xe67ce97453535353!2sCentral%20Ford!5e0!3m2!1ses!2spr!4v171261!5m2!1ses!2spr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ContactInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
