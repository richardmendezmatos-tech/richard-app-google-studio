import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, ChevronRight, Loader2 } from 'lucide-react';
import { addLead } from '@/features/leads/services/crmService';

type Step = 'identify' | 'details' | 'condition' | 'result';

interface TradeInFormData {
    year: string;
    make: string;
    model: string;
    mileage: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
}

const TradeInView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('identify');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<TradeInFormData>({
        year: '',
        make: '',
        model: '',
        mileage: '',
        condition: 'good'
    });


    // Mock Data for Selectors
    const years = Array.from({ length: 15 }, (_, i) => (2025 - i).toString());
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi'];
    const models: Record<string, string[]> = {
        'Toyota': ['Corolla', 'Camry', 'RAV4', 'Tacoma'],
        'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
        'Ford': ['F-150', 'Explorer', 'Mustang', 'Escape'],
        'Hyundai': ['Tucson', 'Santa Fe', 'Elantra', 'Sonata'],
        // ... default generic list for others
    };

    const handleInputChange = (field: keyof TradeInFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculateOffer = () => {
        setIsLoading(true);
        // Simulate API call / Alogrithm
        setTimeout(() => {
            setIsLoading(false);
            setStep('result');
            setStep('result');

            // Capture Lead
            addLead({
                type: 'trade-in',
                name: 'Anonymous Visitor',
                phone: 'Not provided',
                notes: `Trade-In: ${formData.year} ${formData.make} ${formData.model} (${formData.mileage} miles) - Condition: ${formData.condition}`
            });
        }, 2000);
    };

    const getEstimatedValue = () => {
        // Simple Mock Algorithm
        // Base value: 35000 - (Age * 2000) - (Mileage/1000 * 0.10) ... very rough
        const age = 2025 - parseInt(formData.year || '2020');
        let base = 35000 - (age * 2500);

        // Adjust for condition
        const conditionFactors = { excellent: 1.1, good: 1.0, fair: 0.85, poor: 0.6 };
        base = base * conditionFactors[formData.condition];

        // Organic feel adjustment without Math.random during render
        // We use year/make lengths as a stable "random" seed
        const seed = (formData.make.length + formData.model.length + parseInt(formData.year || '0')) % 1000;
        const variation = (seed - 500); // Stable variation between -500 and 500
        base = base + variation;

        return Math.max(1500, Math.round(base)); // Min $1500
    };

    const renderStepContent = () => {
        switch (step) {
            case 'identify':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#00aed9]">Año</label>
                                <select
                                    aria-label="Seleccionar Año del Auto"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-[#00aed9] focus:ring-1 focus:ring-[#00aed9] outline-none transition-all"
                                    value={formData.year}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                >
                                    <option value="">Selecciona Año</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#00aed9]">Marca</label>
                                <select
                                    aria-label="Seleccionar Marca de Auto"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-[#00aed9] focus:ring-1 focus:ring-[#00aed9] outline-none transition-all"
                                    value={formData.make}
                                    onChange={(e) => handleInputChange('make', e.target.value)}
                                >
                                    <option value="">Selecciona Marca</option>
                                    {makes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#00aed9]">Modelo</label>
                                <select
                                    aria-label="Seleccionar Modelo de Auto"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-[#00aed9] focus:ring-1 focus:ring-[#00aed9] outline-none transition-all"
                                    value={formData.model}
                                    onChange={(e) => handleInputChange('model', e.target.value)}
                                    disabled={!formData.make}
                                >
                                    <option value="">{formData.make ? 'Selecciona Modelo' : 'Primero selecciona Marca'}</option>
                                    {(models[formData.make] || ['Modelo Base', 'Modelo Sport', 'Modelo Limited']).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <button
                            disabled={!formData.year || !formData.make || !formData.model}
                            onClick={() => setStep('details')}
                            className="w-full py-4 bg-[#00aed9] hover:bg-[#009ac0] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                            Siguiente Paso <ChevronRight size={18} />
                        </button>
                    </div>
                );
            case 'details':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#00aed9]">Kilometraje (Millas)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-[#00aed9] focus:ring-1 focus:ring-[#00aed9] outline-none transition-all"
                                placeholder="Ej. 45000"
                                value={formData.mileage}
                                onChange={(e) => handleInputChange('mileage', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep('identify')} className="w-full py-4 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors">Atrás</button>
                            <button
                                disabled={!formData.mileage}
                                onClick={() => setStep('condition')}
                                className="w-full py-4 bg-[#00aed9] hover:bg-[#009ac0] disabled:opacity-50 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
                            >
                                Siguiente <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                );
            case 'condition':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'excellent', label: 'Excelente', desc: 'Como nuevo, sin defectos mecánicos ni cosméticos.' },
                                { id: 'good', label: 'Bueno', desc: 'Desgaste normal, mantenimiento al día.' },
                                { id: 'fair', label: 'Regular', desc: 'Necesita algunas reparaciones menores o cosméticas.' },
                                { id: 'poor', label: 'Malo', desc: 'Daños significativos o problemas mecánicos.' }
                            ].map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => handleInputChange('condition', c.id as any)}
                                    className={`p-6 rounded-xl border text-left transition-all ${formData.condition === c.id ? 'bg-[#00aed9]/10 border-[#00aed9] ring-1 ring-[#00aed9]' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
                                >
                                    <h4 className={`text-lg font-bold ${formData.condition === c.id ? 'text-[#00aed9]' : 'text-white'}`}>{c.label}</h4>
                                    <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep('details')} className="w-full py-4 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors">Atrás</button>
                            <button
                                onClick={calculateOffer}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Ver mi Oferta'}
                            </button>
                        </div>
                    </div>
                );
            case 'result': {
                const offerValue = getEstimatedValue();
                return (
                    <div className="text-center animate-in zoom-in duration-500 space-y-8 py-8">
                        <div>
                            <p className="text-slate-400 font-bold text-lg mb-2">Tu {formData.year} {formData.make} {formData.model} vale aproximadamente:</p>
                            <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] to-emerald-400 tracking-tighter">
                                ${offerValue.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 mt-4">* Esta oferta es una estimación preliminar y está sujeta a inspección física.</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-center max-w-md mx-auto">
                            <button onClick={() => { }} className="flex-1 py-4 bg-[#00aed9] hover:bg-[#009ac0] text-slate-900 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
                                Aplicar a Compra
                            </button>
                            <button onClick={() => navigate('/')} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                                Buscar Otro Auto
                            </button>
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#00aed9]/10 to-transparent pointer-events-none" />

            <header className="p-6 relative z-10">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
                    <ArrowLeft size={16} /> Volver a la Tienda
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-3xl mx-auto">
                {step !== 'result' && (
                    <div className="mb-12 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00aed9]/10 text-[#00aed9] mb-4">
                            <Car size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            Vende Tu Auto <span className="text-[#00aed9]">Al Instante</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto">
                            Obtén una oferta competitiva en minutos. Sin regateos, sin complicaciones.
                        </p>
                        {/* Progress Bar */}
                        <div className="flex justify-center gap-2 mt-8">
                            {['identify', 'details', 'condition'].map((s, i) => (
                                <div key={s} className={`h-1 w-12 rounded-full transition-all duration-300 ${['identify', 'details', 'condition'].indexOf(step) >= i ? 'bg-[#00aed9]' : 'bg-slate-800'}`} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                    {renderStepContent()}
                </div>
            </main>
        </div>
    );
};

export default TradeInView;
