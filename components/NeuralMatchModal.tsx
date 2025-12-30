
import React, { useState, useEffect, useRef } from 'react';
import { Car } from '../types';
import { calculateNeuralMatch } from '../services/geminiService';
import { X, BrainCircuit, ScanLine, CheckCircle2, AlertCircle, ChevronRight, Fingerprint, Sparkles, Car as CarIcon, Baby, Mountain, Gauge, Wallet, Briefcase, Leaf, Mic, MicOff, User } from 'lucide-react';

interface Props {
  inventory: Car[];
  onClose: () => void;
  onSelectCar: (car: Car) => void;
}

interface MatchResult {
  carId: string;
  score: number;
  reason: string;
}

const LIFESTYLE_TAGS = [
    { id: 'family', label: 'Familia & Seguridad', icon: <Baby size={14} />, text: 'Priorizo la seguridad y el espacio para mi familia.' },
    { id: 'adventure', label: 'Aventura & Off-road', icon: <Mountain size={14} />, text: 'Me gusta salir de la carretera y necesito capacidad todoterreno.' },
    { id: 'performance', label: 'Velocidad & Sport', icon: <Gauge size={14} />, text: 'Busco alto rendimiento, aceleración y manejo deportivo.' },
    { id: 'commute', label: 'Uso Diario', icon: <CarIcon size={14} />, text: 'Necesito algo eficiente y cómodo para el tráfico diario.' },
    { id: 'budget', label: 'Económico', icon: <Wallet size={14} />, text: 'Mi prioridad es el ahorro de combustible y bajo costo de mantenimiento.' },
    { id: 'luxury', label: 'Lujo & Tech', icon: <Briefcase size={14} />, text: 'Quiero la mejor tecnología, confort premium y estatus.' },
    { id: 'eco', label: 'Eco-Friendly', icon: <Leaf size={14} />, text: 'Me interesa reducir mi huella de carbono (Híbrido/Eléctrico).' },
];

const SCAN_MESSAGES = [
    "Extrayendo variables de estilo de vida...",
    "Analizando patrones de conducción...",
    "Consultando base de datos global...",
    "Calculando probabilidades de compatibilidad...",
    "Generando perfil psicográfico..."
];

