import React from 'react';
import { Car as CarType, Lead } from '@/entities/shared';
import {
  Plus,
  Package,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Edit3,
  Trash2,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';
import { calculatePredictiveDTS } from '@/entities/car';
import { CommandCenterCarCard } from './CommandCenterCarCard';
import HyperInventoryList from './HyperInventoryList';
import { useCommandCenterData } from '../hooks/useCommandCenterData';
import { useDealer } from '@/entities/dealer';
import { useCars } from '@/features/inventory';

interface AdminInventoryTabProps {
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onEdit: (car: CarType) => void;
  onPlanContent: (car: CarType) => void;
  onInitializeDb?: () => Promise<void>;
  handleInitClick: () => void;
  isInitializing: boolean;
}

const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({
  onDelete,
  onCreateNew,
  onEdit,
  onPlanContent,
  onInitializeDb,
  handleInitClick,
  isInitializing,
}) => {
  const { currentDealer } = useDealer();
  const { leads, isLoadingLeads } = useCommandCenterData(currentDealer.id || 'richard-automotive');
  const { data: carData, isLoading: isLoadingCars } = useCars(12);
  
  const inventory = React.useMemo(() => {
    return carData?.pages.flatMap((page) => page.cars) || [];
  }, [carData]);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    searchInputRef.current?.focus();
    const voiceFilter = localStorage.getItem('inventory_filter');
    if (voiceFilter) {
      setSearchTerm(voiceFilter);
      localStorage.removeItem('inventory_filter'); // Clear once used
    }
  }, []);

  const filteredInventory = React.useMemo(
    () =>
      (inventory || []).filter((c) =>
        (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()),
      ),
    [inventory, searchTerm],
  );

  const totalStats = React.useMemo(() => {
    const units = inventory.length;
    const totalValue = inventory.reduce((acc, car) => acc + (Number(car.price) || 0), 0);
    const avgAdvantage =
      inventory.reduce((acc, car) => {
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
          {
            label: 'Valor Total',
            value: `$${(totalStats.totalValue / 1000000).toFixed(1)}M`,
            icon: DollarSign,
            color: 'text-emerald-500',
          },
          {
            label: 'Advantage Prom.',
            value: `${totalStats.avgAdvantage.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-primary',
          },
          { label: 'Ventas Proy.', value: '12', icon: Zap, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-premium p-4 flex items-center gap-4 hover-kinetic cursor-default"
          >
            <div className={`p-3 rounded-2xl bg-white/5 dark:bg-slate-800 shadow-sm ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {stat.label}
              </div>
              <div className="text-xl font-black text-slate-800 dark:text-white tracking-tight text-glow">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/10 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar vehículo..."
              className="w-full pl-12 pr-4 h-board-header bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={searchInputRef}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                title="Cuadrícula"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                title="Lista"
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={onCreateNew}
              className="px-6 h-[44px] bg-primary hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 route-fade-in p-6">
            {filteredInventory.map((car) => (
              <CommandCenterCarCard
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
          <HyperInventoryList
            inventory={filteredInventory}
            leads={leads}
            onEdit={onEdit}
            onDelete={onDelete}
            onPlanContent={onPlanContent}
          />
        )}
      </div>
    </div>
  );
};

export default AdminInventoryTab;
