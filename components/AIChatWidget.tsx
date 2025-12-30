
import React, { useState, useRef, useEffect } from 'react';
import { Car } from '../types';
import { getAIResponse } from '../services/geminiService';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, RefreshCw } from 'lucide-react';

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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Soy Richard IA. Analizo nuestro inventario en tiempo real para ti. ¿Qué buscas hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;
    
    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    // Simular un pequeño delay "humano" antes de llamar a la API
    setTimeout(async () => {
        const response = await getAIResponse(userMsg, inventory);
        setMessages(prev => [...prev, { role: 'bot', text: response }]);
        setIsTyping(false);
    }, 600);
  };

  const handleReset = () => {
      setMessages([{ role: 'bot', text: '¡Hola de nuevo! ¿En qué más puedo ayudarte con nuestro inventario?' }]);
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
                    <Sparkles size={10} /> Online
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
                    <div className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
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
