
import React, { useState, useRef, useEffect } from 'react';
import { Car } from '../types';
import { getAIResponse } from '../services/geminiService';
import { AGENTS, detectIntent, AgentPersona } from '../services/agentSystem';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, RefreshCw, Terminal, Mic, MicOff, Volume2, MessageCircle, ShieldCheck } from 'lucide-react';
import { AI_LEGAL_DISCLAIMER } from '../services/firebaseService';

interface Props {
  inventory: Car[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  agent?: AgentPersona; // Store which agent replied
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
  const [currentPersona, setCurrentPersona] = useState<AgentPersona>('ricardo');

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('richard_chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: 'bot', text: '¡Hola! Soy Ricardo, tu experto en autos. ¿Qué buscas hoy?', agent: 'ricardo' }]);
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
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-US';
    utterance.rate = 1.1;
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

    recognition.onstart = () => { setIsListening(true); addDebugLog("Voice: Listening..."); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addDebugLog(`Voice Result: "${transcript}"`);
      setInput(transcript);
      handleSend(transcript, true);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textOverride?: string, autoSpeak: boolean = false) => {
    window.speechSynthesis.cancel();
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;

    if (textToSend.trim() === '/debug') {
      setShowDebug(!showDebug);
      setInput('');
      return;
    }

    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    setApiStatus('loading');
    const startTime = Date.now();

    // 1. Detect Intent
    const detectedPersona = detectIntent(userMsg);
    setCurrentPersona(detectedPersona); // Switch UI context immediately
    const agentProfile = AGENTS[detectedPersona];

    try {
      addDebugLog(`Routing to: ${detectedPersona}`);

      const fullResponse = await getAIResponse(
        userMsg,
        inventory,
        messages.map(m => ({ role: m.role, text: m.text })),
        agentProfile.systemPrompt // Pass Persona Prompt
      );

      // --- WOLF AI: LEAD CAPTURE LOGIC ---
      let displayResponse = fullResponse;
      const captureRegex = /\[\[CAPTURE_LEAD:\s*(\{.*?\})\s*\]\]/;
      const match = fullResponse.match(captureRegex);

      if (match) {
        try {
          const leadData = JSON.parse(match[1]);
          addDebugLog(`🐺 WOLF CAPTURE: ${JSON.stringify(leadData)}`);

          // Import dynamic to avoid cycle text
          const { submitApplication } = await import('../services/firebaseService');

          await submitApplication({
            ...leadData,
            timestamp: new Date(),
            source: 'wolf_ai_agent',
            status: 'new',
            aiSummary: 'Capturado por Agente Jordan (Wolf Mode) - Alta Prioridad'
          });

          // Clean the hidden command from UI
          displayResponse = fullResponse.replace(match[0], '').trim();

          // Trigger visual feedback (could be a toast, utilizing console for now or existing UI state if possible)
          const { addNotification } = await import('../contexts/NotificationContext').then(m => ({ addNotification: (t: any, m: any) => console.log(t, m) })); // Polyfill if context not avail in this scope directly easily without hook rework
          // Better: append a system message
          setMessages(prev => [...prev, { role: 'bot', text: displayResponse, agent: detectedPersona }]);
          setMessages(prev => [...prev, { role: 'bot', text: "📝 ¡He guardado tu información! Un gerente senior aprobará tu solicitud en breve.", agent: 'system' }]);

        } catch (err) {
          console.error("Lead Capture Parse Error:", err);
          displayResponse = fullResponse.replace(captureRegex, ''); // Still clean it
          setMessages(prev => [...prev, { role: 'bot', text: displayResponse, agent: detectedPersona }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: displayResponse, agent: detectedPersona }]);
      }

      const latency = Date.now() - startTime;
      setLastLatency(latency);
      setApiStatus('success');

      if (autoSpeak) speakText(displayResponse);

    } catch (e) {
      setApiStatus('error');
      setMessages(prev => [...prev, { role: 'bot', text: "Lo siento, tuve un error de conexión.", agent: 'system' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    const initial: Message[] = [{ role: 'bot', text: '¡Hola! Soy Ricardo. ¿En qué puedo ayudarte?', agent: 'ricardo' }];
    setMessages(initial);
    setCurrentPersona('ricardo');
    localStorage.setItem('richard_chat_history', JSON.stringify(initial));
  };

  const activeAgent = AGENTS[currentPersona];

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4 font-sans">
      {isOpen && (
        <div className="w-[380px] h-[600px] flex flex-col rounded-[35px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 border border-white/20 backdrop-blur-xl bg-white/90 dark:bg-[#0d2232]/90">

          {/* Dynamic Premium Header */}
          <header className={`relative p-6 text-white flex items-center justify-between shadow-lg z-10 transition-colors duration-500 
            ${currentPersona === 'ricardo' ? 'bg-gradient-to-r from-[#173d57] to-[#0f2a3d]' :
              currentPersona === 'sofia' ? 'bg-gradient-to-r from-emerald-900 to-emerald-800' :
                currentPersona === 'jordan' ? 'bg-gradient-to-r from-slate-900 to-rose-900 border-b border-rose-500/50' : 'bg-slate-900'}`
          }>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden bg-white`}>
                  {/* Avatar Image using Flaticon URLs from Agent Service, mostly reliable. Fallback to Bot icon if load fails (handled by img or alt) */}
                  <img src={activeAgent.avatar} alt={activeAgent.name} className="w-full h-full object-cover p-1" />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#173d57] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight leading-none">{activeAgent.name}</h3>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1 opacity-80 flex items-center gap-1">
                  {activeAgent.role}
                </p>
              </div>
            </div>
            <div className="flex gap-2 relative z-10">
              <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white" title="Reiniciar Chat">
                <RefreshCw size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                <ChevronDown size={22} />
              </button>
            </div>
          </header>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-transparent" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-[#00aed9] text-white rounded-[20px] rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700'
                  }`}>

                  {/* Show small name tag for bot messages to indicate who spoke */}
                  {msg.role === 'bot' && msg.agent && (
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                      {AGENTS[msg.agent]?.name || 'Richard AI'}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 ml-2 animate-pulse">{activeAgent.name} está escribiendo...</span>
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700 flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-start gap-2 text-[9px] text-slate-500 italic leading-tight px-2">
              <ShieldCheck size={12} className="shrink-0 text-[#00aed9]" />
              {AI_LEGAL_DISCLAIMER}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#0b1d2a] border-t border-slate-100 dark:border-slate-800 space-y-4 relative z-20">
            {/* Quick Prompts */}
            {messages.length < 3 && !isTyping && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-x">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button key={i} onClick={() => handleSend(prompt)} className="whitespace-nowrap px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#00aed9] hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full transition-all border border-slate-200 dark:border-slate-700 shrink-0">
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="w-full bg-slate-100 dark:bg-slate-900 rounded-full py-3.5 pl-5 pr-12 text-sm font-medium text-slate-900 dark:text-white border border-transparent focus:border-[#00aed9] focus:bg-white dark:focus:bg-slate-900 focus:ring-0 outline-none transition-all shadow-inner"
                placeholder={`Hablar con ${activeAgent.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#00aed9] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md">
                <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
              </button>
              <button onClick={toggleVoiceParams} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-[#00aed9]'}`}>
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <div className="flex justify-center items-center gap-1.5 opacity-40">
              <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Multi-Agent System Active</p>
              <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`group relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_-10px_rgba(0,174,217,0.5)] transition-all duration-500 hover:scale-110 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-[#00aed9] to-blue-500'}`}>
        {isOpen ? <X size={28} /> :
          // Dynamic Icon based on current persona when closed, or generic msg icon
          <div className="relative">
            <MessageSquare size={28} className="fill-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
          </div>
        }
      </button>
    </div>
  );
};

export default AIChatWidget;
