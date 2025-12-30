
import React, { useState, useEffect, useRef } from 'react';
import { Car, CarType } from '../types';
import { Plus, Trash2, Edit3, BarChart3, Package, DollarSign, X, TrendingUp, Search, UploadCloud, Loader2, Image as ImageIcon, Link as LinkIcon, DatabaseZap, Wand2 } from 'lucide-react';
import { uploadImage, generateCarDescriptionAI } from '../services/firebaseService';

interface Props {
  inventory: Car[];
  onUpdate: (car: Car) => void;
  onAdd: (car: Omit<Car, 'id'>) => void;
  onDelete: (id: string) => void;
  onInitializeDb?: () => Promise<void>;
}

const CountUp = ({ end, prefix = '', suffix = '', duration = 2000 }: { end: number, prefix?: string, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = (x: number) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      setCount(Math.floor(end * ease(percentage)));
      if (progress < duration) animationFrame = requestAnimationFrame(updateCount);
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Sparkline = ({ color }: { color: string }) => {
  const path = "M0 50 Q 20 40, 40 60 T 80 40 T 120 50 T 160 30 T 200 60";
  return (
    <svg viewBox="0 0 200 80" className={`w-full h-full opacity-20 stroke-current fill-none ${color}`} preserveAspectRatio="none">
      <path d={path} strokeWidth="4" strokeLinecap="round" />
      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </linearGradient>
      <path d={`${path} V 80 H 0 Z`} fill="url(#gradient)" stroke="none" />
    </svg>
  );
};

const AdminPanel: React.FC<Props> = ({ inventory, onUpdate, onAdd, onDelete, onInitializeDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const totalValue = inventory.reduce((acc, curr) => acc + curr.price, 0);
  const filteredInventory = inventory.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleInitClick = async () => {
    if (!onInitializeDb) return;
    setIsInitializing(true);
    try {
      await onInitializeDb();
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#00aed9] font-black text-xs uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-5">
            <TrendingUp size={14} /> Control de Flota 2.0
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] to-blue-500">Center</span>
          </h2>
        </div>
        <div className="flex gap-4">
          {inventory.length === 0 && onInitializeDb && (
            <button
              onClick={handleInitClick}
              disabled={isInitializing}
              className="px-6 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
            >
              {isInitializing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Subiendo Datos...
                </>
              ) : (
                <>
                  <DatabaseZap size={16} strokeWidth={3} /> Inicializar BD
                </>
              )}
            </button>
          )}
          <button
            onClick={() => { setEditingCar(null); setIsModalOpen(true); }}
            className="px-8 py-4 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={4} /> Agregar Unidad
          </button>
        </div>
      </header>

      {/* Modern Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#173d57] to-[#0d2232] p-8 rounded-[35px] shadow-2xl relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <DollarSign size={200} />
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <DollarSign size={24} className="text-[#00aed9]" />
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp size={12} /> +12.5% vs mes anterior
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Total de Inventario</div>
              <div className="text-6xl font-black tracking-tighter">
                <CountUp end={totalValue} prefix="$" />
              </div>
            </div>
          </div>
        </div>

        <StatCard
          icon={<Package />}
          color="text-blue-500"
          bg="bg-blue-500/10"
          label="Stock Total"
          value={<CountUp end={inventory.length} suffix=" Unidades" />}
        />

        <StatCard
          icon={<BarChart3 />}
          color="text-amber-500"
          bg="bg-amber-500/10"
          label="Precio Promedio"
          value={<CountUp end={Math.round(totalValue / (inventory.length || 1))} prefix="$" />}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl">
          <h3 className="text-lg font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Package size={18} /> Inventario Activo
          </h3>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00aed9] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar por modelo, tipo..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unidad</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Precio</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                    {inventory.length === 0
                      ? "La base de datos está vacía. Usa el botón verde 'Inicializar BD' arriba a la derecha."
                      : "No se encontraron resultados para tu búsqueda."}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-1 flex items-center justify-center shadow-sm">
                          <img src={car.img} alt={car.name} loading="lazy" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{car.name}</div>
                          <div className="text-[10px] font-bold text-[#00aed9] uppercase tracking-wider mt-1">{car.badge || 'En Stock'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${car.type === 'suv' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' :
                        car.type === 'sedan' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                        }`}>
                        {car.type}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-black text-slate-700 dark:text-slate-300 text-lg">
                      ${car.price.toLocaleString()}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCar(car); setIsModalOpen(true); }} className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl hover:bg-[#00aed9] hover:text-white transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => onDelete(car.id)} className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AdminModal
          car={editingCar}
          onClose={() => setIsModalOpen(false)}
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

const StatCard = ({ icon, label, value, color, bg }: any) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[35px] shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col justify-between items-start gap-6 hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden group">
      <div className="absolute inset-0 translate-y-10 opacity-0 group-hover:opacity-100 transition-all duration-700 z-0">
        <Sparkline color={color} />
      </div>

      <div className={`p-4 rounded-2xl ${bg} ${color} relative z-10`}>{icon}</div>
      <div className="space-y-1 relative z-10">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
        <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{value}</div>
      </div>
    </div>
  );
};

const AdminModal = ({ car, onClose, onSave }: any) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(car?.img || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState(car?.description || '');
  const [features, setFeatures] = useState<string>(car?.features?.join(', ') || '');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    setSelectedFile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor sube solo archivos de imagen (PNG, JPG).');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const fd = new FormData(e.currentTarget);
      let finalImageUrl = previewUrl;
      if (selectedFile) {
        try {
          finalImageUrl = await uploadImage(selectedFile);
        } catch (uploadErr) {
          console.error("Fallo la subida a Firebase:", uploadErr);
          alert("No se pudo subir la imagen a Firebase. Verifica tu conexión o intenta usar un enlace directo.");
          setIsUploading(false);
          return;
        }
      }
      onSave({
        name: fd.get('name') as string,
        price: Number(fd.get('price')),
        type: fd.get('type') as CarType,
        badge: fd.get('badge') as string,
        img: finalImageUrl,
        description: description,
        features: features.split(',').map(f => f.trim()).filter(f => f),
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error inesperado al guardar la unidad.");
      setIsUploading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0d2232]/80 backdrop-blur-xl animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[50px] shadow-2xl p-10 lg:p-14 relative overflow-hidden animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} aria-label="Cerrar modal" className="absolute top-8 right-8 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all z-20">
          <X size={20} />
        </button>
        <div className="mb-8 space-y-2">
          <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.4em]">Editor de Flota</div>
          <h3 id="admin-modal-title" className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{car ? 'Editar' : 'Nueva'} Unidad</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block mb-2">Fotografía del Vehículo</label>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-300 dark:text-slate-600" size={32} />
                )}
                <input type="hidden" name="img" value={previewUrl} />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative h-24 rounded-3xl transition-all duration-300 group ${isDragging
                    ? 'bg-[#00aed9]/10 border-2 border-[#00aed9] scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00aed9]'
                    }`}
                >
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer absolute inset-0 z-10">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      <UploadCloud className={`w-6 h-6 mb-2 transition-colors ${isDragging ? 'text-[#00aed9] animate-bounce' : 'text-slate-400 group-hover:text-[#00aed9]'}`} />
                      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400 text-center">
                        {isDragging ? <span className="font-bold text-[#00aed9]">¡Suelta la imagen!</span> : <><span className="font-bold text-[#00aed9]">Clic para subir</span> o arrastra</>}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink-0 mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">O pega un enlace</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/auto.jpg"
                    value={!selectedFile ? previewUrl : ''}
                    onChange={handleUrlChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/10 text-xs font-bold outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <FormField label="Nombre Comercial" id="name" defaultValue={car?.name} placeholder="Ej. Hyundai Tucson" required />
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Precio Lista" id="price" type="number" defaultValue={car?.price} placeholder="0" required />
            <div>
              <label htmlFor="type" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block mb-2">Categoría</label>
              <div className="relative">
                <select id="type" name="type" defaultValue={car?.type} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/10 text-base font-bold appearance-none outline-none">
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="pickup">Pickup</option>
                  <option value="luxury">Luxury</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
              </div>
            </div>
          </div>
          <FormField label="Etiqueta (Badge)" id="badge" defaultValue={car?.badge} placeholder="Ej. Oferta" />

          <FormField label="Características (separadas por coma)" id="features" value={features} onChange={(e: any) => setFeatures(e.target.value)} placeholder="Ej. 4x4, Cuero, Sunroof" />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Descripción</label>
              <button
                type="button"
                onClick={async () => {
                  // Assuming we can get name from the form ref if controlled, but here fields differ.
                  // Ideally we use state for all, but for minimal change let's use the values we have.
                  // We might need to grab name from document.getElementById or change Name to controlled.
                  const nameInput = document.getElementById('name') as HTMLInputElement;
                  const name = nameInput?.value;
                  if (!name) return alert('Por favor ingresa el nombre del auto primero.');

                  setIsGenerating(true);
                  try {
                    const feats = features.split(',').map(f => f.trim()).filter(f => f);
                    setDescription(''); // Clear previous description
                    await generateCarDescriptionAI(name, feats, (chunk) => {
                      setDescription((prev: string) => prev + chunk);
                    });
                  } catch (err) {
                    alert('Error generando descripción.');
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-[#00aed9] flex items-center gap-1 hover:text-cyan-400 transition-colors"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {isGenerating ? 'Generando...' : 'Generar con IA'}
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/10 text-base font-bold outline-none transition-all placeholder:text-slate-300 resize-none"
              placeholder="Descripción del vehículo..."
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-5 bg-[#173d57] hover:bg-[#00aed9] disabled:bg-slate-500 disabled:cursor-not-allowed text-white rounded-[25px] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-cyan-500/30 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {selectedFile ? 'Subiendo Imagen...' : 'Guardando...'}
              </>
            ) : (
              car ? 'Guardar Cambios' : 'Publicar Ahora'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ id, label, ...props }: any) => (
  <div>
    <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block mb-2">{label}</label>
    <input id={id} name={id} {...props} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/10 text-base font-bold outline-none transition-all placeholder:text-slate-300" />
  </div>
);

export default AdminPanel;
