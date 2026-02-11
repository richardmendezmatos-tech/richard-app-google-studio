
import React from 'react';
import { Car } from '@/types/types';
import { optimizeImage } from '@/services/firebaseShared';
import { ExternalLink, Tag } from 'lucide-react';

interface Props {
    cars: Car[];
}

const GenUICarCard: React.FC<Props> = ({ cars }) => {
    if (!cars || cars.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 my-2 w-full animate-in fade-in slide-in-from-left-2 transition-all">
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar mask-gradient-x">
                {cars.map((car) => (
                    <div
                        key={car.id}
                        className="flex-shrink-0 w-48 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                        onClick={() => window.open(`/vehicle/${car.id}`, '_blank')}
                    >
                        {/* Image Section */}
                        <div className="relative h-28 overflow-hidden">
                            <img
                                src={optimizeImage(car.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800', 400)}
                                alt={car.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {car.year}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate mb-1">
                                {car.name}
                            </h4>
                            <div className="flex items-center justify-between">
                                <span className="text-blue-500 font-black text-sm">
                                    ${car.price?.toLocaleString()}
                                </span>
                                <button className="p-1.5 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-400 group-hover:text-blue-500 transition-colors">
                                    <ExternalLink size={12} />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 opacity-60">
                                <Tag size={10} />
                                <span className="text-[9px] font-medium uppercase tracking-widest">{car.type || 'Auto'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-400 italic px-1 font-medium">
                ✨ Desliza para ver más opciones en inventario.
            </p>
        </div>
    );
};

export default GenUICarCard;
