import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Camera, Activity, Send, Sparkles, FileUp, ShieldCheck, Image as ImageIcon, Video as VideoIcon, Loader2, UserPlus, Upload, Film } from 'lucide-react';
import { AI_LEGAL_DISCLAIMER } from '../../services/firebaseService';
import FaceTracker from './FaceTracker';
import AvatarScene from './AvatarScene';
import ReadyPlayerMeCreator from './ReadyPlayerMeCreator';

import { getAIResponse, generateImage, generateVideo } from '../../services/geminiService';

// --- ERROR BOUNDARY ---
class SafeComponent extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode, name: string }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(`Error in ${this.props.name}:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="bg-red-900/50 p-4 rounded-lg border border-red-500/50 text-white m-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2 font-bold text-red-400">
                        <Activity className="animate-pulse" />
                        Component Error: {this.props.name}
                    </div>
                    <code className="text-[10px] block bg-black/50 p-2 rounded overflow-auto">
                        {this.state.error?.toString() || 'Unknown Error'}
                    </code>
                </div>
            );
        }
        return this.props.children;
    }
}

const DigitalTwinDashboard = () => {
    const [faceRig, setFaceRig] = useState<any>(null);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [showDebug, setShowDebug] = useState(false); // Default off for cleaner look
    const [showCreator, setShowCreator] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        // Load saved avatar if exists and NOT a blob (blobs expire)
        const saved = localStorage.getItem('richard_avatar_url');
        if (saved && !saved.startsWith('blob:')) {
            setAvatarUrl(saved);
        }
    }, []);

    // ... (rest of render logic depends on these being initialized correctly)
    const [mode, setMode] = useState<'mirror' | 'ai'>('mirror');
    const [aiState, setAiState] = useState({ isSpeaking: false, volume: 0 });
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'docs' | 'media'>('chat');
    const [docs, setDocs] = useState<{ name: string, type: string, status: 'processed' | 'pending' }[]>([]);
    const [mediaPrompt, setMediaPrompt] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
    const [mediaMode, setMediaMode] = useState<'generate' | 'flow'>('generate'); // New state for sub-tabs
    const [generatedMedia, setGeneratedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

    {/* 3D Scene */ }
    <div className="w-full h-full relative group/scene">
        <SafeComponent name="AvatarScene">
            <AvatarScene faceRig={faceRig} aiState={aiState} modelUrl={avatarUrl} />
        </SafeComponent>

    </div>

    // Refs for animation loop
    const speechLoopRef = useRef<number>();

    // Callback from FaceTracker
    const handleFaceUpdate = (rig: any) => {
        if (mode === 'mirror') {
            setFaceRig(rig);
        }
    };

    // --- TTS Logic ---
    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;

        // Cancel any previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-US'; // Spanish 
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setAiState(prev => ({ ...prev, isSpeaking: true }));
            // Start "fake" volume modulation loop
            const animateVolume = () => {
                // Random volume between 0.2 and 0.8 looks natural enough without real audio analysis
                const vol = 0.2 + Math.random() * 0.6;
                setAiState(prev => ({ ...prev, volume: vol }));
                speechLoopRef.current = requestAnimationFrame(animateVolume);
            };
            animateVolume();
        };

        utterance.onend = () => {
            cancelAnimationFrame(speechLoopRef.current!);
            setAiState({ isSpeaking: false, volume: 0 });
        };

        utterance.onerror = () => {
            cancelAnimationFrame(speechLoopRef.current!);
            setAiState({ isSpeaking: false, volume: 0 });
        }

        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsThinking(true);

        try {
            // Get response from Gemini
            // Pass empty inventory for now as this is a dashboard demo, or we could fetch it.
            // Assuming getAIResponse handles empty inventory gracefully.
            const response = await getAIResponse(userText, []);

            setMessages(prev => [...prev, { role: 'bot', text: response }]);

            // Speak it!
            if (mode === 'ai') {
                speakText(response);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsThinking(false);
        }
    };

    // --- Media Gen Logic ---
    const handleGenerateMedia = async (type: 'image' | 'video') => {
        if (!mediaPrompt.trim() || isGeneratingMedia) return;
        setIsGeneratingMedia(true);
        setGeneratedMedia(null);
        try {
            let url = "";
            if (type === 'image') {
                url = await generateImage(mediaPrompt, referenceImage || undefined);
            } else {
                url = await generateVideo(mediaPrompt);
            }
            if (url) setGeneratedMedia({ type, url });
        } catch (e) {
            console.error("Media Gen Failed:", e);
        } finally {
            setIsGeneratingMedia(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            if (speechLoopRef.current) cancelAnimationFrame(speechLoopRef.current);
        };
    }, []);

    if (showCreator) {
        return (
            <ReadyPlayerMeCreator
                onAvatarExported={(url) => {
                    setAvatarUrl(url);
                    localStorage.setItem('richard_avatar_url', url);
                    setShowCreator(false);
                }}
                onCancel={() => setShowCreator(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex overflow-hidden font-montserrat text-white relative">

            {/* 1. Sidebar Controls (Glassmorphism) */}
            <aside className="w-80 h-screen fixed left-0 top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-8 transition-all duration-500 -translate-x-full lg:translate-x-0">

                <div className="flex items-center gap-3 text-[#00aed9]">
                    <Activity size={24} />
                    <h1 className="text-xl font-black uppercase tracking-widest">Digital Twin</h1>
                </div>

                {/* Status Card */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${faceRig && mode === 'mirror' ? 'bg-green-500 animate-pulse' : (mode === 'ai' ? 'bg-cyan-500 animate-pulse' : 'bg-red-500')}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {mode === 'ai' ? 'AI AGENT ACTIVE' : (faceRig ? 'Tracking Active' : 'No Face Detected')}
                        </span>
                    </div>
                </div>

                {/* Mode & Tab Selector */}
                <div className="flex flex-col gap-2">
                    <div className="bg-slate-800/50 p-1 rounded-xl flex">
                        <button
                            onClick={() => { setMode('mirror'); window.speechSynthesis.cancel(); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'mirror' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            MIRROR
                        </button>
                        <button
                            onClick={() => setMode('ai')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'ai' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            AI AGENT
                        </button>
                    </div>

                    {mode === 'ai' && (
                        <div className="bg-slate-800/80 p-1 rounded-xl flex border border-white/5">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                            >
                                CHAT
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeTab === 'docs' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                            >
                                DOCUMENTOS
                            </button>
                            <button
                                onClick={() => setActiveTab('media')}
                                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeTab === 'media' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                            >
                                MEDIA
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Configuración</h3>

                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                        <div className="flex items-center gap-3">
                            <Camera size={18} className="text-slate-300" />
                            <span className="text-sm font-semibold text-slate-200">Fuente de Video</span>
                        </div>
                        <span className="text-xs text-[#00aed9]">{mode === 'ai' ? 'Disabled' : 'Webcam'}</span>
                    </button>

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors border ${showDebug ? 'bg-[#00aed9]/10 border-[#00aed9]/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Activity size={18} className={showDebug ? 'text-[#00aed9]' : 'text-slate-300'} />
                            <span className={`text-sm font-semibold ${showDebug ? 'text-[#00aed9]' : 'text-slate-200'}`}>Ver Malla Facial</span>
                        </div>
                        <span className="text-xs">{showDebug ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                        onClick={() => setIsCalibrating(!isCalibrating)}
                        disabled={mode === 'ai'}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors border border-white/5 group ${mode === 'ai' ? 'opacity-50 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <RefreshCw size={18} className={`text-slate-300 ${isCalibrating ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-semibold text-slate-200">Recalibrar</span>
                        </div>
                    </button>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <button
                            onClick={() => setShowCreator(true)}
                            className="w-full py-3 bg-[#00aed9]/20 border border-[#00aed9]/50 hover:bg-[#00aed9]/30 rounded-lg text-[#00aed9] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                            <UserPlus size={14} />
                            Crear Avatar Nuevo
                        </button>

                        <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Modelo 3D Personalizado</div>
                            <input
                                type="text"
                                placeholder="Pegar URL .glb (ReadyPlayerMe)"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const url = e.currentTarget.value;
                                        if (url.endsWith('.glb')) {
                                            setAvatarUrl(url);
                                            localStorage.setItem('richard_avatar_url', url);
                                            e.currentTarget.value = ''; // Clear
                                        } else {
                                            alert("La URL debe terminar en .glb");
                                        }
                                    }
                                }}
                            />
                            <p className="text-[8px] text-slate-600 mt-1 italic">Presiona Enter para cargar.</p>
                        </div>
                    </div>

                    {/* Content Panel (Chat or Docs or Media) */}
                    {mode === 'ai' && (
                        <div className="flex-1 overflow-y-auto min-h-0 bg-black/20 rounded-xl p-3 border border-white/5 text-xs space-y-3 relative group">
                            {activeTab === 'chat' ? (
                                <>
                                    {messages.length === 0 && <p className="text-center text-slate-500 italic mt-4">Habla con tu Gemelo Digital...</p>}
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-2 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-[#00aed9]/20 text-cyan-100' : 'bg-slate-700 text-slate-200'}`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && <div className="text-slate-500 animate-pulse">Pensando...</div>}
                                    <div className="pt-4 mt-4 border-t border-white/5 flex items-start gap-2 text-[9px] text-slate-500 italic leading-tight">
                                        <ShieldCheck size={12} className="shrink-0 text-[#00aed9]" />
                                        {AI_LEGAL_DISCLAIMER}
                                    </div>
                                </>
                            ) : activeTab === 'docs' ? (
                                <div className="flex flex-col gap-3 py-2">
                                    <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Carga de Documentos (Pre-Cierre)</div>
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <FileUp size={24} className="text-slate-500 group-hover:text-[#00aed9] mb-2" />
                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white">Subir Licencia o ID</span>
                                        <input type="file" className="hidden" onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setDocs(prev => [...prev, { name: e.target.files![0].name, type: 'ID', status: 'pending' }]);
                                            }
                                        }} />
                                    </label>

                                    {docs.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center">
                                                    <FileUp size={14} className="text-[#00aed9]" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="font-bold truncate w-32">{doc.name}</div>
                                                    <div className="text-[8px] uppercase text-slate-500">{doc.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-black text-amber-500 uppercase animate-pulse">Verificando...</div>
                                        </div>
                                    ))}

                                    <p className="text-[9px] text-slate-500 italic mt-auto">
                                        Esta información es procesada de forma segura para agilizar tu trámite.
                                    </p>
                                </div>
                            ) : activeTab === 'media' ? (
                                <div className="flex flex-col gap-3 py-2 h-full">
                                    <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Media Studio (Beta)</div>

                                    {/* Media Studio Sub-Tabs */}
                                    <div className="flex bg-black/40 p-1 rounded-lg mb-4">
                                        <button
                                            onClick={() => setMediaMode('generate')}
                                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${mediaMode === 'generate' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            GENERATE (VEO/NANO)
                                        </button>
                                        <button
                                            onClick={() => setMediaMode('flow')}
                                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${mediaMode === 'flow' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            GOOGLE FLOW (CINEMA)
                                        </button>
                                    </div>

                                    {mediaMode === 'generate' ? (
                                        <div className="space-y-4">
                                            {/* Existing Media Generation UI */}
                                            <textarea
                                                value={mediaPrompt}
                                                onChange={(e) => setMediaPrompt(e.target.value)}
                                                placeholder="Describe tu escena o imagen..."
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00aed9]/50 min-h-[80px]"
                                            />

                                            {/* Image Reference Upload */}
                                            <div className="relative">
                                                <label className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-white/10 hover:border-white/30 cursor-pointer transition-colors">
                                                    <Upload size={14} className="text-slate-400" />
                                                    <span className="text-[10px] text-slate-400">
                                                        {referenceImage ? 'Referencia cargada (Click para cambiar)' : 'Subir Mi Foto (Referencia)'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setReferenceImage(reader.result as string);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                {referenceImage && (
                                                    <div className="mt-2 relative group w-16 h-16">
                                                        <img src={referenceImage} alt="Ref" className="w-full h-full object-cover rounded-md border border-white/20" />
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); setReferenceImage(null); }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleGenerateMedia('image')}
                                                    disabled={isGeneratingMedia || !mediaPrompt}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all disabled:opacity-50"
                                                >
                                                    <ImageIcon size={14} className="text-pink-500" />
                                                    {isGeneratingMedia ? '...' : 'NANOBANANA'}
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateMedia('video')}
                                                    disabled={isGeneratingMedia || !mediaPrompt}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all disabled:opacity-50"
                                                >
                                                    <VideoIcon size={14} className="text-purple-500" />
                                                    {isGeneratingMedia ? '...' : 'VEO 3.1'}
                                                </button>
                                            </div>

                                            {isGeneratingMedia && (
                                                <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                                                    <Loader2 size={24} className="animate-spin text-cyan-500" />
                                                    <span className="text-[10px] animate-pulse">Generando contenido de alta fidelidad...</span>
                                                </div>
                                            )}

                                            {generatedMedia && !isGeneratingMedia && (
                                                <div className="mt-2 rounded-xl overflow-hidden border border-white/20 bg-black/50 relative group">
                                                    {generatedMedia.type === 'image' ? (
                                                        <img src={generatedMedia.url} alt="Generated" className="w-full h-full object-contain max-h-[200px]" />
                                                    ) : (
                                                        <video src={generatedMedia.url} controls className="w-full h-full max-h-[200px]" />
                                                    )}
                                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[9px] text-white/80 uppercase font-mono border border-white/10">
                                                        Via {generatedMedia.type === 'image' ? 'Gemini Image' : 'Veo 3.1'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl text-center space-y-3">
                                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                                                    <Film size={24} className="text-pink-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">Google Labs Flow</h4>
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        Herramienta profesional de cine con IA. Crea escenas complejas, transiciones y narrativas completas.
                                                    </p>
                                                </div>
                                                <a
                                                    href="https://labs.google/fx/es-419/tools/flow"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/25"
                                                >
                                                    ABRIR FLOW STUDIO
                                                </a>
                                                <p className="text-[9px] text-slate-500">*Requiere cuenta de Google Labs</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-white/10 text-center">
                        <p className="text-[10px] text-slate-500">Powered by MediaPipe & Gemini AI</p>
                    </div>
                </div> {/* Closing Controls div */}
            </aside >

            {/* 2. Main 3D Canvas Area */}
            < main className="flex-1 relative lg:ml-80 h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black" >

                {/* Face Tracker Logic (Hidden/Overlay) */}
                < SafeComponent name="FaceTracker" >
                    <FaceTracker onFaceUpdate={handleFaceUpdate} showDebug={showDebug} />
                </SafeComponent >

                {/* 3D Scene */}
                < div className="w-full h-full relative group/scene" >
                    <SafeComponent name="AvatarScene">
                        <AvatarScene faceRig={faceRig} aiState={aiState} modelUrl={avatarUrl} />
                    </SafeComponent>
                </div >

                {/* Chat Input Overlay (AI Mode) */}
                {
                    mode === 'ai' && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
                            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl shadow-cyan-900/20">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-cyan-400">
                                    <BotIcon isSpeaking={aiState.isSpeaking} />
                                </div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Escribe algo para que Richard IA responda..."
                                    className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2 placeholder:text-slate-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isThinking}
                                    title="Enviar mensaje"
                                    aria-label="Enviar mensaje"
                                    className="w-10 h-10 bg-[#00aed9] text-white rounded-full flex items-center justify-center hover:bg-[#009bc2] disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
};

// Mini component for the bot icon animation
const BotIcon = ({ isSpeaking }: { isSpeaking: boolean }) => {
    if (isSpeaking) {
        return (
            <div className="flex gap-1 items-center h-3">
                <div className="w-1 bg-cyan-400 animate-bounce [animation-delay:-0.3s] h-full" />
                <div className="w-1 bg-cyan-400 animate-bounce [animation-delay:-0.15s] h-full" />
                <div className="w-1 bg-cyan-400 animate-bounce h-full" />
            </div>
        )
    }
    return <Sparkles size={18} />;
}

export default DigitalTwinDashboard;
