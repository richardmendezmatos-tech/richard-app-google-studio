import React, { useEffect, useState } from 'react';
import { createClient } from '@/shared/api/supabase/client';
import { Car } from '@/entities/inventory';
import { Zap, ArrowRight, Tag } from 'lucide-react';

interface Props {
  tag: string;
}

export const BlogRelatedInventory: React.FC<Props> = ({ tag }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from('inventory')
        .select('*')
        .or(`make.ilike.%${tag}%,model.ilike.%${tag}%,condition.ilike.%${tag}%`)
        .limit(3);
      
      setCars(data || []);
      setLoading(false);
    };

    fetchRelated();
  }, [tag]);

  if (cars.length === 0 && !loading) return null;

  return (
    <div className="mt-16 space-y-8 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">
          Unidades en <span className="text-primary">Inventario</span> Relacionadas
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
           <Tag size={12} /> {tag}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
          ))
        ) : (
          cars.map((car) => (
            <div key={car.id} className="group bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt={`${car.make} ${car.model}`}
                />
                <div className="absolute top-3 left-3 bg-primary text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                   ${car.price?.toLocaleString()}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h5 className="text-lg font-black text-white tracking-tighter uppercase line-clamp-1 italic">
                  {car.year} {car.make} {car.model}
                </h5>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {car.mileage?.toLocaleString()} MILLAS
                   </span>
                   <button className="p-2 bg-white/5 rounded-xl text-primary hover:bg-primary hover:text-black transition-all">
                      <ArrowRight size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
