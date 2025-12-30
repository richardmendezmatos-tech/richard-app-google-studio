
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Car, CarType } from '../types';
import { Search, Heart, ChevronRight, Zap, ShieldCheck, Globe, Camera, UploadCloud, X, Loader2, Sparkles, BrainCircuit, GitCompare, DatabaseZap, Wrench, ArrowUpDown, Filter, Instagram, Facebook, Twitter, Youtube, Linkedin, Phone } from 'lucide-react';
import CarDetailModal from './CarDetailModal';
import AIChatWidget from './AIChatWidget';
import NeuralMatchModal from './NeuralMatchModal'; 
import ComparisonModal from './ComparisonModal'; 
import { analyzeCarImage } from '../services/geminiService';
import { getCookie, setCookie } from '../services/cookieService';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  inventory: Car[];
  initialVisualSearch?: string | null;
  onClearVisualSearch?: () => void;
  onMagicFix?: () => Promise<void>;
  onOpenGarage?: () => void; 
}

const Storefront: React.FC<Props> = ({ inventory, initialVisualSearch, onClearVisualSearch, onMagicFix, onOpenGarage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CarType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null); 
  const [savedCarIds, setSavedCarIds] = useState<string[]>([]); 
  
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isNeuralMatchOpen, setIsNeuralMatchOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [visualContext, setVisualContext] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<Car[]>([]);
  const [isFixing, setIsFixing] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar favoritos desde Cookies al inicio
  useEffect(() => {
    const savedCookie = getCookie('richard_saved_cars');
    if (savedCookie) {
      try {
        setSavedCarIds(JSON.parse(savedCookie));
      } catch (e) {
        console.error("Error parsing saved cars cookie", e);
      }
    }
  }, []);

  // Effect to handle incoming visual search
  useEffect(() => {
      if (initialVisualSearch) {
          performVisualAnalysis(initialVisualSearch);
      }
  }, [initialVisualSearch]);

  const toggleSaveCar = (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();

    // REQUISITO: Si no hay usuario, redirigir al login
    if (!user) {
        navigate('/login', { state: { from: location } });
        return;
    }

    setSavedCarIds(prev => {
      const newSaved = prev.includes(carId) 
        ? prev.filter(id => id !== carId) 
        : [...prev, carId];
      
      // Guardar en cookie por 30 días
      setCookie('richard_saved_cars', JSON.stringify(newSaved), 30);
      return newSaved;
    });
  };

  const performVisualAnalysis = async (base64: string) => {
      setAnalyzingImage(true);
      setIsVisualSearchOpen(true);
      try {
        const analysis = await analyzeCarImage(base64);
        setSearchTerm(analysis.keywords[1] || analysis.keywords[0]);
        const detectedType = analysis.type.toLowerCase();
        if (['suv', 'sedan', 'pickup', 'luxury'].includes(detectedType)) {
            setFilter(detectedType as CarType);
        } else {
            setFilter('all');
        }
        setVisualContext(analysis.description);
        if (onClearVisualSearch) onClearVisualSearch();
        setIsVisualSearchOpen(false);
      } catch (error) {
        console.error("Error en búsqueda visual automática", error);
        alert("No pudimos analizar la imagen importada.");
        setIsVisualSearchOpen(false);
      } finally {
        setAnalyzingImage(false);
      }
  };

  // Lógica de Filtrado y Ordenamiento
  const filteredAndSorted = inventory.filter(c => {
    let matchesSearch = true;
    if (visualContext) {
         matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         visualContext.toLowerCase().includes(c.type) ||
                         c.type.includes(visualContext.split(' ')[0] || '');
    } else {
         matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    const matchesType = filter === 'all' || c.type === filter;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0; 
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await performVisualAnalysis(base64);
    };
  };

  const handleToggleCompare = (e: React.MouseEvent, car: Car) => {
    e.stopPropagation();
    setCompareList(prev => {
        const isSelected = prev.some(c => c.id === car.id);
        if (isSelected) {
            return prev.filter(c => c.id !== car.id);
        }
        if (prev.length >= 2) {
            alert("Modo VS: Máximo 2 unidades para comparar.");
            return prev;
        }
        return [...prev, car];
    });
  };

  const handleMagicClick = async () => {
      if (!onMagicFix) return;
      setIsFixing(true);
      await onMagicFix();
      setIsFixing(false);
  };

  return (
    <>
      <div className="p-6 lg:p-12 max-w-[1800px] mx-auto space-y-12 pb-24">
        {/* Dynamic Hero Section */}
        <section className="relative h-[500px] rounded-[50px] overflow-hidden flex items-center p-8 lg:p-20 text-white group shadow-2xl shadow-cyan-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#173d57] to-[#00aed9] transition-transform duration-[3s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="absolute top-0 right-0 p-20 opacity-10 select-none pointer-events-none">
            <h2 className="text-[250px] text-brutalist uppercase text-white hidden lg:block">DRIVE</h2>
          </div>

          <div className="relative z-10 max-w-3xl space-y-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full w-fit">
              <Zap size={14} className="text-cyan-300 fill-cyan-300" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Inventario 2026 Disponible</span>
            </div>
            <h2 className="text-5xl lg:text-8xl text-brutalist uppercase leading-[0.9]">
              FUTURE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">READY.</span>
            </h2>
            <p className="text-lg font-medium text-blue-100 max-w-xl leading-relaxed">
              La experiencia de compra que supera a CarMax. Inspección de 150 puntos, IA predictiva y entrega a domicilio.
            </p>
            <div className="flex gap-4 pt-4">
                 <button 
                    onClick={() => setIsNeuralMatchOpen(true)}
                    className="px-8 py-4 bg-white text-[#173d57] rounded-full font-black uppercase tracking-widest hover:bg-cyan-50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2"
                 >
                    <BrainCircuit size={18} /> Neural Match
                 </button>
            </div>
          </div>
        </section>

        {/* Neural Match Modal */}
        {isNeuralMatchOpen && (
            <NeuralMatchModal 
                inventory={inventory} 
                onClose={() => setIsNeuralMatchOpen(false)} 
                onSelectCar={(car) => {
                    setSelectedCar(car);
                    setIsNeuralMatchOpen(false);
                }}
            />
        )}
        
        {/* Comparison Modal */}
        {isComparisonOpen && (
            <ComparisonModal 
                cars={compareList}
                onClose={() => setIsComparisonOpen(false)}
            />
        )}

        {/* Visual Search Modal */}
        {isVisualSearchOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d2232]/90 backdrop-blur-xl animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] max-w-lg w-full relative shadow-2xl border border-slate-700">
                    <button onClick={() => setIsVisualSearchOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X /></button>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                        <Camera className="text-[#00aed9]" size={32} /> Visual AI
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Sube una foto y nuestra IA encontrará el match perfecto en nuestro inventario.</p>
                    
                    {analyzingImage ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4 border-2 border-dashed border-[#00aed9]/30 rounded-3xl bg-[#00aed9]/5">
                            <Loader2 className="w-12 h-12 text-[#00aed9] animate-spin" />
                            <p className="text-sm font-bold animate-pulse text-[#00aed9] uppercase tracking-widest">Escaneando...</p>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group hover:border-[#00aed9]">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-12 h-12 mb-3 text-slate-400 group-hover:text-[#00aed9] transition-colors scale-100 group-hover:scale-110 duration-300" />
                                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-bold text-[#00aed9]">Sube una foto</span> o arrastra aquí</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>
            </div>
        )}

        {/* Search & Filters & Sort */}
        <div className="sticky top-0 z-30 py-4 -mx-4 px-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
            
            {/* Search Bar */}
            <div className="flex-1 relative w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#00aed9] transition-colors" size={24} />
                <input 
                type="text"
                placeholder={visualContext ? `Buscando similares a: ${searchTerm}...` : "Buscar modelo, año o características..."}
                className="w-full pl-16 pr-20 py-5 bg-white dark:bg-slate-800 rounded-full border-2 border-transparent dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 focus:border-[#00aed9] dark:focus:border-[#00aed9] shadow-xl dark:shadow-none transition-all text-lg font-semibold dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setVisualContext(null); }}
                />
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                        onClick={() => setIsNeuralMatchOpen(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-[#00aed9] hover:text-white text-slate-500 rounded-full transition-all text-xs font-bold uppercase tracking-wide border border-transparent hover:border-cyan-400"
                        title="Encuentra tu auto ideal por estilo de vida"
                    >
                        <BrainCircuit size={16} /> Neural Match
                    </button>
                    <button 
                        onClick={() => setIsVisualSearchOpen(true)}
                        className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-[#00aed9] hover:text-white text-slate-500 rounded-full transition-all"
                        title="Búsqueda Visual por IA"
                    >
                        <Camera size={20} />
                    </button>
                </div>
            </div>
            
            {/* Filters & Sorting */}
            <div className="flex gap-4 items-center w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                {/* Car Type Filter */}
                <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                    {['all', 'suv', 'sedan', 'pickup'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type as any)}
                        className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                        filter === type 
                            ? 'bg-[#173d57] dark:bg-[#00aed9] text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                        }`}
                    >
                        {type === 'all' ? 'Todos' : type}
                    </button>
                    ))}
                </div>

                {/* Price Sorting */}
                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                     <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? null : 'asc')}
                        className={`px-4 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all ${
                            sortOrder === 'asc' ? 'bg-[#00aed9] text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title="Menor Precio"
                     >
                        <ArrowUpDown size={14} className="rotate-180" /> <span className="hidden sm:inline">$-$$$</span>
                     </button>
                     <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? null : 'desc')}
                        className={`px-4 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all ${
                            sortOrder === 'desc' ? 'bg-[#00aed9] text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title="Mayor Precio"
                     >
                        <ArrowUpDown size={14} /> <span className="hidden sm:inline">$$$-$</span>
                     </button>
                </div>
            </div>
            </div>
        </div>
        
        {/* Results Banner */}
        <div className="flex justify-between items-end px-2">
            <div>
                 <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    {filteredAndSorted.length} Vehículos Encontrados
                 </h3>
                 {savedCarIds.length > 0 && (
                     <button 
                        onClick={() => onOpenGarage && onOpenGarage()}
                        className="text-sm text-[#00aed9] font-bold mt-1 flex items-center gap-1 hover:underline cursor-pointer"
                     >
                         <Heart size={14} fill="currentColor" /> Ver Mi Garaje Digital ({savedCarIds.length})
                     </button>
                 )}
            </div>
            {visualContext && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#00aed9]/10 to-transparent border-l-4 border-[#00aed9] p-3 rounded-r-xl">
                    <Sparkles size={16} className="text-[#00aed9]" />
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-[#00aed9]">Richard Vision:</span> Resultados visuales.
                    </p>
                    <button onClick={() => { setVisualContext(null); setSearchTerm(''); setFilter('all'); }} className="ml-2 text-[10px] font-bold underline hover:text-[#00aed9]">Limpiar</button>
                </div>
            )}
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
          {inventory.length === 0 ? (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-100 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-300 dark:border-slate-700 animate-in fade-in">
                 <DatabaseZap size={48} className="text-slate-400 mb-4" />
                 <h3 className="text-2xl font-black text-slate-700 dark:text-white uppercase tracking-tight">Base de datos vacía</h3>
                 <p className="text-slate-500 mt-2 max-w-md">No hay autos visibles.</p>
                 
                 {onMagicFix && (
                     <button 
                        onClick={handleMagicClick}
                        disabled={isFixing}
                        className="mt-6 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-3 animate-bounce"
                     >
                        {isFixing ? (
                            <>
                                <Loader2 className="animate-spin" /> Reparando Sistema...
                            </>
                        ) : (
                            <>
                                <Wrench size={20} /> 🚨 Reparación Automática (Magic Fix)
                            </>
                        )}
                     </button>
                 )}
                 {!onMagicFix && (
                     <p className="text-slate-500 mb-6 max-w-md">Ve al Admin Panel para configurar.</p>
                 )}
             </div>
          ) : filteredAndSorted.length > 0 ? filteredAndSorted.map((car) => (
            <CarCard 
                key={car.id} 
                car={car} 
                onSelect={() => setSelectedCar(car)} 
                onCompare={(e) => handleToggleCompare(e, car)}
                isComparing={compareList.some(c => c.id === car.id)}
                isSaved={savedCarIds.includes(car.id)}
                onToggleSave={(e) => toggleSaveCar(e, car.id)}
            />
          )) : (
            <div className="col-span-full py-32 text-center bg-slate-100 dark:bg-slate-800/50 rounded-[40px] border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-2xl font-black text-slate-300 dark:text-slate-500 uppercase tracking-tight">Sin Resultados</p>
                <button onClick={() => {setSearchTerm(''); setFilter('all'); setVisualContext(null);}} className="mt-4 text-[#00aed9] font-bold underline hover:text-cyan-400">Limpiar Filtros</button>
            </div>
          )}
        </div>
        
        {/* Floating Comparison Bar */}
        {compareList.length > 0 && (
            <div className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 z-40 bg-[#173d57] dark:bg-[#0d2232] text-white pl-2 pr-6 py-2 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 border border-[#00aed9]/30 backdrop-blur-md">
                <div className="flex -space-x-3">
                    {compareList.map(c => (
                        <div key={c.id} className="w-10 h-10 rounded-full border-2 border-[#173d57] dark:border-[#0d2232] bg-white flex items-center justify-center overflow-hidden">
                            <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {compareList.length < 2 && (
                         <div className="w-10 h-10 rounded-full border-2 border-[#173d57] dark:border-[#0d2232] bg-white/10 flex items-center justify-center text-xs font-bold border-dashed border-white/30">
                            ?
                         </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">Comparativa VS</span>
                    <span className="text-[10px] text-cyan-300 font-medium">{compareList.length} de 2 Seleccionados</span>
                </div>
                {compareList.length === 2 && (
                     <button 
                        onClick={() => setIsComparisonOpen(true)}
                        className="ml-2 bg-[#00aed9] hover:bg-cyan-400 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,174,217,0.5)] animate-pulse"
                     >
                        Iniciar
                     </button>
                )}
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <button onClick={() => setCompareList([])} className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
        )}

        <TrustSection />
        
        {/* Social Footer Section */}
        <SocialFooter />
      </div>
      
      {/* Detail Modal */}
      {selectedCar && (
        <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}

      {/* Chat Widget */}
      <AIChatWidget inventory={inventory} />
    </>
  );
};

const SocialFooter: React.FC = () => {
    return (
        <footer className="mt-12 py-12 px-6 rounded-[40px] bg-[#173d57] dark:bg-[#0d2232] text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                <Globe size={300} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Síguenos en Redes</h3>
                    <p className="text-blue-200 text-sm mt-1 max-w-md">
                        Mantente al día con los últimos ingresos, ofertas exclusivas y novedades de Richard Automotive.
                    </p>
                </div>

                <div className="flex gap-4">
                    <SocialButton icon={<Instagram size={20} />} label="Instagram" href="#" />
                    <SocialButton icon={<Facebook size={20} />} label="Facebook" href="#" />
                    <SocialButton icon={<Youtube size={20} />} label="YouTube" href="#" />
                    <SocialButton icon={<Twitter size={20} />} label="X / Twitter" href="#" />
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-400 gap-4">
                <p>&copy; 2025 Richard Automotive. Todos los derechos reservados.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                    <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
                </div>
            </div>
        </footer>
    );
};

const SocialButton = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 bg-white/10 hover:bg-[#00aed9] hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-sm group"
        title={label}
    >
        <span className="text-white group-hover:animate-bounce">{icon}</span>
    </a>
);

const CarCard: React.FC<{ 
    car: Car; 
    onSelect: () => void; 
    onCompare: (e: React.MouseEvent) => void; 
    isComparing: boolean;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
}> = ({ car, onSelect, onCompare, isComparing, isSaved, onToggleSave }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const estimatedMonthly = Math.round(car.price / 72); // Rough 72 month calculation for card view

  return (
    <button onClick={onSelect} className="group bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-[#00aed9]/30 dark:hover:border-[#00aed9]/30 hover:shadow-2xl hover:shadow-cyan-900/10 transition-all duration-500 cursor-pointer text-left flex flex-col relative h-full">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden p-8 flex items-center justify-center">
        
        {/* Badges Container */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 items-start">
            {car.badge && (
            <span className="px-3 py-1.5 bg-[#00aed9] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                {car.badge}
            </span>
            )}
            <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <ShieldCheck size={12} className="text-emerald-500" /> Richard Certified
            </span>
        </div>
        
        {/* Action Buttons Top Right */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
            {/* Heart / Save Button */}
            <div 
                onClick={onToggleSave}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 border ${isSaved ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-rose-500'}`}
                title={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
                <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
            </div>

            {/* Compare Button */}
            <div 
                onClick={onCompare}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 border ${isComparing ? 'bg-[#00aed9] text-white border-[#00aed9]' : 'bg-white/80 dark:bg-slate-700/80 text-slate-400 border-slate-200 dark:border-slate-600 hover:text-[#00aed9]'}`}
                title={isComparing ? "Quitar de comparar" : "Agregar a comparar"}
            >
                <GitCompare size={18} />
            </div>
        </div>

        <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden lg:block">
            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-[#00aed9] shadow-md">
                <ChevronRight size={20} />
            </div>
        </div>

        {/* Loading Placeholder / Skeleton */}
        {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 z-0">
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-200/20 dark:via-slate-700/20 to-transparent animate-pulse" />
                 <Loader2 className="text-[#00aed9] animate-spin relative z-10" size={32} />
            </div>
        )}

        <img 
          src={car.img} 
          alt={car.name} 
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-contain transition-all duration-700 drop-shadow-2xl z-10
            ${isImageLoaded 
                ? 'opacity-100 scale-100 group-hover:scale-110 group-hover:-rotate-2' 
                : 'opacity-0 scale-95'}
          `}
        />
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-4">
            <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.2em]">{car.type}</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter mt-1 group-hover:text-[#00aed9] transition-colors line-clamp-1">{car.name}</h3>
        </div>
        
        {/* Key Features Mockup (CarMax style) */}
        <div className="flex gap-2 mb-6">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">Auto</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">Gasolina</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">4 Puertas</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
            <div>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-200">${car.price.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-[#00aed9] mt-1">Est. ${estimatedMonthly}/mes</p>
            </div>
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 group-hover:bg-[#00aed9] group-hover:text-white transition-colors">
                Ver Detalles
            </div>
        </div>
      </div>
    </button>
  );
};

const TrustSection: React.FC = () => {
  return (
    <section className="py-12 border-t border-slate-200 dark:border-slate-700">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-2xl">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Certificación 150 Puntos</h4>
                    <p className="text-sm text-slate-500 mt-1">Cada auto pasa una inspección rigurosa antes de ser listado.</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500 rounded-2xl">
                    <Zap size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Love Your Car Guarantee</h4>
                    <p className="text-sm text-slate-500 mt-1">Pruébalo por 24 horas. Si no te enamora, devuélvelo.</p>
                </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-500 rounded-2xl">
                    <Globe size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Entrega o Recogido</h4>
                    <p className="text-sm text-slate-500 mt-1">Tú eliges: te lo llevamos a casa o vienes a nuestro centro.</p>
                </div>
            </div>
       </div>
    </section>
  );
};

export default Storefront;
