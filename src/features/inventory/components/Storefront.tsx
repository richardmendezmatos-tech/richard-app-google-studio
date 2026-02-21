import React, { useState, useContext, Suspense, useMemo } from 'react';
import { Car, CarType } from '@/types/types';
import { Search, Heart, X, Loader2, Sparkles, BrainCircuit, Camera, ArrowUpDown, DatabaseZap, Wrench, DollarSign, Activity, LineChart, ScanSearch } from 'lucide-react';
import CarDetailModal from './CarDetailModal';
import NeuralMatchModal from './NeuralMatchModal';
import ComparisonModal from './ComparisonModal';
import { useVisualSearch } from '../hooks/useVisualSearch';
import { useCars } from '../hooks/useCars';
import { useSavedCars } from '../hooks/useSavedCars';
import { useInventoryAnalytics } from '../hooks/useInventoryAnalytics';
import { AuthContext } from '@/features/auth/context/AuthContextValue';
import { useNavigate, useLocation } from 'react-router-dom';
import { SocialProofWidget } from '@/components/layout/conversion/SocialProofWidget';
import SEO from '../../../components/seo/SEO';
import OptimizedImage from '@/components/common/OptimizedImage';


// Import New Modular Components
import HeroSection from './storefront/HeroSection';
import TrustBar from './storefront/TrustBar';
import TestimonialsSection from './storefront/TestimonialsSection';
import FAQSection from '../../../components/layout/FAQSection';
import SocialFooter from './storefront/SocialFooter';
import VirtualInventory from './VirtualInventory';
import { AuthoritySection } from '../../marketing/components/AuthoritySection';

const VisualSearchModal = React.lazy(() => import('./VisualSearchModal'));



interface Props {
    inventory: Car[];
    initialVisualSearch?: string | null;
    onClearVisualSearch?: () => void;
    onMagicFix?: () => Promise<void>;
    onOpenGarage?: () => void;
}

