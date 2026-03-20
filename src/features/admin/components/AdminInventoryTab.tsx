import React from 'react';
import { Car as CarType, Lead } from '@/types/types';
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
import { optimizeImage } from '@/services/firebaseShared';
import { calculatePredictiveDTS } from '@/services/predictionService';
import { AdminCarCard } from './AdminCarCard';
import HyperInventoryList from './HyperInventoryList';

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
  isInitializing,
}) => {
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
            color: 'text-[#00aed9]',
          },
          { label: 'Ventas Proy.', value: '12', icon: Zap, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative glass-premium p-6 rounded-3xl overflow-hidden hover-kinetic flex flex-col justify-center gap-3 cursor-default shadow-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl"
          >
            <div className={`p-4 rounded-2xl bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)] ${stat.color} z-10 inline-flex self-start`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div className="z-10 mt-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-black text-white tracking-tight text-glow">
                {stat.value}
              </div>
            </div>
            {/* Ambient background glow based on icon color */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 ${stat.color.replace('text-', 'bg-')}`} />
          </div>
        ))}
      </div>

      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col relative">
        <div className="p-6 md:px-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950/40 relative z-10">
          <div className="relative w-full md:w-[400px] group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors duration-300"
              size={20}
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Buscar vehículo..."
              className="w-full pl-14 pr-6 h-[56px] bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#00aed9]/40 focus:border-[#00aed9]/50 outline-none transition-all duration-300 text-sm font-bold text-white placeholder:text-slate-500 shadow-inner group-focus-within:shadow-[0_0_25px_rgba(0,174,217,0.15)] focus:bg-slate-900/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={searchInputRef}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner hidden sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-[#00aed9] text-white shadow-[0_0_15px_rgba(0,174,217,0.4)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                title="Cuadrícula"
              >
                <LayoutGrid size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-[#00aed9] text-white shadow-[0_0_15px_rgba(0,174,217,0.4)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                title="Lista"
              >
                <List size={18} strokeWidth={2.5} />
              </button>
            </div>

            <button
              onClick={onCreateNew}
              className="px-8 h-[56px] bg-gradient-to-r from-[#00aed9] to-cyan-500 hover:from-cyan-400 hover:to-cyan-300 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,174,217,0.3)] hover:shadow-[0_0_30px_rgba(0,174,217,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Plus size={18} strokeWidth={3} className="relative z-10" /> 
              <span className="relative z-10">Nueva Unidad</span>
            </button>

            {onInitializeDb && (
              <button
                onClick={handleInitClick}
                disabled={isInitializing}
                className="px-6 h-[56px] bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInitializing ? 'Resetting...' : 'Reset DB'}
              </button>
            )}
          </div>
        </div>

        {/* Decorator Light inside the main table/grid container */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00aed9]/10 rounded-[100%] blur-[100px] pointer-events-none" />

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 route-fade-in p-6">
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