const NeuralMatchModal: React.FC<Props> = ({ inventory, onClose, onSelectCar }) => {
  const [profile, setProfile] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [userPersona, setUserPersona] = useState<string>('');
  const [step, setStep] = useState<'input' | 'scanning' | 'results'>('input');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'es-ES';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setProfile(prev => (prev ? prev + ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
        recognitionRef.current.stop();
    } else {
        setIsListening(true);
        recognitionRef.current.start();
    }
  };

  // Scanning Text Animation
  useEffect(() => {
    let interval: number;
    if (step === 'scanning') {
        setScanMessageIndex(0);
        interval = window.setInterval(() => {
            setScanMessageIndex(prev => (prev + 1) % SCAN_MESSAGES.length);
        }, 1200);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleTagToggle = (tagId: string, tagText: string) => {
    if (activeTags.includes(tagId)) {
        setActiveTags(prev => prev.filter(t => t !== tagId));
        setProfile(prev => prev.replace(tagText + ' ', '').replace(tagText, '').trim());
    } else {
        setActiveTags(prev => [...prev, tagId]);
        setProfile(prev => (prev ? prev + ' ' : '') + tagText);
    }
  };

  const handleScan = async () => {
    if (!profile.trim()) return;
    
    setStep('scanning');
    setIsAnalyzing(true);
    
    try {
        const [data] = await Promise.all([
            calculateNeuralMatch(profile, inventory),
            new Promise(resolve => setTimeout(resolve, 3500)) // Artificial delay for effect
        ]);
        
        setResults(data.matches);
        setUserPersona(data.persona);
    } catch (error) {
        console.error("Scan failed", error);
        setResults([]);
    } finally {
        setIsAnalyzing(false);
        setStep('results');
    }
  };

  const getCarById = (id: string) => inventory.find(c => c.id === id);

  // Simple logic to determine prompt strength
  const promptStrength = Math.min(100, (profile.length / 100) * 100);
  const strengthColor = promptStrength < 30 ? 'bg-red-500' : promptStrength < 70 ? 'bg-yellow-500' : 'bg-[#00aed9]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d2232]/95 backdrop-blur-xl animate-in fade-in">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Background Tech Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00aed9] to-transparent opacity-50"></div>

            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-20 text-slate-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
                
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center gap-4 shrink-0">
                    <div className="w-12 h-12 bg-[#00aed9]/20 rounded-xl flex items-center justify-center border border-[#00aed9]/50 shadow-[0_0_20px_rgba(0,174,217,0.3)]">
                        <BrainCircuit size={24} className="text-[#00aed9]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Neural Match <span className="text-[#00aed9]">v4.0</span></h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Identidad Digital & Compatibilidad</p>
                    </div>
                </div>

                {/* Body Content based on Step */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    
                    {step === 'input' && (
                        <div className="h-full flex flex-col max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-5 duration-300 pb-4">
                            
                            <div className="text-center mb-4">
                                <h3 className="text-3xl font-bold text-white mb-2">Háblame de tu estilo de vida.</h3>
                                <p className="text-slate-400 text-sm">
                                    Nuestra IA analizará tu perfil psicológico y encontrará el vehículo matemáticamente perfecto.
                                </p>
                            </div>

                            {/* Lifestyle Tags */}
                            <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {LIFESTYLE_TAGS.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagToggle(tag.id, tag.text)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border transition-all duration-200
                                            ${activeTags.includes(tag.id) 
                                                ? 'bg-[#00aed9] text-white border-[#00aed9] shadow-lg shadow-cyan-500/30' 
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'}
                                        `}
                                    >
                                        {tag.icon} {tag.label}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Text Input Area */}
                            <div className="w-full relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 rounded-t-3xl overflow-hidden">
                                     <div className={`h-full ${strengthColor} transition-all duration-500`} style={{ width: `${promptStrength}%` }}></div>
                                </div>
                                <textarea
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value)}
                                    placeholder="Escribe o usa el micrófono: 'Busco algo seguro para mi familia, que tenga espacio para las bicicletas y que no gaste mucha gasolina...'"
                                    className="w-full bg-slate-800/80 border-2 border-slate-700 rounded-3xl p-6 text-white placeholder:text-slate-600 focus:border-[#00aed9] focus:bg-slate-800 outline-none text-lg leading-relaxed resize-none min-h-[200px] transition-all shadow-inner relative z-10"
                                />
                                <div className="absolute top-4 right-4 z-20">
                                    <button 
                                        onClick={toggleListening}
                                        className={`
                                            p-3 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg
                                            ${isListening 
                                                ? 'bg-red-500 text-white animate-pulse shadow-red-500/40' 
                                                : 'bg-slate-700 text-slate-300 hover:bg-[#00aed9] hover:text-white'}
                                        `}
                                        title="Dictado por Voz"
                                    >
                                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2">
                                     <span className={`text-[10px] font-bold uppercase tracking-widest ${promptStrength > 50 ? 'text-[#00aed9]' : 'text-slate-500'}`}>
                                        {isListening ? 'Escuchando...' : promptStrength > 80 ? 'Excelente Detalle' : promptStrength > 40 ? 'Buen Comienzo' : 'Agrega más detalles'}
                                     </span>
                                     <span className="text-[10px] text-slate-600 font-mono">{profile.length} chars</span>
                                </div>
                            </div>

                            {/* Big Action Button */}
                            <div className="w-full mt-4 flex justify-center relative z-20 group pb-8">
                                {/* Glow effect behind */}
                                <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl blur-lg opacity-40 transition-opacity duration-500 ${profile.trim() ? 'opacity-80 animate-pulse' : ''}`}></div>
                                
                                <button 
                                    onClick={handleScan}
                                    disabled={!profile.trim()}
                                    className={`
                                        relative w-full py-6 px-8
                                        bg-gradient-to-r from-[#00aed9] via-cyan-500 to-blue-600 
                                        hover:from-cyan-400 hover:via-cyan-300 hover:to-blue-500
                                        text-white text-xl md:text-2xl font-black uppercase tracking-[0.15em]
                                        rounded-2xl border-2 border-white/30 hover:border-white
                                        shadow-[0_10px_40px_-10px_rgba(0,174,217,0.5)]
                                        transform hover:scale-[1.02] active:scale-95 transition-all duration-300
                                        flex items-center justify-center gap-6
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-none
                                    `}
                                >
                                    <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors shadow-inner">
                                        <ScanLine size={32} strokeWidth={3} className="drop-shadow-sm" /> 
                                    </div>
                                    <span className="drop-shadow-md">Iniciar Escaneo</span>
                                    {profile.trim() && <Sparkles size={32} className="animate-spin-slow text-yellow-300 drop-shadow-md" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'scanning' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-12">
                            <div className="relative">
                                {/* Rings */}
                                <div className="w-48 h-48 border border-slate-700/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                <div className="absolute inset-4 border border-[#00aed9]/30 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                                <div className="absolute inset-8 border-2 border-t-[#00aed9] border-r-transparent border-b-[#00aed9] border-l-transparent rounded-full animate-spin"></div>
                                
                                {/* Center Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-[#00aed9]/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                                        <BrainCircuit size={40} className="text-[#00aed9]" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center space-y-4 max-w-md">
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider animate-pulse">
                                    {SCAN_MESSAGES[scanMessageIndex]}
                                </h3>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00aed9] animate-[translateX_2s_ease-in-out_infinite] w-1/3 rounded-full"></div>
                                </div>
                                <p className="text-slate-500 font-mono text-xs">Procesando {inventory.length} vectores de datos.</p>
                            </div>
                        </div>
                    )}

                    {step === 'results' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 bg-[#173d57]/50 p-6 rounded-3xl border border-[#00aed9]/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#00aed9] rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                        <User size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest">Identidad Detectada</div>
                                        <div className="text-2xl font-black text-white uppercase tracking-tight">{userPersona || "Perfil Estándar"}</div>
                                    </div>
                                </div>
                                <button onClick={() => setStep('input')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-colors">
                                    Nuevo Análisis
                                </button>
                            </div>

                            {results.length === 0 ? (
                                <div className="text-center py-20">
                                    <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
                                    <p className="text-slate-400">No encontramos coincidencias claras para este perfil.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 animate-in slide-in-from-bottom-10 duration-500">
                                    {results.map((result, idx) => {
                                        const car = getCarById(result.carId);
                                        if (!car) return null;
                                        const isTopMatch = idx === 0;

                                        return (
                                            <div 
                                                key={result.carId}
                                                onClick={() => onSelectCar(car)}
                                                className={`
                                                    group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl cursor-pointer transition-all duration-300
                                                    ${isTopMatch 
                                                        ? 'bg-gradient-to-r from-[#00aed9]/20 to-slate-800/80 border border-[#00aed9]/50 shadow-[0_0_30px_rgba(0,174,217,0.15)] transform scale-[1.02]' 
                                                        : 'bg-slate-800/30 border border-slate-700 hover:bg-slate-800/80'}
                                                `}
                                            >
                                                {isTopMatch && (
                                                    <div className="absolute -top-3 -right-3 bg-[#00aed9] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 z-10">
                                                        <CheckCircle2 size={12} /> Match Perfecto
                                                    </div>
                                                )}

                                                <div className="w-full md:w-48 h-32 bg-white/5 rounded-2xl p-2 flex items-center justify-center shrink-0 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <img src={car.img} alt={car.name} className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                                </div>

                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="text-xl font-black text-white group-hover:text-[#00aed9] transition-colors">{car.name}</h4>
                                                            <p className="text-slate-400 text-sm font-bold">${car.price.toLocaleString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-3xl font-black text-white">{result.score}%</div>
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Afinidad</div>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full h-2 bg-slate-700 rounded-full mb-3 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${result.score > 85 ? 'bg-[#00aed9]' : result.score > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                            style={{ width: `${result.score}%` }}
                                                        />
                                                    </div>

                                                    <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-slate-600 pl-3">
                                                        "{result.reason}"
                                                    </p>
                                                </div>
                                                
                                                <div className="hidden md:flex bg-slate-700/50 w-10 h-10 rounded-full items-center justify-center group-hover:bg-[#00aed9] group-hover:text-white transition-colors">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
  );
};

export default NeuralMatchModal;
