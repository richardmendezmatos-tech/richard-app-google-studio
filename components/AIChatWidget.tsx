
import React, { useState, useRef, useEffect } from 'react';
import { Car } from '../types';
import { getAIResponse } from '../services/geminiService';
import { submitApplication } from '../services/firebaseService';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, RefreshCw, User, Phone, Mail, Calendar, Terminal, CheckCircle, AlertCircle, Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';

interface Props {
  inventory: Car[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const QUICK_PROMPTS = [
  "🚙 ¿Qué SUVs tienes?",
  "💰 Ofertas de financiamiento",
  "⚡ Híbridos disponibles",
  "📅 Agendar Test Drive"
];

const AIChatWidget: React.FC<Props> = ({ inventory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('richard_chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: 'bot', text: '¡Hola! Soy Richard IA. Analizo nuestro inventario en tiempo real para ti. ¿Qué buscas hoy?' }]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('richard_chat_history', JSON.stringify(messages));
    }
  }, [messages]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const [lastLatency, setLastLatency] = useState<number>(0);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = (msg: string) => setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Teardown speech on unmount
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Stop undefined sounds
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-US'; // Or es-MX, es-ES
    utterance.rate = 1.1; // Slightly faster
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceParams = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta voz. Intenta con Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      addDebugLog("Voice: Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addDebugLog(`Voice Result: "${transcript}"`);
      setInput(transcript);
      handleSend(transcript, true); // Auto-send and enable TTS response
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
      addDebugLog(`Voice Error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Lead Form State
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '' });

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitApplication({
      firstName: leadForm.name,
      phone: leadForm.phone,
      email: leadForm.email,
      type: 'chat',
      status: 'new',
      message: messages.map(m => m.text).join('\n').slice(0, 500) // Summarize chat
    });
    setShowLeadForm(false);
    setMessages(prev => [...prev, { role: 'bot', text: '¡Listo! He enviado tus datos a un asesor humano. Te llamarán pronto. 😉' }]);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textOverride?: string, autoSpeak: boolean = false) => {
    window.speechSynthesis.cancel(); // Stop talking if user interrupts
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;

    // Diagnostic Command
    if (textToSend.trim() === '/debug') {
      setShowDebug(!showDebug);
      setInput('');
      addDebugLog('Diagnostic Mode Toggled');
      return;
    }

    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    setApiStatus('loading');
    const startTime = Date.now();

    try {
      // Pass current history + new user message to API
      addDebugLog(`Sending: "${userMsg.slice(0, 20)}..."`);
      const response = await getAIResponse(userMsg, inventory, [...messages, { role: 'user', text: userMsg }]);

      const latency = Date.now() - startTime;
      setLastLatency(latency);
      setApiStatus('success');
      addDebugLog(`Response (${latency}ms): Success`);

      setMessages(prev => [...prev, { role: 'bot', text: response }]);

      // Auto-speak if triggered by voice OR if logic suggests (could add a toggle later)
      if (autoSpeak) {
        speakText(response);
      }

    } catch (e) {
      setApiStatus('error');
      addDebugLog(`Error: ${e}`);
      const errMsg = "Lo siento, tuve un error de conexión.";
      setMessages(prev => [...prev, { role: 'bot', text: errMsg }]);
      if (autoSpeak) speakText(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    const initial: Message[] = [{ role: 'bot', text: '¡Hola de nuevo! ¿En qué más puedo ayudarte con nuestro inventario?' }];
    setMessages(initial);
    localStorage.setItem('richard_chat_history', JSON.stringify(initial));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4 font-sans">
      {isOpen && (
        <div className="w-[380px] h-[600px] flex flex-col rounded-[35px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 border border-white/20 backdrop-blur-xl bg-white/90 dark:bg-[#0d2232]/90">

          {/* Premium Header */}
          <header className="relative p-6 bg-gradient-to-r from-[#173d57] to-[#0f2a3d] text-white flex items-center justify-between shadow-lg z-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Bot size={22} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#173d57] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight leading-none">Richard <span className="text-[#00aed9]">IA</span></h3>
                <p className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest mt-1 opacity-80 flex items-center gap-1">
                  <Sparkles size={10} /> Online {isSpeaking && <span className="animate-pulse text-green-300 ml-2 flex items-center gap-1"><Volume2 size={10} /> HABLANDO...</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2 relative z-10">
              <a href="https://wa.me/17873682880" target="_blank" rel="noreferrer" className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-full transition-colors animate-pulse" title="WhatsApp">
                <MessageCircle size={18} />
              </a>
              <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white" title="Reiniciar Chat">
                <RefreshCw size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                <ChevronDown size={22} />
              </button>
            </div>
          </header>

          {/* Debug Overlay */}
          {showDebug && (
            <div className="absolute top-[80px] left-4 right-4 bg-black/80 backdrop-blur-md rounded-xl p-3 text-xs font-mono text-green-400 z-50 border border-green-500/30 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-white">
                  <Terminal size={12} /> System Status
                </span>
                <span className={apiStatus === 'error' ? 'text-red-400' : 'text-green-400'}>
                  {apiStatus.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 opacity-90">
                <div className="flex justify-between">
                  <span>API Key:</span>
                  <span className={import.meta.env.VITE_GEMINI_API_KEY ? "text-green-400" : "text-red-500"}>
                    {import.meta.env.VITE_GEMINI_API_KEY ? "DETECTED" : "MISSING"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className={lastLatency > 2000 ? "text-yellow-400" : "text-blue-300"}>
                    {lastLatency}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Env:</span>
                  <span>{import.meta.env.MODE}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10">
                <p className="text-[10px] text-zinc-500 mb-1">RECENT LOGS</p>
                {debugLog.map((log, i) => (
                  <div key={i} className="truncate text-[10px] text-zinc-400">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-transparent" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-[#00aed9] text-white rounded-[20px] rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts & Input */}
          <div className="p-4 bg-white dark:bg-[#0b1d2a] border-t border-slate-100 dark:border-slate-800 space-y-4 relative z-20">
            {messages.length < 3 && !isTyping && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-x">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#00aed9] hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full transition-all border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="w-full bg-slate-100 dark:bg-slate-900 rounded-full py-3.5 pl-5 pr-12 text-sm font-medium text-slate-900 dark:text-white border border-transparent focus:border-[#00aed9] focus:bg-white dark:focus:bg-slate-900 focus:ring-0 outline-none transition-all shadow-inner"
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#00aed9] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
              >
                <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
              </button>

              <button
                onClick={toggleVoiceParams}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-[#00aed9]'}`}
                title="Hablar con Richard"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <div className="flex justify-center items-center gap-1.5 opacity-40">
              <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini 2.5</p>
              <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_-10px_rgba(0,174,217,0.5)] transition-all duration-500 hover:scale-110 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-[#00aed9] to-blue-500'}`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} className="fill-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-50 dark:border-slate-900 rounded-full"></span>
        )}
      </button>
    </div>
  );
};

export default AIChatWidget;