const Storefront: React.FC<Props> = ({ inventory, onMagicFix, onOpenGarage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<CarType | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
    const [isNeuralMatchOpen, setIsNeuralMatchOpen] = useState(false);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const [visualContext, setVisualContext] = useState<string | null>(null);
    const [semanticResultIds, setSemanticResultIds] = useState<string[]>([]);
    const [compareList, setCompareList] = useState<Car[]>([]);
    const [isFixing, setIsFixing] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Data Hooks
    const analytics = useInventoryAnalytics();
    const savedCars = useSavedCars();

    const handleToggleSave = (e: React.MouseEvent, carId: string) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        savedCars.toggleSave(carId);
    };



    // --- Visual Search Hook ---
    const {
        isAnalyzing,
        error: visualError,
        analyze
    } = useVisualSearch(inventory);

    const handleVisualAnalyze = async (file: File) => {
        const result = await analyze(file);
        if (result && result.analysis) {
            // Update filters based on analysis
            setSearchTerm(result.analysis.brand || '');
            setVisualContext(result.analysis.type ? `Tipo: ${result.analysis.type.toUpperCase()}` : 'Resultados Visuales');

            // Set semantic IDs to filter the list
            if (result.matches.length > 0) {
                setSemanticResultIds(result.matches.map((c: Car) => c.id));
            } else {
                setSemanticResultIds(['NO_MATCHES']); // Dummy ID to show empty state
            }

            setIsVisualSearchOpen(false); // Close modal on success
            return result;
        }
        return null;
    };


    // React Query Hooks
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error
    } = useCars(9, filter, sortOrder);


    // const { currentDealer } = useDealer(); // Unused

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
    const marketPulse = useMemo(() => {
        const source = displayCars.length > 0 ? displayCars : inventory;
        if (!source.length) {
            return { avgPrice: 0, premiumUnits: 0, compactUnits: 0 };
        }

        const totalPrice = source.reduce((acc, car) => acc + (car.price || 0), 0);
        return {
            avgPrice: Math.round(totalPrice / source.length),
            premiumUnits: source.filter((car) => car.price >= 40000).length,
            compactUnits: source.filter((car) => car.price < 25000).length
        };
    }, [displayCars, inventory]);

    // Loading State handling for initial load (server mode only)
    const isLoadingInitial = !isSearching && status === 'pending';



    const handleToggleCompare = (e: React.MouseEvent, car: Car) => {
        e.stopPropagation();
        setCompareList((prev: Car[]) => {
            const isSelected = prev.some((c: Car) => c.id === car.id);
            if (isSelected) {
                return prev.filter((c: Car) => c.id !== car.id);
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

    const openNeuralMatch = (source: string) => {
        analytics.trackInteraction('open_neural_match', { source, route: location.pathname });
        setIsNeuralMatchOpen(true);
    };

    const openVisualSearch = (source: string) => {
        analytics.trackInteraction('open_visual_search', { source, route: location.pathname });
        setIsVisualSearchOpen(true);
    };

    const openAppraisal = (source: string) => {
        analytics.trackInteraction('open_appraisal', { source, route: location.pathname });
        navigate('/appraisal');
    };

    const jumpToInventory = (source: string) => {
        analytics.trackInteraction('jump_inventory', { source, route: location.pathname });
        document.getElementById('inventory-grid')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <div className="h-full w-full bg-transparent">
                <SEO
                    title="Richard Automotive | Compra y Vende en PR"
                    description="El dealer más tecnológico de Puerto Rico. Encuentra autos certificados, financiamiento flexible, y usa nuestra IA para encontrar tu auto ideal."
                    url="/"
                    type="website"
                />

                {/* 1. Hero Section (Full Width) */}
                <HeroSection
                    onNeuralMatch={() => openNeuralMatch('hero')}
                    onBrowseInventory={() => jumpToInventory('hero')}
                    onSellCar={() => openAppraisal('hero')}
                />

                {/* Main Content Container */}
                <main className="relative z-20 mx-auto -mt-14 max-w-[1600px] space-y-14 px-5 pb-28 lg:px-12 lg:pb-10">

                    <section aria-label="Nuestra Confianza" className="reveal-up rounded-[34px] border border-cyan-200/20 bg-[linear-gradient(150deg,rgba(11,26,39,0.9),rgba(7,15,24,0.85))] p-4 shadow-[0_28px_70px_-42px_rgba(0,0,0,0.9)] md:p-8">
                        <TrustBar />
                    </section>

                    <section aria-label="Autoridad y Respaldo">
                        <AuthoritySection />
                    </section>

                    <section aria-label="Pulso del Mercado" className="reveal-up grid gap-4 md:grid-cols-3">
                        <PulseCard
                            icon={<Activity size={18} />}
                            label="Valor en el Mercado"
                            value={`$${marketPulse.avgPrice.toLocaleString('en-US')}`}
                            tone="cyan"
                        />
                        <PulseCard
                            icon={<LineChart size={18} />}
                            label="Selección de Lujo"
                            value={`${marketPulse.premiumUnits} unidades`}
                            tone="slate"
                        />
                        <PulseCard
                            icon={<ScanSearch size={18} />}
                            label="Oportunidades de Compra"
                            value={`${marketPulse.compactUnits} unidades`}
                            tone="emerald"
                        />
                    </section>

                    {/* Search & Filters & Sort */}
                    <section id="inventory-grid" aria-labelledby="inventory-heading" className="scroll-mt-32">
                        <div className="sticky top-2 z-30 rounded-[1.8rem] border border-cyan-100/20 bg-[linear-gradient(150deg,rgba(7,18,30,0.94),rgba(5,13,22,0.9))] px-4 py-4 shadow-[0_30px_80px_-44px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-300 sm:rounded-[2.2rem] sm:py-5 md:top-4 md:px-6">
                            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-cyan-200">Inventario Inteligente</p>
                                <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-slate-300">{displayCars.length} unidades visibles</p>
                            </div>
                            <div className="flex flex-col items-center gap-5 lg:flex-row">

                                {/* Search Bar */}
                                <div className="group relative w-full flex-1">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#31d2ff]" size={22} />
                                    <input
                                        type="text"
                                        placeholder={visualContext ? `Buscando similares a: ${searchTerm}...` : "Buscar modelo, año o características..."}
                                        className="w-full rounded-2xl border border-white/10 bg-[#06111c]/95 py-4 pl-14 pr-28 text-base font-semibold text-white outline-none placeholder:text-slate-500 transition-all duration-300 focus:border-cyan-300/40 focus:shadow-[0_0_0_4px_rgba(49,210,255,0.12)]"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setVisualContext(null); setSemanticResultIds([]); }}
                                    />

                                    <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 gap-2">
                                        <button
                                            onClick={() => openNeuralMatch('search_bar')}
                                            className="btn-glow hidden items-center gap-2 rounded-xl border border-cyan-200/20 bg-slate-800/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200 transition-all hover:border-cyan-300/40 hover:bg-[#00aed9] hover:text-white md:flex"
                                            title="Encuentra tu auto ideal por estilo de vida"
                                        >
                                            <BrainCircuit size={16} /> Neural Match
                                        </button>
                                        <button
                                            onClick={() => openVisualSearch('search_bar')}
                                            className="btn-glow rounded-xl bg-slate-800/90 p-3 text-cyan-200 transition-all hover:bg-[#00aed9] hover:text-white"
                                            title="Búsqueda Visual por IA"
                                        >
                                            <Camera size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Filters & Sorting */}
                                <div className="scrollbar-hide flex w-full items-center gap-3 overflow-x-auto pb-1 lg:w-auto lg:pb-0">
                                    {/* Car Type Filter */}
                                    <div className="flex gap-2 rounded-full border border-white/10 bg-[#071524] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                                        {['all', 'suv', 'sedan', 'pickup'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilter(type as CarType | 'all')}
                                                className={`px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${filter === type
                                                    ? 'bg-[#00aed9] text-white shadow-lg shadow-cyan-500/20'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                                    }`}
                                            >
                                                {type === 'all' ? 'Todos' : type}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Price Sorting */}
                                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#071524] p-1.5">
                                        <button
                                            onClick={() => setSortOrder(prev => prev === 'asc' ? null : 'asc')}
                                            className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all ${sortOrder === 'asc' ? 'bg-[#00aed9] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }`}
                                            title="Menor Precio"
                                        >
                                            <ArrowUpDown size={14} className="rotate-180" /> <span className="hidden sm:inline">$-$$$</span>
                                        </button>
                                        <button
                                            onClick={() => setSortOrder(prev => prev === 'desc' ? null : 'desc')}
                                            className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all ${sortOrder === 'desc' ? 'bg-[#00aed9] text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
                        <div className="mb-7 mt-6 flex flex-wrap items-end justify-between gap-3 px-2 sm:mt-8">
                            <div>
                                <h2 id="inventory-heading" className="font-cinematic text-4xl leading-none tracking-[0.08em] text-cyan-100">
                                    {displayCars.length} {isSearching ? 'Resultados' : 'Vehículos'}
                                </h2>
                                <p className="font-tech mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">Selección activa para Puerto Rico</p>
                                {savedCars.savedIds.length > 0 && (
                                    <button
                                        onClick={() => onOpenGarage && onOpenGarage()}
                                        className="mt-2 flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300 hover:text-cyan-200"
                                    >
                                        <Heart size={14} fill="currentColor" /> Ver Mi Garaje Digital ({savedCars.savedIds.length})
                                    </button>
                                )}

                            </div>
                            {visualContext && (
                                <div className="flex items-center gap-3 rounded-r-xl border-l-4 border-[#00aed9] bg-gradient-to-r from-[#00aed9]/15 to-transparent p-3">
                                    <Sparkles size={16} className="text-[#00aed9]" />
                                    <p className="text-xs text-slate-300">
                                        <span className="font-bold text-[#00aed9]">IA:</span> Resultados visuales activos.
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
                                        <div key={i} className="h-[400px] animate-pulse rounded-[40px] border border-cyan-200/15 bg-slate-900/80" />
                                    ))}
                                </div>
                            ) : displayCars.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-cyan-300/20 bg-[#081726]/85 py-20 text-center animate-in fade-in">
                                    {isSearching ? (
                                        <>
                                            <p className="font-cinematic text-4xl tracking-[0.06em] text-slate-100">Sin Resultados</p>
                                            <p className="mt-2 max-w-md text-sm text-slate-400">Prueba cambiar el tipo, limpiar la búsqueda visual o explorar todos los segmentos.</p>
                                            <button onClick={() => { setSearchTerm(''); setFilter('all'); setVisualContext(null); }} className="mt-5 rounded-full border border-cyan-200/30 px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-200/10">Limpiar Filtros</button>
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

                                            {/* Debugging / Error Message */}
                                            {(status === 'error' || displayCars.length === 0) && (
                                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-left max-w-lg overflow-auto">
                                                    {status === 'error' && (
                                                        <div className="text-red-500 mb-2">
                                                            <p className="font-bold">Error de Carga:</p>
                                                            {error instanceof Error ? error.message : String(error)}
                                                            {String(error).includes('requires an index') && (
                                                                <p className="mt-2 text-xs">
                                                                    💡 Tip: Falta un índice en Firebase. Revisa la consola o despliega los índices.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="text-slate-500">
                                                        <p><strong>Debug Info:</strong></p>
                                                        <p>Filter: {filter}</p>
                                                        <p>Sort: {sortOrder || 'default'}</p>
                                                        <p>Dealer ID used: {(() => {
                                                            const raw = typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null;
                                                            if (!raw || raw === 'undefined' || raw === 'null') return 'richard-automotive (Default)';
                                                            return raw;
                                                        })()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <VirtualInventory
                                        cars={displayCars as Car[]}
                                        onSelectCar={(car) => {
                                            setSelectedCar(car);
                                            analytics.trackCarView(car.id);
                                        }}
                                        onCompare={handleToggleCompare}
                                        isComparing={(id) => compareList.some((c: Car) => c.id === id)}
                                        isSaved={(id) => savedCars.isSaved(id)}
                                        onToggleSave={handleToggleSave}
                                    />

                                    {/* Load More Button */}
                                    {!isSearching && hasNextPage && (
                                        <div className="flex justify-center pt-8">
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="group flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#081a29] px-8 py-4 font-bold text-cyan-100 shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:border-[#00aed9] hover:bg-[#00aed9] hover:text-white active:scale-95"
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
                    </section>

                </main>

                <section aria-label="Preguntas Frecuentes" className="reveal-up content-auto">
                    <FAQSection />
                </section>

                <section aria-label="Testimonios" className="reveal-up content-auto">
                    <TestimonialsSection />
                </section>

                <footer aria-label="Pie de página social" className="reveal-up content-auto">
                    <SocialFooter />
                </footer>
            </div >

            {/* Mobile Quick Actions */}
            <div className="pointer-events-none fixed left-0 right-0 z-40 px-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
                <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-3 gap-2 rounded-2xl border border-cyan-100/20 bg-[rgba(5,12,20,0.9)] p-2 shadow-[0_20px_44px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
                    <button
                        onClick={() => openNeuralMatch('mobile_quick_actions')}
                        className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[#0e2a42] text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100"
                    >
                        <BrainCircuit size={14} /> Match
                    </button>
                    <button
                        onClick={() => openVisualSearch('mobile_quick_actions')}
                        className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[#0b2235] text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100"
                    >
                        <Camera size={14} /> Visual
                    </button>
                    <button
                        onClick={() => openAppraisal('mobile_quick_actions')}
                        className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-emerald-900/60 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100"
                    >
                        <DollarSign size={14} /> Cash
                    </button>
                </div>
            </div>

            {/* Floating Comparison Bar */}
            {
                compareList.length > 0 && (
                    <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-cyan-300/30 bg-[rgba(7,17,27,0.92)] py-2 pl-2 pr-6 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 lg:bottom-12">
                        <div className="flex -space-x-3">
                            {compareList.map((c: Car) => (
                                <div key={c.id} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#0b1c2a] bg-white">
                                    <OptimizedImage src={c.img} alt={c.name} className="w-full h-full object-cover" width={40} />
                                </div>
                            ))}

                            {compareList.length < 2 && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/10 text-xs font-bold">
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
                                className="ml-2 rounded-full bg-[#00aed9] px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(0,174,217,0.5)] transition-all hover:bg-cyan-400"
                            >
                                Iniciar
                            </button>
                        )}
                        <div className="w-px h-6 bg-white/20 mx-1"></div>
                        <button onClick={() => setCompareList([])} aria-label="Limpiar comparativa" className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
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
            {isVisualSearchOpen && (
                <Suspense fallback={null}>
                    <VisualSearchModal
                        isOpen={isVisualSearchOpen}
                        onClose={() => setIsVisualSearchOpen(false)}
                        onAnalyze={handleVisualAnalyze}
                        isAnalyzing={isAnalyzing}
                        error={visualError}
                    />
                </Suspense>
            )}

            {/* Detail Modal */}
            {
                selectedCar && (
                    <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />
                )
            }

            {/* Social Proof Widget */}
            <SocialProofWidget />
        </>
    );
};

const PulseCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'cyan' | 'slate' | 'emerald' }) => {
    const toneStyles = {
        cyan: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100',
        slate: 'border-slate-300/20 bg-slate-500/10 text-slate-100',
        emerald: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100'
    };

    return (
        <div className={`rounded-3xl border p-5 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.95)] ${toneStyles[tone]}`}>
            <div className="mb-3 inline-flex rounded-xl border border-white/20 bg-black/20 p-2.5">
                {icon}
            </div>
            <p className="font-tech text-[10px] uppercase tracking-[0.2em] opacity-90">{label}</p>
            <p className="mt-2 font-cinematic text-3xl tracking-[0.06em]">{value}</p>
        </div>
    );
};

export default Storefront;
