
import React, { useState, useRef, useEffect } from 'react';
import { connectToVoiceSession } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audioUtils';
import { Mic, MicOff, Bot, Activity, Wifi } from 'lucide-react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type Transcription = { id: number; role: 'user' | 'model'; text: string; isFinal: boolean };

const VoiceAssistantView: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const sessionPromise = useRef<Promise<any> | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const inputNode = useRef<ScriptProcessorNode | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const nextStartTime = useRef(0);
    const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const transcriptionIdCounter = useRef(0);

    // Auto-scroll transcriptions
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcriptions]);

    const stopSession = async () => {
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }
        if (inputNode.current) {
            inputNode.current.disconnect();
            inputNode.current = null;
        }
        if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
            await inputAudioContext.current.close();
        }
        if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
            await outputAudioContext.current.close();
        }
        if (sessionPromise.current) {
            try {
                const session = await sessionPromise.current;
                session.close();
            } catch (e) { console.log("Session already closed"); }
            sessionPromise.current = null;
        }
        setConnectionState('disconnected');
        setIsListening(false);
        setIsSpeaking(false);
    };
    
    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    const startSession = async () => {
        try {
            setConnectionState('connecting');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.current = stream;

            inputAudioContext.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            
            sessionPromise.current = connectToVoiceSession({
                onopen: () => {
                    setConnectionState('connected');
                    const source = inputAudioContext.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (event) => {
                        setIsListening(true); // Technically always listening if connected
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.current!.destination);
                    inputNode.current = scriptProcessor;
                },
                onmessage: async (message: LiveServerMessage) => {
                    handleTranscription(message);
                    handleAudio(message);
                },
                onerror: (e: Event) => {
                    console.error('Session error:', e);
                    setConnectionState('error');
                    stopSession();
                },
                onclose: (e: CloseEvent) => {
                    stopSession();
                },
            });

        } catch (error) {
            console.error('Failed to start session:', error);
            setConnectionState('error');
        }
    };
    
    const handleTranscription = (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
            const { text } = message.serverContent.outputTranscription;
            currentOutputTranscriptionRef.current += text;
            updateTranscription('model', currentOutputTranscriptionRef.current, false);
        } else if (message.serverContent?.inputTranscription) {
            const { text } = message.serverContent.inputTranscription;
            currentInputTranscriptionRef.current += text;
            updateTranscription('user', currentInputTranscriptionRef.current, false);
        }

        if (message.serverContent?.turnComplete) {
             setTranscriptions(prev => {
                if (prev.length === 0) return prev;
                const last = prev[prev.length - 1];
                if (!last.isFinal) {
                    const updated = [...prev];
                    updated[prev.length - 1] = { ...last, isFinal: true };
                    return updated;
                }
                return prev;
            });
            currentInputTranscriptionRef.current = '';
            currentOutputTranscriptionRef.current = '';
            setIsListening(false); // Reset listening state visualization
        }
    };
    
    const updateTranscription = (role: 'user' | 'model', text: string, isFinal: boolean) => {
        setTranscriptions(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === role && !last.isFinal) {
                const updatedTranscriptions = [...prev];
                updatedTranscriptions[prev.length - 1] = { ...last, text, isFinal };
                return updatedTranscriptions;
            } else {
                transcriptionIdCounter.current++;
                return [...prev, { id: transcriptionIdCounter.current, role, text, isFinal }];
            }
        });
    };

    const handleAudio = async (message: LiveServerMessage) => {
        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
            setIsSpeaking(true);
            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext.current!, 24000, 1);
            const source = outputAudioContext.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.current!.destination);
            
            source.onended = () => {
                audioSources.current.delete(source);
                if (audioSources.current.size === 0) setIsSpeaking(false);
            };
            
            const currentTime = outputAudioContext.current!.currentTime;
            nextStartTime.current = Math.max(nextStartTime.current, currentTime);
            source.start(nextStartTime.current);
            nextStartTime.current += audioBuffer.duration;
            audioSources.current.add(source);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-between p-8 relative overflow-hidden bg-slate-950">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Status Header */}
            <div className="flex items-center gap-4 z-10 w-full max-w-4xl justify-between">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 px-4 py-2 rounded-full">
                    <Wifi size={16} className={connectionState === 'connected' ? 'text-green-500' : 'text-slate-500'} />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{connectionState}</span>
                </div>
                {connectionState === 'connected' && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#00aed9]">
                        <Activity size={16} className="animate-pulse" />
                        LIVE STREAM ACTIVE
                    </div>
                )}
            </div>

            {/* AI Core Visualization */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full">
                <div className="relative flex items-center justify-center">
                    {/* Outer Rings */}
                    <div className={`absolute w-[500px] h-[500px] border border-[#00aed9]/10 rounded-full transition-all duration-1000 ${isSpeaking ? 'scale-110 opacity-50' : 'scale-100 opacity-20'}`} />
                    <div className={`absolute w-[400px] h-[400px] border border-[#00aed9]/20 rounded-full transition-all duration-700 ${isSpeaking ? 'scale-105 opacity-60' : 'scale-100 opacity-30'}`} />
                    <div className={`absolute w-[300px] h-[300px] border border-[#00aed9]/30 rounded-full transition-all duration-500 ${isListening ? 'scale-110 border-green-500/30' : 'scale-100'}`} />

                    {/* Core Orb */}
                    <div 
                        className={`w-40 h-40 rounded-full bg-gradient-to-br from-[#00aed9] to-blue-600 flex items-center justify-center shadow-[0_0_80px_rgba(0,174,217,0.4)] transition-all duration-300 z-20
                        ${isSpeaking ? 'animate-[pulse_1s_ease-in-out_infinite] scale-110 shadow-[0_0_120px_rgba(0,174,217,0.8)]' : ''}
                        ${isListening ? 'scale-95 ring-4 ring-green-500/50' : ''}
                        `}
                    >
                        <Bot size={64} className="text-white drop-shadow-lg" />
                    </div>
                    
                    {/* Connecting particles (Simulated) */}
                    {connectionState === 'connecting' && (
                        <div className="absolute w-48 h-48 border-4 border-t-[#00aed9] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    )}
                </div>
            </div>

            {/* Transcript Area */}
            <div className="w-full max-w-3xl z-10 mb-8">
                <div 
                    ref={scrollRef}
                    className="h-48 overflow-y-auto space-y-4 px-4 mask-gradient-y scroll-smooth"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}
                >
                    {transcriptions.length === 0 && connectionState === 'connected' && (
                        <p className="text-center text-slate-500 animate-pulse mt-20">Esperando entrada de voz...</p>
                    )}
                    {transcriptions.map(t => (
                        <div key={t.id} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${
                                t.role === 'user' 
                                ? 'bg-slate-800 text-slate-200 rounded-br-none border border-slate-700' 
                                : 'bg-[#00aed9]/10 text-[#00aed9] rounded-bl-none border border-[#00aed9]/20'
                            }`}>
                                <p className="text-lg font-medium leading-relaxed">{t.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Control Bar */}
            <div className="z-10 pb-8">
                <button 
                    onClick={connectionState === 'disconnected' || connectionState === 'error' ? startSession : stopSession}
                    className={`
                        w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95
                        ${connectionState === 'connected' 
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40 text-white' 
                            : 'bg-white hover:bg-slate-100 shadow-white/20 text-slate-900'}
                    `}
                    disabled={connectionState === 'connecting'}
                >
                    {connectionState === 'connected' ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
                <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {connectionState === 'connected' ? 'Toque para desconectar' : 'Iniciar Core de Voz'}
                </p>
            </div>
        </div>
    );
};

export default VoiceAssistantView;
