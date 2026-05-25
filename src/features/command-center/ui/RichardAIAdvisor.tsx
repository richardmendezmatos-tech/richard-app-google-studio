'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Send,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Zap,
  ShieldCheck,
  MessageSquare,
  Bot,
} from 'lucide-react';

interface RichardAIAdvisorProps {
  businessContext?: any;
}

export const RichardAIAdvisor: React.FC<RichardAIAdvisorProps> = ({ businessContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/command-center/ai-advisor',
      body: {
        context: businessContext,
      },
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Sentinel N24 Advisor activo. ¿En qué área estratégica deseas profundizar hoy, Richard?',
        parts: [
          {
            type: 'text',
            text: 'Sentinel N24 Advisor activo. ¿En qué área estratégica deseas profundizar hoy, Richard?',
          },
        ],
      },
    ] as any,
  } as any);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group relative bg-linear-to-br from-cyan-500/10 to-violet-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 overflow-hidden hover:border-cyan-500/40 transition-all duration-500 text-left hud-brackets"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain className="w-20 h-20 text-cyan-400" />
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center relative">
            <Bot className="w-6 h-6 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h2
              className="font-black uppercase tracking-widest text-sm"
              style={{ fontFamily: 'var(--font-cinematic)' }}
            >
              Richard <span className="text-cyan-400">AI Advisor</span>
            </h2>
            <p className="text-[10px] text-slate-500 tracking-tighter uppercase font-bold">
              Sentinel Intelligence Nivel 24 • Auditoría en tiempo real
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 max-w-md">
          Haz clic para solicitar recomendaciones estratégicas sobre tu inventario, leads y salud
          financiera.
        </p>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Sugerir Cierres
          </span>
          <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-[10px] text-violet-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Market Gaps
          </span>
        </div>
      </button>

      {/* Advisor Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-4 z-[60] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Canal de Inteligencia Directo
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 1 && (
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {[
                    '¿Qué me recomiendas hoy?',
                    'Analiza mis leads más calientes',
                    '¿Qué unidades debería comprar?',
                    'Estado de mi flujo de caja',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage({ text: suggestion })}
                      className="text-left p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-tight transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m) => {
                const text =
                  ((m.parts as any[])?.find((p) => p.type === 'text') as any)?.text ??
                  (m as any).content ??
                  '';
                return (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50'
                          : 'bg-slate-800/40 border border-white/5 text-slate-300'
                      }`}
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-slate-950/60 border-t border-white/5">
              <div className="relative">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregúntame sobre la estrategia de hoy..."
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:border-cyan-500/50 transition-all pr-12"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <p className="text-[9px] text-slate-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Cifrado Sentinel Activo
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
