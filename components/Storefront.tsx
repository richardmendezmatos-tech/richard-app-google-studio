import React, { useState, useEffect, useContext } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query'; // Import React Query
import { getPaginatedCars } from '../services/firebaseService'; // Import Service
import { Car, CarType } from '../types';
import { Search, Heart, X, Loader2, Sparkles, BrainCircuit, Camera, UploadCloud, ArrowUpDown, DatabaseZap, Wrench } from 'lucide-react';
import CarDetailModal from './CarDetailModal';
import AIChatWidget from './AIChatWidget';
import NeuralMatchModal from './NeuralMatchModal';
import ComparisonModal from './ComparisonModal';
import { analyzeCarImage } from '../services/geminiService';
import { getCookie, setCookie } from '../services/cookieService';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Import New Modular Components
import HeroSection from './storefront/HeroSection';
import TrustBar from './storefront/TrustBar';
import TestimonialsSection from './storefront/TestimonialsSection';
import FAQSection from './FAQSection';
import SocialFooter from './storefront/SocialFooter';
import PremiumGlassCard from './storefront/PremiumGlassCard'; // Premium UI Upgrade
import { logBehavioralEvent } from '../services/retargetingService';
import { useDealer } from '../contexts/DealerContext';

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
    const [semanticResultIds, setSemanticResultIds] = useState<string[]>([]);
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
            const isSaving = !prev.includes(carId);
            const newSaved = isSaving
                ? [...prev, carId]
                : prev.filter(id => id !== carId);

            // Retargeting Logic
            if (isSaving) {
                logBehavioralEvent({ carId, action: 'garage_add' });
            }

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
            const query = analysis.search_query || analysis.keywords[0];

            setSearchTerm(query);

            // NEW: Semantic Search (Matrix-4 Component 3)
            const { searchSemanticInventoryByText } = await import('../services/geminiService');
            const semanticMatches = await searchSemanticInventoryByText(query);

            if (semanticMatches.length > 0) {
                setVisualContext(`Identificado: ${analysis.description}. Encontramos coincidencias similares en el inventario.`);
                setSemanticResultIds(semanticMatches.map((m: any) => m.car_id));
            } else {
                setVisualContext(analysis.description);
                setSemanticResultIds([]);
            }

            const detectedType = (analysis.type || '').toLowerCase();
            if (['suv', 'sedan', 'pickup', 'luxury'].includes(detectedType)) {
                setFilter(detectedType as CarType);
            } else {
                setFilter('all');
            }

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

    // --- React Query for Pagination (v5) ---
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: ['cars', filter, sortOrder],
        queryFn: ({ pageParam }) => getPaginatedCars(9, pageParam as any, filter, sortOrder),
        initialPageParam: null,
        getNextPageParam: (lastPage: any) => lastPage.hasMore ? lastPage.lastDoc : undefined,
        enabled: !searchTerm && !visualContext,
        staleTime: 5 * 60 * 1000,
    });

    const { currentDealer } = useDealer();

    // Flatten pages for display
    const serverCars = data?.pages.flatMap(page => page.cars) || [];

    // --- Hybrid Data Logic ---
    // If Searching or Visual Context: Use 'filteredAndSorted' (Client-side from full inventory prop)
    // Else: Use 'serverCars' (Server-side Pagination)
    const isSearching = !!searchTerm || !!visualContext;

    // Client-Side filtering (Legacy logic, used when searching)
    const filteredAndSorted = inventory.filter(c => {
        // If we have semantic matches, restrict to those IDs
        if (semanticResultIds.length > 0) {
            return semanticResultIds.includes(c.id);
        }

        let matchesSearch = true;
        if (visualContext) {
            matchesSearch = ((c.name || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
                ((visualContext || '').toLowerCase().includes(c.type || '')) ||
                c.type.includes(visualContext.split(' ')[0] || '');
        } else {
            matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        }
        const matchesType = filter === 'all' || c.type === filter;

        return matchesSearch && matchesType;
    }).sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
    });

    // Final list to display
    const displayCars = isSearching ? filteredAndSorted : serverCars;

    // Loading State handling for initial load (server mode only)
    const isLoadingInitial = !isSearching && status === 'pending';

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
            <div className="p-0 lg:p-0 w-full pb-24 space-y-0 bg-slate-50 dark:bg-slate-950">

                {/* 1. Hero Section (Full Width) */}
                <HeroSection
                    onNeuralMatch={() => setIsNeuralMatchOpen(true)}
                    onBrowseInventory={() => {
                        document.getElementById('inventory-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onSellCar={() => navigate('/appraisal')}
                />

                {/* Main Content Container */}
                <div className="max-w-[1600px] mx-auto px-6 lg:px-12 space-y-16 -mt-20 relative z-20">

                    {/* 2. Trust Indicators (Floating Card) */}
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-none p-4 md:p-8">
                        <TrustBar />
                    </div>

                    {/* Search & Filters & Sort */}
                    <div id="inventory-grid" className="scroll-mt-32">
                        <div className="sticky top-4 z-30 py-4 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-lg border border-slate-100 dark:border-slate-800 transition-all duration-300">
                            <div className="flex flex-col lg:flex-row gap-6 items-center">

                                {/* Search Bar */}
                                <div className="flex-1 relative w-full group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#00aed9] transition-colors" size={24} />
                                    <input
                                        type="text"
                                        placeholder={visualContext ? `Buscando similares a: ${searchTerm}...` : "Buscar modelo, año o características..."}
                                        className="w-full pl-16 pr-20 py-4 bg-transparent outline-none text-lg font-semibold dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setVisualContext(null); setSemanticResultIds([]); }}
                                    />

                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                        <button
                                            onClick={() => setIsNeuralMatchOpen(true)}
                                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#00aed9] hover:text-white text-slate-500 rounded-full transition-all text-xs font-bold uppercase tracking-wide border border-transparent hover:border-cyan-400"
                                            title="Encuentra tu auto ideal por estilo de vida"
                                        >
                                            <BrainCircuit size={16} /> Neural Match
                                        </button>
                                        <button
                                            onClick={() => setIsVisualSearchOpen(true)}
                                            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#00aed9] hover:text-white text-slate-500 rounded-full transition-all"
                                            title="Búsqueda Visual por IA"
                                        >
                                            <Camera size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Filters & Sorting */}
                                <div className="flex gap-4 items-center w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                                    {/* Car Type Filter */}
                                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                        {['all', 'suv', 'sedan', 'pickup'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilter(type as any)}
                                                className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${filter === type
                                                    ? 'bg-[#173d57] dark:bg-[#00aed9] text-white shadow-md'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                                    }`}
                                            >
                                                {type === 'all' ? 'Todos' : type}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Price Sorting */}
                                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                        <button
                                            onClick={() => setSortOrder(prev => prev === 'asc' ? null : 'asc')}
                                            className={`px-4 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all ${sortOrder === 'asc' ? 'bg-[#00aed9] text-white' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'
                                                }`}
                                            title="Menor Precio"
                                        >
                                            <ArrowUpDown size={14} className="rotate-180" /> <span className="hidden sm:inline">$-$$$</span>
                                        </button>
                                        <button
                                            onClick={() => setSortOrder(prev => prev === 'desc' ? null : 'desc')}
                                            className={`px-4 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all ${sortOrder === 'desc' ? 'bg-[#00aed9] text-white' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'
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
                        <div className="flex justify-between items-end px-2 mt-8 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    {displayCars.length} {isSearching ? 'Resultados' : 'Vehículos'}
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
                                        <span className="font-bold text-[#00aed9]">:</span> Resultados visuales.
                                    </p>
                                    <button onClick={() => { setVisualContext(null); setSearchTerm(''); setFilter('all'); setSemanticResultIds([]); }} className="ml-2 text-[10px] font-bold underline hover:text-[#00aed9]">Limpiar</button>
                                </div>
                            )}
                        </div>

                        {/* Inventory Grid */}
                        <div className="pb-10 space-y-8">
                            {isLoadingInitial ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[40px] animate-pulse" />
                                    ))}
                                </div>
                            ) : displayCars.length === 0 ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-300 dark:border-slate-700 animate-in fade-in">
                                    {isSearching ? (
                                        <>
                                            <p className="text-2xl font-black text-slate-300 dark:text-slate-500 uppercase tracking-tight">Sin Resultados</p>
                                            <button onClick={() => { setSearchTerm(''); setFilter('all'); setVisualContext(null); }} className="mt-4 text-[#00aed9] font-bold underline hover:text-cyan-400">Limpiar Filtros</button>
                                        </>
                                    ) : (
                                        <>
                                            <DatabaseZap size={48} className="text-slate-400 mb-4" />
                                            <h3 className="text-2xl font-black text-slate-700 dark:text-white uppercase tracking-tight">Base de datos vacía</h3>
                                            <p className="text-slate-500 mt-2 max-w-md">No hay autos visibles.</p>
                                            {onMagicFix ? (
                                                <button
                                                    onClick={handleMagicClick}
                                                    disabled={isFixing}
                                                    className="mt-6 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-3 animate-bounce"
                                                >
                                                    {isFixing ? (
                                                        <> <Loader2 className="animate-spin" /> Reparando... </>
                                                    ) : (
                                                        <> <Wrench size={20} /> 🚨 Reparación Automática </>
                                                    )}
                                                </button>
                                            ) : (
                                                <p className="text-slate-500 mb-6 max-w-md">Ve al Admin Panel para configurar.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {displayCars.map((car) => (
                                            <PremiumGlassCard
                                                key={car.id}
                                                car={car}
                                                onSelect={() => {
                                                    setSelectedCar(car);
                                                    logBehavioralEvent({ carId: car.id, action: 'view' });
                                                }}
                                                onCompare={(e) => handleToggleCompare(e, car)}
                                                isComparing={compareList.some(c => c.id === car.id)}
                                                isSaved={savedCarIds.includes(car.id)}
                                                onToggleSave={(e) => toggleSaveCar(e, car.id)}
                                            />
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {!isSearching && hasNextPage && (
                                        <div className="flex justify-center pt-8">
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-600 dark:text-white hover:bg-[#00aed9] hover:text-white hover:border-[#00aed9] transition-all shadow-lg shadow-slate-200/50 dark:shadow-none active:scale-95 flex items-center gap-2 group"
                                            >
                                                {isFetchingNextPage ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <ArrowUpDown className="group-hover:translate-y-1 transition-transform" size={18} />
                                                )}
                                                {isFetchingNextPage ? 'Cargando más...' : 'Cargar Más Vehículos'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <FAQSection />

                    <TestimonialsSection />

                    <SocialFooter />
                </div>
            </div>

            {/* Floating Comparison Bar */}
            {
                compareList.length > 0 && (
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
                )
            }

            {/* Neural Match Modal */}
            {
                isNeuralMatchOpen && (
                    <NeuralMatchModal
                        inventory={inventory}
                        onClose={() => setIsNeuralMatchOpen(false)}
                        onSelectCar={(car) => {
                            setSelectedCar(car);
                            setIsNeuralMatchOpen(false);
                        }}
                    />
                )
            }

            {/* Comparison Modal */}
            {
                isComparisonOpen && (
                    <ComparisonModal
                        cars={compareList}
                        onClose={() => setIsComparisonOpen(false)}
                    />
                )
            }

            {/* Visual Search Modal */}
            {
                isVisualSearchOpen && (
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
                )
            }

            {/* Detail Modal */}
            {
                selectedCar && (
                    <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />
                )
            }

            {/* Chat Widget */}
            <AIChatWidget inventory={inventory} />
        </>
    );
};

export default Storefront;
