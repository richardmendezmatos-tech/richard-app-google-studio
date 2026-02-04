
import React, { useState, useRef, useEffect } from 'react';
import { Car } from '@/types/types';
import { getAIResponse } from '@/services/geminiService';
import { Send, User, Bot, Sparkles } from 'lucide-react';

interface Props {
  inventory: Car[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const AIConsultant: React.FC<Props> = ({ inventory }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Saludos! Soy Richard IA. ¿En qué puedo ayudarte hoy? ¿Buscas un SUV económico o quizás una pickup para el trabajo?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await getAIResponse(userMsg, inventory);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-12">
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col bg-white dark:bg-slate-800 lg:rounded-[40px] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-[#173d57] dark:bg-slate-900/50 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00aed9] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="text-white animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">Richard AI Assistant</h2>
              <p className="text-xs text-cyan-300 font-bold uppercase tracking-widest">Consultor Certificado</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-[10px] font-black text-white/50 uppercase block mb-1">Unidades Disponibles</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold">{inventory.length}</span>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' : 'bg-cyan-50 dark:bg-cyan-500/10 text-[#00aed9]'
                  }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-6 rounded-[24px] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[24px] rounded-tl-none border border-slate-100 dark:border-slate-700">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce [animation-delay:-0.5s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <div className="relative group">
            <input
              type="text"
              className="w-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-[28px] py-5 pl-8 pr-16 text-lg dark:text-white focus:border-[#00aed9] focus:ring-0 outline-none transition-all shadow-inner"
              placeholder="¿Qué unidad estás buscando?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#173d57] text-white rounded-full flex items-center justify-center hover:bg-[#00aed9] disabled:opacity-30 transition-all shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-4 font-bold uppercase tracking-widest">
            Richard IA puede cometer errores. Llama al 787-368-2880 para confirmación final.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;
