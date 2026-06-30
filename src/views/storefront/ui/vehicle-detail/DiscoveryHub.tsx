import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Car } from '@/entities/inventory';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';

interface Props {
  car: Car;
}

/**
 * Discovery Hub — enlaces internos para distribución de autoridad SEO.
 * Bloque presentacional puro extraído de VehicleDetail.
 */
export default function DiscoveryHub({ car }: Props) {
  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-24 mb-12">
      <GlassContainer intensity="low" opacity={0.03} className="p-10 border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
              Explorar Categoría
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Descubre más unidades similares en nuestra colección curada.
            </p>
            <a
              href={`/autos-usados/tipo/${car.type?.toLowerCase() || 'sedan'}`}
              className="inline-flex items-center gap-2 text-white font-bold hover:text-primary transition-all group"
            >
              Ver todos los {car.type || 'Autos'}
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          <div className="space-y-4">
            <h4 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
              Inventario Local
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Encuentra los mejores autos usados certificados cerca de ti.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Vega Alta', 'Bayamón', 'San Juan'].map((city) => (
                <a
                  key={city}
                  href={`/autos-usados/${city.toLowerCase().replace(' ', '-')}`}
                  className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                >
                  #{city}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
              Richard Automotive
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Especialistas en pickups y guaguas de lujo en Puerto Rico.
            </p>
            <a
              href="/"
              className="text-xs font-black text-white hover:text-primary transition-all underline underline-offset-8 decoration-primary/30"
            >
              IR AL HUB DE INVENTARIO
            </a>
          </div>
        </div>
      </GlassContainer>
    </section>
  );
}
