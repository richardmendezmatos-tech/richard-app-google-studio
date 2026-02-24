
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Car } from '@/types/types';
import { ChevronLeft, Share2, Sparkles, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { generateCarPitch } from '@/services/geminiService';
import { useDealer } from '@/contexts/DealerContext';
import { logIntentSignal } from '@/services/moatTrackingService';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';
import DealBuilder from '@/features/inventory/components/deal/DealBuilder';
import SEO from '@/components/seo/SEO';
import { SITE_CONFIG } from '@/constants/siteConfig';
import Viewer360 from '@/features/inventory/components/common/Viewer360';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { ProgressRing } from '@/components/common/ProgressRing';

interface Props {
    inventory: Car[];
}

const VehicleDetail: React.FC<Props> = ({ inventory }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentDealer } = useDealer();
    const [engagedTime, setEngagedTime] = useState(0);
    const { trackEvent } = useMetaPixel();
    const analytics = useInventoryAnalytics();

    const car = inventory.find(c => c.id === id);

    useEffect(() => {
        if (car) {
            analytics.trackCarViewIncremental(car.id);
            // Growth: Track Meta ViewContent
            trackEvent('ViewContent', {
                content_ids: [car.id],
                content_type: 'vehicle',
                content_name: car.name,
                value: car.price,
                currency: 'USD'
            });
        }
    }, [car, analytics, trackEvent]);


    // Moat: Track engaged time on vehicle
    useEffect(() => {
        if (!car) return;
        const timer = setInterval(() => setEngagedTime(prev => prev + 1), 5000);
        return () => {
            if (engagedTime > 0) {
                logIntentSignal({
                    carId: id || 'unknown',
                    dealerId: currentDealer.id,
                    eventType: 'engaged_time',
                    value: engagedTime,
                    sessionId: sessionStorage.getItem('session_id') || 'anon'
                });
            }
            clearInterval(timer);
        };
    }, [engagedTime, car, id, currentDealer.id]);

    const handleGalleryOpen = () => {
        logIntentSignal({
            carId: id || 'unknown',
            dealerId: currentDealer.id,
            eventType: 'gallery_open',
            sessionId: sessionStorage.getItem('session_id') || 'anon'
        });
    };

    // Generate AI Pitch on load
    const { data: aiPitchData, isLoading: loadingPitch } = useQuery({
        queryKey: ['carPitch', car?.id],
        queryFn: async () => {
            if (!car) throw new Error("No vehicle found");
            return await generateCarPitch(car);
        },
        enabled: !!car,
        staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours to prevent unnecessary Gemini API calls
    });
    const aiPitch = aiPitchData || null;

    // Helper to parse vehicle details if structured data is missing
    const { year, make, model } = React.useMemo(() => {
        if (!car) return { year: 2026, make: 'Auto', model: 'Auto' };
        const parts = car.name.split(' ');
        const parsedYear = car.year || parseInt(parts[0]) || 2026;
        const parsedMake = parts[1] || 'Auto';
        const parsedModel = parts.slice(2).join(' ') || car.name;
        return { year: parsedYear, make: parsedMake, model: parsedModel };
    }, [car]);
    const siteUrl = SITE_CONFIG.url;

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 text-[#00aed9] animate-spin" />
            </div>
        );
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: car.name,
                    text: `Mira este ${car.name} en Richard Automotive`,
                    url: window.location.href
                });
            } catch { /* Share cancelled */ }

        } else {
            alert('Enlace copiado al portapapeles');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-20 lg:pt-0">
            <SEO
                title={car.name}
                description={`Compra este ${car.name} ${year} por $${car.price.toLocaleString()}. Financiamiento disponible, garantía incluida y entrega rápida en Puerto Rico.`}
                image={car.img}
                url={`/vehicle/${car.id}`}
                type="product"
                schema={[
                    {
                        "@context": "https://schema.org/",
                        "@type": "Car",
                        "name": car.name,
                        "image": car.images && car.images.length > 0 ? car.images : [car.img],
                        "description": car.description || `Compra este ${car.name} ${year} en Richard Automotive.`,
                        "brand": {
                            "@type": "Brand",
                            "name": make
                        },
                        "model": model,
                        "productionDate": year.toString(),
                        "modelDate": year.toString(),
                        "bodyType": car.type,
                        "vehicleConfiguration": car.features?.join(', '),
                        "offers": {
                            "@type": "Offer",
                            "url": `${siteUrl}/vehicle/${car.id}`,
                            "priceCurrency": "USD",
                            "price": car.price,
                            "itemCondition": "https://schema.org/UsedCondition",
                            "availability": "https://schema.org/InStock",
                            "seller": {
                                "@type": "AutoDealer",
                                "name": "Richard Automotive"
                            }
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Inicio",
                                "item": `${siteUrl}/`
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Inventario",
                                "item": `${siteUrl}/`
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": car.name,
                                "item": `${siteUrl}/vehicle/${car.id}`
                            }
                        ]
                    }
                ]}
            />
            {/* VehicleSchema removed to avoid duplicate JSON-LD injection */}

            {/* Navigation Bar (Mobile) / Breadcrumb */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 z-40 flex justify-between items-center lg:hidden border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} aria-label="Volver atrás" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="text-slate-800 dark:text-white" />
                </button>
                <span className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[200px]">{car.name}</span>
                <button onClick={handleShare} aria-label="Compartir vehículo" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="text-slate-800 dark:text-white" size={20} />
                </button>
            </div>

            {/* Desktop Back Button */}
            <div className="hidden lg:block max-w-7xl mx-auto px-8 py-6">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-[#00aed9] font-bold transition-colors">
                    <ChevronLeft size={20} /> Volver al Inventario
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Media Gallery */}
                <div className="space-y-6">
                    {/* 360 Viewer Integration */}
                    <div className="relative z-10">
                        <Viewer360
                            images={car.images && car.images.length > 0 ? car.images : [car.img]}
                            alt={car.name}
                            badge={car.badge}
                            carPrice={car.price}
                            carType={car.type}
                            onFullscreen={handleGalleryOpen}
                        />
                    </div>

                    {/* AI Insight Card */}
                    <div className="bg-[#00aed9]/5 border border-[#00aed9]/20 rounded-[30px] p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-[#00aed9]" />
                            <h3 className="font-black text-[#173d57] dark:text-cyan-400 uppercase tracking-widest text-sm">Richard's AI Insight</h3>
                        </div>
                        {loadingPitch ? (
                            <div className="h-20 flex items-center justify-center text-[#00aed9] animate-pulse font-bold text-sm uppercase tracking-widest">
                                Analizando auto...
                            </div>
                        ) : (
                            <div
                                className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: (aiPitch || '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00aed9]">$1</strong>').replace(/\n/g, '<br/>') }}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Details & Finance */}
                <div className="space-y-8">

                    {/* Header */}
                    <div>
                        <span className="text-[#00aed9] font-black uppercase tracking-[0.2em] text-xs">{car.type} • 2025</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mt-2 leading-none">{car.name}</h1>
                        <div className="mt-4 flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">${car.price.toLocaleString()}</span>
                            <span className="text-sm text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full">Precio Online</span>
                        </div>
                    </div>

                    {/* Trust Badges Simple */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <ShieldCheck size={16} className="text-emerald-500" /> Garantía Incluida
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <Zap size={16} className="text-amber-500" /> Entrega Rápida
                        </div>
                    </div>

                    {/* Potencia & Desempeño (Recommendation #3) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[40px] p-6 shadow-xl">
                        <h3 className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.3em] mb-4 ml-2">Potencia y Desempeño</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <ProgressRing
                                label="Caballos (HP)"
                                value={car.price > 60000 ? 450 : (car.price > 35000 ? 280 : 180)}
                                max={600}
                                size={100}
                                strokeWidth={8}
                            />
                            <ProgressRing
                                label="Eficiencia"
                                value={car.type === 'sedan' ? 92 : (car.type === 'suv' ? 84 : 76)}
                                max={100}
                                size={100}
                                strokeWidth={8}
                                color="#10b981"
                            />
                            <ProgressRing
                                label="Tech Score"
                                value={car.type === 'luxury' ? 98 : (car.price > 40000 ? 90 : 85)}
                                max={100}
                                size={100}
                                strokeWidth={8}
                                color="#f59e0b"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Deal Builder Engine */}
                    <DealBuilder
                        vehicleId={car.id}
                        vehiclePrice={car.price}
                        vehicleName={car.name}
                        vehicleImage={car.img}
                    />

                </div>
            </main>
        </div>
    );
};

export default VehicleDetail;
