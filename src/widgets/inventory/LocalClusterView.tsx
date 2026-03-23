import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CarType } from '@/shared/types/types';
import { Car } from '@/entities/shared';
import SEO from '@/shared/ui/seo/SEO';
import HeroSection from '@/features/inventory/ui/storefront/HeroSection';
import PremiumGlassCard from '@/widgets/inventory/PremiumGlassCard';
import CarDetailModal from '@/features/inventory/ui/CarDetailModal';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';
import { DatabaseZap, MapPin, Sparkles } from 'lucide-react';

interface LocalClusterViewProps {
  inventory: Car[];
}

const LocalClusterView: React.FC<LocalClusterViewProps> = ({ inventory }) => {
  const { location, category } = useParams<{ location: string; category?: string }>();
  const navigate = useNavigate();
  const analytics = useInventoryAnalytics();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Normalizar parámetros
  const normalizedLocation = location
    ? location.charAt(0).toUpperCase() + location.slice(1).toLowerCase()
    : '';
  const normalizedCategory = category ? category.toLowerCase() : 'all';

  // Lógica de Filtrado
  const filteredCars = useMemo(() => {
    return inventory.filter((car) => {
      const matchesCategory = normalizedCategory === 'all' || car.type === normalizedCategory;
      // Por ahora el inventario no tiene campo de "uicación", así que mostramos todo el inventario de Richard Automotive
      // pero filtrado por categoría si se especifica. En el futuro se podría añadir un campo location a Car.
      return matchesCategory;
    });
  }, [inventory, normalizedCategory]);

  // Generación de Metadatos SEO
  const pageTitle = useMemo(() => {
    const catName = normalizedCategory === 'all' ? 'Autos' : normalizedCategory.toUpperCase();
    return `Los Mejores ${catName} en ${normalizedLocation} | Richard Automotive`;
  }, [normalizedCategory, normalizedLocation]);

  const pageDescription = useMemo(() => {
    return `Encuentra ${normalizedCategory === 'all' ? 'los mejores autos certificados' : 'la mejor selección de ' + normalizedCategory} en ${normalizedLocation}. Richard Automotive es el dealer más tecnológico de Puerto Rico.`;
  }, [normalizedCategory, normalizedLocation]);

  return (
    <div className="min-h-screen bg-[#020810]">
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={`/comprar/${location}/${category || ''}`}
        type="website"
      />

      <HeroSection
        onNeuralMatch={() => navigate('/consultant')}
        onBrowseInventory={() =>
          document.getElementById('cluster-grid')?.scrollIntoView({ behavior: 'smooth' })
        }
        onSellCar={() => navigate('/appraisal')}
      />

      <main className="relative z-20 mx-auto -mt-14 max-w-[1600px] space-y-14 px-5 pb-28 lg:px-12">
        <section id="cluster-grid" className="scroll-mt-32">
          {/* Header del Cluster */}
          <div className="mb-10 flex flex-col gap-4 px-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <MapPin size={18} />
              <span className="font-tech text-xs uppercase tracking-[0.2em]">
                Puerto Rico / {normalizedLocation}
              </span>
            </div>

            <h2 className="font-cinematic text-5xl tracking-[0.04em] text-white">
              {normalizedCategory === 'all' ? 'Inventario' : normalizedCategory.toUpperCase()}{' '}
              <span className="text-cyan-400">en {normalizedLocation}</span>
              <span className="ml-4 inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-tech text-cyan-400 align-middle">
                CLUSTER ACTIVE
              </span>
            </h2>

            <p className="max-w-2xl text-lg text-slate-400">
              Selección exclusiva de Richard Automotive para la zona de {normalizedLocation}.
              Explora unidades certificadas con la tecnología de inspección más avanzada de la isla.
            </p>
          </div>

          {/* Grid de Resultados */}
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => (
                <PremiumGlassCard
                  key={car.id}
                  car={car}
                  onSelect={() => {
                    setSelectedCar(car);
                    analytics.trackCarView(car.id);
                  }}
                  isSaved={false} // Simplificado para este MVP
                  onToggleSave={() => {}}
                  onCompare={() => {}}
                  isComparing={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-cyan-300/20 bg-[#081726]/85 py-24 text-center">
              <DatabaseZap size={48} className="mb-4 text-slate-500" />
              <h3 className="font-cinematic text-3xl text-white">
                No hay {normalizedCategory} disponibles ahora
              </h3>
              <p className="mt-2 text-slate-400">
                Estamos renovando nuestro inventario en {normalizedLocation} constantemente.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-8 rounded-full bg-cyan-500 px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-cyan-400"
              >
                Ver Todo el Inventario
              </button>
            </div>
          )}
        </section>

        {/* Footer de Generación Programática (Trust Signal) */}
        <section className="rounded-[30px] border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
            <Sparkles className="text-cyan-400" size={32} />
            <h3 className="text-xl font-bold text-white">
              ¿No encuentras lo que buscas en {normalizedLocation}?
            </h3>
            <p className="text-slate-400">
              Nuestra IA está rastreando nuevas unidades 24/7. Richard Automotive ofrece entrega a
              domicilio en todo Puerto Rico.
            </p>
          </div>
        </section>
      </main>

      {selectedCar && <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />}
    </div>
  );
};

export default LocalClusterView;
