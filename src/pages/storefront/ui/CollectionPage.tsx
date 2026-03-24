import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car } from '@/entities/shared';
import SEO from '@/shared/ui/seo/SEO';
import { Sparkles, ChevronLeft } from 'lucide-react';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import CarCard from '@/entities/inventory/ui/CarCard';

interface Props {
  inventory: Car[];
}

const CollectionPage: React.FC<Props> = ({ inventory }) => {
  const { brand, maxPrice } = useParams<{ brand?: string; maxPrice?: string }>();
  const navigate = useNavigate();

  const isBrandView = !!brand;
  const isBudgetView = !!maxPrice;

  // Formatting utils
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const seoTitle = useMemo(() => {
    if (isBrandView && brand) return `Autos Usados ${capitalize(brand)} en Puerto Rico | Richard Automotive`;
    if (isBudgetView && maxPrice) return `Autos Usados por menos de $${maxPrice} en Puerto Rico | Richard Automotive`;
    return 'Colección Exclusiva | Richard Automotive';
  }, [brand, maxPrice, isBrandView, isBudgetView]);

  const seoDescription = useMemo(() => {
    if (isBrandView && brand) return `Descubre nuestro inventario premium de ${capitalize(brand)} en Puerto Rico. Garantía y financiamiento para autos ${capitalize(brand)} en Richard Automotive.`;
    if (isBudgetView && maxPrice) return `Encuentra autos garantizados bajo $${maxPrice} USD. Opciones de financiamiento rápido con bancos de PR y la mejor tasa del mercado.`;
    return 'Explora nuestras colecciones exclusivas de vehículos usados premium en Puerto Rico.';
  }, [brand, maxPrice, isBrandView, isBudgetView]);

  const filteredInventory = useMemo(() => {
    let list = [...inventory];
    if (isBrandView && brand) {
      list = list.filter(car => {
        const _make = car.make ? car.make.toLowerCase() : (car.name.split(' ')[0] || '').toLowerCase();
        return _make === brand.toLowerCase();
      });
    }
    if (isBudgetView && maxPrice) {
      list = list.filter(car => car.price <= Number(maxPrice));
    }
    return list;
  }, [inventory, brand, maxPrice, isBrandView, isBudgetView]);

  const h1Title = useMemo(() => {
    if (isBrandView && brand) return `Vehículos ${capitalize(brand)}`;
    if (isBudgetView && maxPrice) return `Autos Menores a $${maxPrice}`;
    return 'Colección Exclusiva';
  }, [brand, maxPrice, isBrandView, isBudgetView]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={SITE_CONFIG.seo.ogImage}
        url={window.location.pathname}
        type="website"
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-8"
        >
          <ChevronLeft size={20} /> Volver al Inventario Total
        </button>

        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs mb-4">
            <Sparkles size={14} /> Colección Especializada
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            {h1Title}
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto md:mx-0">
            {filteredInventory.length} unidades certificadas disponibles. Listas para entrega hoy mismo en Puerto Rico.
          </p>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[30px] p-12 text-center border border-slate-200 dark:border-white/10 shadow-xl">
            <h3 className="text-xl font-bold dark:text-white text-slate-800 mb-2">No se encontraron unidades</h3>
            <p className="text-slate-500 dark:text-slate-400">Intenta buscar con otros filtros o contacta a ventas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredInventory.map((car) => (
              <CarCard 
                key={car.id} 
                car={car}
                isSaved={false}
                isComparing={false}
                onToggleSave={() => {}}
                onCompare={() => {}}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CollectionPage;
