"use client";

"use client";

import React from 'react';
import { Car, calculatePredictiveDTS } from '@/entities/inventory';
import { Lead } from '@/entities/lead';
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
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { StatusWidget, CountUp } from './CommandCenterWidgets';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';
import { InventoryHeatmap } from '@/features/inventory';
import { CommandCenterCarCard } from './CommandCenterCarCard';
import HyperInventoryList from './HyperInventoryList';
import { useCommandCenterData } from '../_hooks/useCommandCenterData';
import { useDealer } from '@/entities/dealer';
import { useCars } from '@/features/inventory';

interface AdminInventoryTabProps {
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onEdit: (car: Car) => void;
  onPlanContent: (car: Car) => void;
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
  const [activeTab, setActiveTab] = React.useState<'todo' | 'premium' | 'oportunidad' | 'baja'>(
    'todo',
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    searchInputRef.current?.focus();
    const voiceFilter = localStorage.getItem('inventory_filter');
    if (voiceFilter) {
      setSearchTerm(voiceFilter);
      localStorage.removeItem('inventory_filter');
    }
  }, []);

  const filteredInventory = React.useMemo(() => {
    let items = (inventory || []).filter((c) =>
      (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()),
    );

    if (activeTab === 'premium') {
      items = items.filter((c) => (c.price && Number(c.price) > 50000) || c.type === 'luxury');
    } else if (activeTab === 'oportunidad') {
      items = items.filter((c) => {
        const leadsForCar = leads.filter((l: Lead) => l.vehicleId === c.id).length;
        return calculatePredictiveDTS(c, leadsForCar).advantageScore > 80;
      });
    } else if (activeTab === 'baja') {
      items = items.filter((c) => {
        const leadsForCar = leads.filter((l: Lead) => l.vehicleId === c.id).length;
        return calculatePredictiveDTS(c, leadsForCar).advantageScore < 40;
      });
    }

    return items;
  }, [inventory, searchTerm, activeTab, leads]);

  const totalStats = React.useMemo(() => {
    const units = inventory.length;
    const totalValue = inventory.reduce((acc, car) => acc + (Number(car.price) || 0), 0);
    const avgAdvantage =
      inventory.reduce((acc, car) => {
        const carLeads = leads.filter((l: Lead) => l.vehicleId === car.id).length;
        return acc + calculatePredictiveDTS(car, carLeads).advantageScore;
      }, 0) / (units || 1);
    return { units, totalValue, avgAdvantage };
  }, [inventory, leads]);

  return (
    <div className="flex flex-col gap-8 min-h-[600px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusWidget
          icon={Package}
          label="Unidades en Stock"
          value={<CountUp end={totalStats.units} />}
          color="bg-blue-500/20 text-cyan-400 border border-cyan-500/30"
          subValue="CAPACIDAD OPTIMA"
        />
        <StatusWidget
          icon={DollarSign}
          label="Capital de Inventario"
          value={`$${(totalStats.totalValue / 1000000).toFixed(1)}M`}
          color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          subValue="ASSET VALUATION"
        />
        <StatusWidget
          icon={TrendingUp}
          label="Advantage Global"
          value={`${totalStats.avgAdvantage.toFixed(1)}%`}
          color="bg-primary/20 text-primary border border-primary/30"
          subValue="VENTA PREDICTIVA"
        />
        <StatusWidget
          icon={Zap}
          label="Exp. Ventas (Mes)"
          value="12"
          color="bg-amber-500/20 text-amber-500 border border-amber-500/30"
          subValue="PROYECCIÓN HOUSTON"
        />
      </div>

      <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-[1.5rem] border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'todo', label: 'Todo', icon: Filter },
              { id: 'premium', label: 'Premium', icon: Flame },
              { id: 'oportunidad', label: 'Oportunidad', icon: CheckCircle2 },
              { id: 'baja', label: 'Baja Tracción', icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full pl-12 pr-4 h-[44px] bg-slate-950 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all text-[11px] font-bold text-white placeholder:text-slate-600 uppercase tracking-widest"
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
              className="px-8 h-[48px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
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
                leadCount={leads.filter((l: Lead) => l.vehicleId === car.id).length}
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
