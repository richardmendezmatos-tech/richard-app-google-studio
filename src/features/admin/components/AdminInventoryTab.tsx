import React from 'react';
import { Car as CarType, Lead } from '@/types/types';
import { Plus, Package, Search, LayoutGrid, List, Sparkles, Edit3, Trash2, DollarSign, Clock, TrendingUp, Zap } from 'lucide-react';
import { optimizeImage } from '@/services/firebaseShared';
import { calculatePredictiveDTS } from '@/services/predictionService';
import { AdminCarCard } from './AdminCarCard';

interface AdminInventoryTabProps {
    inventory: CarType[];
    leads: Lead[];
    onDelete: (id: string) => void;
    onCreateNew: () => void;
    onEdit: (car: CarType) => void;
    onPlanContent: (car: CarType) => void;
    onInitializeDb?: () => Promise<void>;
    handleInitClick: () => void;
    isInitializing: boolean;
}

const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({
    inventory,
    leads,
    onDelete,
    onCreateNew,
    onEdit,
    onPlanContent,
    onInitializeDb,
    handleInitClick,
    isInitializing
}) => {
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    React.useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    const filteredInventory = React.useMemo(
        () => (inventory || []).filter((c) =>
            (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
        ),
        [inventory, searchTerm]
    );

    const totalStats = React.useMemo(() => {
        const units = inventory.length;
        const totalValue = inventory.reduce((acc, car) => acc + (Number(car.price) || 0), 0);
        const avgAdvantage = inventory.reduce((acc, car) => {
            const carLeads = leads.filter((l) => l.vehicleId === car.id).length;
            return acc + calculatePredictiveDTS(car, carLeads).advantageScore;
        }, 0) / (units || 1);
        return { units, totalValue, avgAdvantage };
    }, [inventory, leads]);

    return (
        <div className="flex flex-col gap-8 min-h-[600px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {[
                    { label: 'Unidades', value: totalStats.units, icon: Package, color: 'text-blue-500' },
                    { label: 'Valor Total', value: `$${(totalStats.totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-emerald-500' },
                    { label: 'Advantage Prom.', value: `${totalStats.avgAdvantage.toFixed(1)}%`, icon: TrendingUp, color: 'text-[#00aed9]' },
                    { label: 'Ventas Proy.', value: '12', icon: Zap, color: 'text-amber-500' }
                ].map((stat, i) => (
                    <div key={i} className="glass-premium p-4 flex items-center gap-4 hover-kinetic cursor-default">
                        <div className={`p-3 rounded-2xl bg-white/5 dark:bg-slate-800 shadow-sm ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                            <div className="text-xl font-black text-slate-800 dark:text-white tracking-tight text-glow">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar vehículo..."
                            className="w-full pl-12 pr-4 h-[50px] bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            ref={searchInputRef}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                                title="Cuadrícula"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                                title="Lista"
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            onClick={onCreateNew}
                            className="px-6 h-[44px] bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} strokeWidth={3} /> Nueva Unidad
                        </button>

                        {onInitializeDb && (
                            <button
                                onClick={handleInitClick}
                                disabled={isInitializing}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                {isInitializing ? 'Resetting...' : 'Reset DB'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 route-fade-in">
                            {filteredInventory.map((car) => (
                                <AdminCarCard
                                    key={car.id}
                                    car={car}
                                    leadCount={leads.filter((l) => l.vehicleId === car.id).length}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onPlanContent={() => onPlanContent(car)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-[32px] border border-white/5 route-fade-in">
                            <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/80 border-b border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#00aed9]">Unidad</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo / Badge</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Precio</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Advantage</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sales Velocity</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInventory.map((car) => (
                                            <tr key={car.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/10 group-hover:scale-105 transition-transform">
                                                            <img src={optimizeImage(car.img, 100)} alt={car.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="font-bold text-white uppercase tracking-tight">{car.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black uppercase text-slate-400">{car.type}</span>
                                                        <span className="text-[10px] text-[#00aed9] font-bold uppercase tracking-widest">{car.badge || 'No Badge'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-white text-glow">
                                                    ${car.price?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-[#00aed9]/10 text-[#00aed9] uppercase tracking-widest border border-[#00aed9]/20">
                                                        +{calculatePredictiveDTS(car, leads.filter((l) => l.vehicleId === car.id).length).advantageScore.toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={12} className="text-slate-500" />
                                                        <span className="text-xs font-bold text-slate-400">14 Días</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => onPlanContent(car)}
                                                            className="p-2 hover:bg-[#00aed9]/10 text-slate-400 hover:text-[#00aed9] rounded-lg transition-all"
                                                            title="Marketing"
                                                        >
                                                            <Sparkles size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => onEdit(car)}
                                                            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => onDelete(car.id)}
                                                            className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                            </table>
                        </div>
                    )}

                    {filteredInventory.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <Package size={64} className="mb-4" />
                            <p className="font-bold uppercase tracking-widest text-sm text-white">No se encontraron vehículos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminInventoryTab;
