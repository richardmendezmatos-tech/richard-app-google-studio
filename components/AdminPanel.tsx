
import React, { useState, useEffect, useRef } from 'react';
import { Car as CarType, Lead } from '../types';
import { Plus, Trash2, Edit3, BarChart3, Package, Search, Loader2, DatabaseZap, Smartphone, Monitor, Server, Camera, CarFront, ShieldAlert } from 'lucide-react';
import { syncLeads } from '../services/firebaseService';

import InventoryHeatmap from './InventoryHeatmap';
import { useReactToPrint } from 'react-to-print';
import DealSheet from './DealSheet';

// Modular Components
import { KanbanBoard } from './admin/KanbanBoard';
import { AdminModal } from './admin/AdminModal';
import { AuditLogViewer } from './admin/AuditLogViewer';

interface Props {
  inventory: CarType[];
  onUpdate: (car: CarType) => void;
  onAdd: (car: Omit<CarType, 'id'>) => void;
  onDelete: (id: string) => void;
  onInitializeDb?: () => Promise<void>;
}

// --- WIDGETS SECTION ---
const CountUp = ({ end, prefix = '', suffix = '', duration = 1500 }: { end: number, prefix?: string, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = (x: number) => 1 - Math.pow(1 - x, 3); // Cubic ease out
      setCount(Math.floor(end * ease(percentage)));
      if (progress < duration) animationFrame = requestAnimationFrame(updateCount);
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};


const StatusWidget = ({ icon: Icon, label, value, color, subValue }: { icon: React.ElementType, label: string, value: string | React.ReactNode, color: string, subValue?: string }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-2xl group">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-transform group-hover:rotate-6`}>
      <Icon className={color.replace('bg-', 'text-').replace('text-opacity-100', '')} size={28} strokeWidth={2.5} />
    </div>
    <div>
      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</h4>
      <div className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{value}</div>
      {subValue && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{subValue}</div>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AdminPanel: React.FC<Props> = ({ inventory, onUpdate, onAdd, onDelete, onInitializeDb }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'pipeline' | 'analytics' | 'security'>('inventory');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  // Widget States
  const [uploadedTodayCount, setUploadedTodayCount] = useState(0);
  const [deviceType, setDeviceType] = useState<'Mac' | 'iPhone'>('Mac');

  // Print Logic
  const [selectedLeadForPrint, setSelectedLeadForPrint] = useState<Lead | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setSelectedLeadForPrint(null),
  });

  // --- LOGIC UPDATES ---
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setDeviceType(isMobile ? 'iPhone' : 'Mac');
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    const unsub = syncLeads((data) => setLeads(data));
    return () => {
      window.removeEventListener('resize', checkDevice);
      unsub();
    };
  }, []);

  const triggerPrint = (lead: Lead) => {
    setSelectedLeadForPrint(lead);
    setTimeout(() => handlePrint(), 100);
  };

  const getCarForLead = (lead: Lead) => {
    if (lead.vehicleId) return inventory.find(c => c.id === lead.vehicleId);
    if (lead.vehicleOfInterest) return inventory.find(c => c.name === lead.vehicleOfInterest);
    return undefined;
  };

  const filteredInventory = inventory.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleInitClick = async () => {
    if (!onInitializeDb) return;
    setIsInitializing(true);
    try { await onInitializeDb(); }
    catch (e) { console.error(e); }
    finally { setIsInitializing(false); }
  };

  const handlePhotoUploaded = () => {
    setUploadedTodayCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8">

        {/* HEADER AREA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#00aed9] font-black text-[10px] uppercase tracking-[0.25em] mb-2 animate-in fade-in slide-in-from-left-5">
              <DatabaseZap size={14} /> Sistema de Control v2.6
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
              Inventario <span className="text-[#00aed9]">Pro</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {onInitializeDb && (
              <button
                onClick={handleInitClick}
                disabled={isInitializing}
                className="flex-1 md:flex-none h-[44px] px-6 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isInitializing ? <Loader2 size={16} className="animate-spin" /> : <DatabaseZap size={16} />}
                <span className="hidden sm:inline">Reset DB</span>
              </button>
            )}
            <button
              onClick={() => { setEditingCar(null); setIsModalOpen(true); }}
              className="flex-1 md:flex-none h-[44px] px-6 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Nueva Unidad</span><span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </header>

        {/* KPI WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusWidget
            icon={CarFront}
            label="Total Inventario"
            value={<CountUp end={inventory.length} prefix="" />}
            color="bg-blue-500 text-blue-500 bg-opacity-100 text-opacity-100"
            subValue={inventory.length > 0 ? "Actualizado" : "Sin stock"}
          />
          <StatusWidget
            icon={BarChart3}
            label="Leads Activos"
            value={<CountUp end={leads.filter(l => l.status === 'new').length} />}
            color="bg-emerald-500 text-emerald-500 bg-opacity-100 text-opacity-100"
            subValue="Potenciales hoy"
          />
          <StatusWidget
            icon={Package}
            label="Valor Total"
            value={<CountUp end={inventory.reduce((sum, car) => sum + car.price, 0)} prefix="$" />}
            color="bg-purple-500 text-purple-500 bg-opacity-100 text-opacity-100"
            subValue="Estimado"
          />
          <StatusWidget
            icon={activeTab === 'inventory' ? Loader2 : Search}
            label="Estado del Sistema"
            value="Online"
            color="bg-amber-500 text-amber-500 bg-opacity-100 text-opacity-100"
            subValue={`v2.6.0 • ${deviceType}`}
          />
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner w-full md:w-fit overflow-x-auto gap-1">
          {[
            { id: 'inventory', label: 'Inventario', icon: Package },
            { id: 'pipeline', label: 'CRM Pipeline', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'security', label: 'Seguridad', icon: ShieldAlert }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-8 h-[48px] rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-[#00aed9] text-white shadow-lg shadow-[#00aed9]/30 scale-105'
                : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
            >
              <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <main className="animate-in fade-in zoom-in-95 duration-300">
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <InventoryHeatmap inventory={inventory} />
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="h-[calc(100vh-350px)] min-h-[500px]">
              <div className="hidden">
                {selectedLeadForPrint && (
                  <DealSheet ref={printRef} lead={selectedLeadForPrint} car={getCarForLead(selectedLeadForPrint)} />
                )}
              </div>
              <KanbanBoard leads={leads} onPrint={triggerPrint} searchTerm={searchTerm} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="min-h-[600px]">
              <AuditLogViewer />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-350px)] min-h-[600px]">
              {/* Search Bar */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00aed9] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar vehículo..."
                    className="w-full pl-12 pr-4 h-[50px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition-all text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-700/30 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehículo</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Categoría</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Precio</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredInventory.map((car) => (
                      <tr key={car.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center p-1">
                              <img src={car.img} className="max-w-full max-h-full object-contain" alt={car.name} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white">{car.name}</div>
                              <div className="text-xs text-slate-400 hidden sm:block truncate max-w-[150px]">{car.description || 'Sin descripción'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 uppercase">{car.type}</span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {car.badge ?
                            <span className="px-3 py-1 bg-[#00aed9]/10 text-[#00aed9] rounded-full text-xs font-bold uppercase">{car.badge}</span> :
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase">Stock</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
                          ${car.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingCar(car); setIsModalOpen(true); }} className="w-[40px] h-[40px] rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-[#00aed9] hover:text-white transition-colors">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => onDelete(car.id)} className="w-[40px] h-[40px] rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL EDITOR */}
      {isModalOpen && (
        <AdminModal
          car={editingCar}
          onClose={() => setIsModalOpen(false)}
          onPhotoUploaded={handlePhotoUploaded}
          onSave={(data: Omit<CarType, 'id'>) => {
            if (editingCar) onUpdate({ ...data, id: editingCar.id });
            else onAdd(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
