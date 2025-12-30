
import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import { getCookie, setCookie } from '../services/cookieService';
import { analyzeGarageSelection } from '../services/geminiService';
import { ArrowLeft, Trash2, Calendar, MapPin, CheckCircle2, Loader2, Sparkles, TrendingUp, Car as CarIcon, DollarSign } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface Props {
    inventory: Car[];
    onExit: () => void;
}

const DigitalGarage: React.FC<Props> = ({ inventory, onExit }) => {
    const [savedCars, setSavedCars] = useState<Car[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const { addNotification } = useNotification();

    useEffect(() => {
        const savedIds = JSON.parse(getCookie('richard_saved_cars') || '[]');
        const cars = inventory.filter(c => savedIds.includes(c.id));
        setSavedCars(cars);

        if (cars.length > 0) {
            runAnalysis(cars);
        }
    }, [inventory]);

    const runAnalysis = async (cars: Car[]) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeGarageSelection(cars);
            setAiAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const removeCar = (id: string) => {
        const updatedCars = savedCars.filter(c => c.id !== id);
        setSavedCars(updatedCars);
        const updatedIds = updatedCars.map(c => c.id);
        setCookie('richard_saved_cars', JSON.stringify(updatedIds), 30);
        
        if (updatedCars.length > 0) {
             // Re-run analysis quietly
             analyzeGarageSelection(updatedCars).then(setAiAnalysis);
        } else {
            setAiAnalysis('');
        }
        addNotification('info', 'Vehículo eliminado del garaje.');
    };

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();
        setShowBooking(false);
        addNotification('success', '¡Cita confirmada! Te esperamos en el showroom.');
        // En una app real, esto enviaría datos al backend
    };

    return (
        <div className="min-h-screen bg-[#0d2232] text-white relative overflow-hidden flex flex-col">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00aed9]/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="p-8 border-b border-white/10 flex items-center justify-between relative z-10 bg-[#0d2232]/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Mi Garaje <span className="text-[#00aed9]">Digital</span></h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gestión de Flota Personal</p>
                    </div>
                </div>
                {savedCars.length > 0 && (
                    <button 
                        onClick={() => setShowBooking(true)}
                        className="px-6 py-3 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,174,217,0.4)] transition-all flex items-center gap-2 animate-pulse"
                    >
                        <Calendar size={16} /> Agendar Test Drive
                    </button>
                )}
            </header>

            <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
                {savedCars.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
                        <CarIcon size={64} className="text-slate-600" />
                        <h2 className="text-2xl font-bold text-slate-400">Tu garaje está vacío</h2>
                        <p className="max-w-md text-slate-500">Explora la tienda y dale "Me Gusta" a los autos para añadirlos a tu colección personal.</p>
                        <button onClick={onExit} className="text-[#00aed9] font-bold underline">Ir a la Tienda</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-[1800px] mx-auto">
                        
                        {/* Car List Column */}
                        <div className="xl:col-span-2 space-y-6">
                            {savedCars.map(car => (
                                <div key={car.id} className="group relative bg-slate-800/50 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-800 hover:border-[#00aed9]/30 transition-all duration-300">
                                    <div className="w-full md:w-64 h-40 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img src={car.img} alt={car.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[10px] font-bold text-[#00aed9] uppercase tracking-widest mb-1">{car.type}</div>
                                                <h3 className="text-2xl font-black text-white mb-2">{car.name}</h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> Disponible</span>
                                                    <span>•</span>
                                                    <span>Stock ID: {car.id.slice(0, 6)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">${car.price.toLocaleString()}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Precio Final</div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center gap-4 pt-4 border-t border-white/5">
                                             <div className="flex-1 grid grid-cols-3 gap-2">
                                                 <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                                                     <div className="text-[10px] text-slate-500 uppercase">Motor</div>
                                                     <div className="font-bold text-xs">2.5L Turbo</div>
                                                 </div>
                                                 <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                                                     <div className="text-[10px] text-slate-500 uppercase">0-60</div>
                                                     <div className="font-bold text-xs">5.8s</div>
                                                 </div>
                                                 <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                                                     <div className="text-[10px] text-slate-500 uppercase">Garantía</div>
                                                     <div className="font-bold text-xs">10 Años</div>
                                                 </div>
                                             </div>
                                             <button 
                                                onClick={() => removeCar(car.id)}
                                                className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-colors"
                                                title="Eliminar"
                                             >
                                                 <Trash2 size={18} />
                                             </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Analysis & Stats Column */}
                        <div className="space-y-6">
                            
                            {/* AI Financial Advisor */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <TrendingUp size={120} />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-[#00aed9]/20 rounded-full flex items-center justify-center">
                                        <Sparkles size={20} className="text-[#00aed9]" />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-wide">Richard Financial AI</h3>
                                </div>

                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                        <Loader2 size={32} className="text-[#00aed9] animate-spin" />
                                        <p className="text-xs font-bold uppercase tracking-widest animate-pulse text-slate-400">Analizando portafolio...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-sm">
                                        <div dangerouslySetInnerHTML={{ __html: aiAnalysis }} />
                                    </div>
                                )}
                            </div>

                            {/* Summary Card */}
                            <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Resumen de Valor</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-300">Valor Total Flota</span>
                                        <span className="font-bold text-white">${savedCars.reduce((a,c) => a + c.price, 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-300">Pago Mensual Est. (Total)</span>
                                        <span className="font-bold text-[#00aed9]">${Math.round(savedCars.reduce((a,c) => a + c.price, 0) / 72).toLocaleString()}/mes</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-slate-400 text-xs">Tasa Preferencial</span>
                                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">Aplicada 5.9%</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                )}
            </main>
            
            {/* Booking Modal */}
            {showBooking && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-8 relative overflow-hidden">
                        <button onClick={() => setShowBooking(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Agenda tu Visita</h3>
                            <p className="text-slate-500 text-sm">Preparamos tus autos favoritos para que los pruebes.</p>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Fecha</label>
                                <input 
                                    type="date" 
                                    required
                                    value={bookingDate}
                                    onChange={e => setBookingDate(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#00aed9]" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Hora</label>
                                <select 
                                    required
                                    value={bookingTime}
                                    onChange={e => setBookingTime(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-[#00aed9]"
                                >
                                    <option value="">Selecciona hora</option>
                                    <option value="09:00">09:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                </select>
                            </div>
                            
                            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                                <MapPin className="text-blue-500 shrink-0" size={20} />
                                <div className="text-xs text-blue-800">
                                    <strong className="block mb-1">Showroom Principal</strong>
                                    Av. Kennedy, San Juan, PR 00920
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-[#173d57] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#00aed9] transition-colors shadow-lg mt-4">
                                Confirmar Cita
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

// Simple X icon for internal usage
const X = ({size, className, onClick}: any) => (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{cursor: 'pointer'}}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


export default DigitalGarage;
