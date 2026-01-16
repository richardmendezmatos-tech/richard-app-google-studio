
import React, { useState, useEffect, useRef } from 'react';
import { Car, CarType, Lead } from '../types';
import { Plus, Trash2, Edit3, BarChart3, Package, DollarSign, X, TrendingUp, Search, UploadCloud, Loader2, Image as ImageIcon, Link as LinkIcon, DatabaseZap, Wand2, Phone, Mail, MessageSquare, CheckCircle, Clock, Send, Smartphone, Monitor, Server, Camera, Eye } from 'lucide-react';
import { uploadImage, generateCarDescriptionAI, syncLeads, updateLeadStatus } from '../services/firebaseService';

import InventoryHeatmap from './InventoryHeatmap';
import { useReactToPrint } from 'react-to-print';
import DealSheet from './DealSheet';

interface Props {
  inventory: Car[];
  onUpdate: (car: Car) => void;
  onAdd: (car: Omit<Car, 'id'>) => void;
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

const StatusWidget = ({ icon: Icon, label, value, color, subValue }: { icon: any, label: string, value: string | React.ReactNode, color: string, subValue?: string }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</h4>
      <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">{value}</div>
      {subValue && <div className="text-[10px] font-medium text-slate-400 mt-0.5">{subValue}</div>}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AdminPanel: React.FC<Props> = ({ inventory, onUpdate, onAdd, onDelete, onInitializeDb }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'pipeline' | 'analytics'>('inventory');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
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

        {/* WIDGETS GRID (4 REQUIRED INDICATORS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
          <StatusWidget
            icon={Package}
            label="Total de Items"
            value={<CountUp end={inventory.length} />}
            color="bg-blue-500 text-blue-600"
            subValue="En Inventario"
          />
          <StatusWidget
            icon={Camera}
            label="Fotos Hoy"
            value={<CountUp end={uploadedTodayCount} />}
            color="bg-purple-500 text-purple-600"
            subValue="Subidas Recientes"
          />
          <StatusWidget
            icon={Server}
            label="Estado Servidor"
            value="Óptimo"
            color="bg-emerald-500 text-emerald-600"
            subValue="99.9% Uptime"
          />
          <StatusWidget
            icon={deviceType === 'Mac' ? Monitor : Smartphone}
            label="Dispositivo"
            value={deviceType}
            color="bg-amber-500 text-amber-600"
            subValue="Detectado"
          />
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm w-full md:w-fit overflow-x-auto">
          {[
            { id: 'inventory', label: 'Inventario', icon: Package },
            { id: 'pipeline', label: 'CRM Pipeline', icon: TrendingUp },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-6 h-[44px] rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#00aed9] text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <tab.icon size={16} /> {tab.label}
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
              <KanbanBoard leads={leads} onPrint={triggerPrint} />
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
          onSave={(data: Omit<Car, 'id'>) => {
            if (editingCar) onUpdate({ ...data, id: editingCar.id });
            else onAdd(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// --- SUBCOMPONENTS (REFACTORED FOR RESPONSIVENESS) ---

const AdminModal = ({ car, onClose, onSave, onPhotoUploaded }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(car?.img || '');
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState(car?.description || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Instant Preview Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // FileReader for Instant Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const fd = new FormData(e.currentTarget);
      let finalImageUrl = previewUrl;
      // Upload ONLY if a new file was selected. If preview was set via text URL, use that.
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
        onPhotoUploaded?.(); // Update counter
      }
      onSave({
        name: fd.get('name') as string,
        price: Number(fd.get('price')),
        type: fd.get('type') as CarType,
        badge: fd.get('badge') as string,
        img: finalImageUrl,
        description: description,
        features: (fd.get('features') as string).split(',').map(f => f.trim()),
      });
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-[40px] rounded-t-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 sticky top-0">
          <div>
            <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest">Editor de Inventario</div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{car ? 'Editar Unidad' : 'Nueva Unidad'}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Image Uploader */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Media</label>
              <div className="flex gap-4">
                <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 overflow-hidden relative">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-[44px] border-2 border-dashed border-[#00aed9] bg-[#00aed9]/5 rounded-xl flex items-center justify-center gap-2 text-[#00aed9] font-bold text-xs uppercase tracking-widest hover:bg-[#00aed9]/10 transition-colors"
                  >
                    <Camera size={18} /> Subir Foto / Tomar
                  </button>
                  <input
                    name="imgurl"
                    placeholder="O pegar URL..."
                    value={!selectedFile ? previewUrl : ''}
                    onChange={(e) => { setPreviewUrl(e.target.value); setSelectedFile(null); }}
                    className="w-full h-[44px] px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00aed9]"
                  />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre</label>
                <input name="name" defaultValue={car?.name} required className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="Ej. Toyota Corolla" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Precio</label>
                <input name="price" type="number" defaultValue={car?.price} required className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="25000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</label>
                <select name="type" defaultValue={car?.type || 'suv'} className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9] appearance-none">
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="pickup">Pickup</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Badge</label>
                <input name="badge" defaultValue={car?.badge} className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="Opcional" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Características</label>
              <input name="features" defaultValue={car?.features?.join(', ')} className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="GPS, Cuero, Turbo..." />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-[#00aed9] resize-none"
              />
            </div>

            <button type="submit" disabled={isUploading} className="w-full h-[56px] bg-[#0d2232] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
              {isUploading ? 'Guardando...' : 'Guardar Unidad'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Kanban components kept minimal due to file size limits, but integrated stylistically
const KanbanBoard = ({ leads, onPrint }: { leads: Lead[], onPrint: (lead: Lead) => void }) => {
  const columns = [
    { id: 'new', title: 'Nuevos', color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contactados', color: 'bg-amber-500' },
    { id: 'negotiating', title: 'Negociando', color: 'bg-purple-500' },
    { id: 'sold', title: 'Vendidos', color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 px-1">
      {columns.map(col => (
        <div key={col.id} className="min-w-[280px] w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl p-4 flex flex-col h-full border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${col.color}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{col.title}</span>
            <span className="ml-auto bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
              {leads.filter(l => (l.status || 'new') === col.id).length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
            {leads.filter(l => (l.status || 'new') === col.id).map(lead => (
              <LeadCard key={lead.id} lead={lead} onPrint={() => onPrint(lead)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const LeadCard = ({ lead, onPrint }: { lead: Lead, onPrint: () => void }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-[#00aed9] transition-all">
    <div className="flex justify-between mb-2">
      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase text-slate-500">{lead.type}</span>
      <span className="text-[10px] font-bold text-slate-300">{new Date((lead.timestamp?.seconds || 0) * 1000).toLocaleDateString()}</span>
    </div>
    <div className="font-bold text-slate-800 dark:text-white text-sm mb-1">{lead.firstName} {lead.lastName}</div>
    <div className="text-xs text-slate-500 truncate mb-3">{lead.vehicleOfInterest || lead.message || 'Sin detalles'}</div>

    {/* AI Summary Highlight */}
    {lead.aiSummary && (
      <div className="mb-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
        <div className="flex items-center gap-1.5 mb-1">
          <Wand2 size={10} className="text-indigo-500" />
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Análisis IA</span>
        </div>
        <p className="text-[10px] leading-snug text-slate-600 dark:text-slate-300 line-clamp-2" title={lead.aiSummary}>
          {lead.aiSummary}
        </p>
      </div>
    )}

    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
      <div className="flex gap-1">
        {lead.phone && <a href={`tel:${lead.phone}`} className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Phone size={12} /></a>}
        {lead.email && <a href={`mailto:${lead.email}`} className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Mail size={12} /></a>}
      </div>
      <button onClick={onPrint} className="text-[10px] font-bold text-slate-400 hover:text-[#00aed9] uppercase tracking-wider">Ver Hoja</button>
    </div>

    <select
      value={lead.status || 'new'}
      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
      className="mt-3 w-full text-[10px] font-bold uppercase bg-slate-50 dark:bg-slate-800 rounded-lg py-2 px-2 outline-none"
    >
      <option value="new">Nuevo</option>
      <option value="contacted">Contactado</option>
      <option value="negotiating">Negociando</option>
      <option value="sold">Vendido</option>
    </select>
  </div>
);

export default AdminPanel;
