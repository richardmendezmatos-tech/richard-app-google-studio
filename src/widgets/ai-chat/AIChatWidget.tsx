"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Car } from '@/shared/types/types';
import { AGENTS, detectIntent, AgentPersona } from '@/features/ai-hub';
import { useCopilotAgent } from '@/features/ai-hub';
import { useVoiceRecognition } from '@/features/ai-hub';
import {
  MessageSquare,
  X,
  Send,
  ChevronDown,
  RefreshCw,
  Mic,
  MicOff,
  ShieldCheck,
  Calculator,
  Banknote,
} from 'lucide-react';
import { AI_LEGAL_DISCLAIMER } from '@/shared/api/firebase/firebaseShared';
import GenUICarCard from '@/shared/brand-ui/layout/chat/GenUICarCard';

import { useInventoryAnalytics } from '@/features/inventory';
import { ChatflowOrchestrator } from '@/entities/chatbot';
import { ChatbotGatewayAdapter } from '@/entities/chatbot';
import { OutputSanitizer } from '@/shared/api/adapters/outputSanitizer';
import { ChatOrchestrationState } from '@/entities/chatbot';

interface Props {
  inventory: Car[];
}

const QUICK_PROMPTS = [
  '🚙 ¿Qué SUVs tienes?',
  '💰 Ofertas de financiamiento',
  '⚡ Híbridos disponibles',
  '📅 Agendar Test Drive',
];

const AIChatWidget: React.FC<Props> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useInventoryAnalytics();
  const [currentPersona, setCurrentPersona] = useState<AgentPersona>('ricardo');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Clean Architecture Hooks/State
  const orchestratorRef = useRef(new ChatflowOrchestrator());
  const [orchestrationState, setOrchestrationState] = useState<ChatOrchestrationState>({
    currentAgentId: 'ricardo',
    activeFlow: 'General',
    dataCollected: { hasVehicleId: false, hasFinancialProfile: false, hasContactInfo: false },
    fallbackCount: 0,
  });

  // Copilot SDK Hook
  const { messages, input, setInput, append, isLoading, setMessages } = useCopilotAgent(
    'main-chat-session',
    {
      initialMessages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: '¡Hola! Soy Ricardo, tu experto en autos. ¿Qué buscas hoy?',
          data: { agent: 'ricardo' },
        },
      ],
      onFinish: (message) => {
        const lastUserMsg = messages
          .slice()
          .reverse()
          .find((m) => m.role === 'user');
        if (lastUserMsg) {
          // APPLY CLEAN ORCHESTRATION
          const currentLead = ChatbotGatewayAdapter.toImmutableLead({
            id: 'current-session',
            aiScore: 50,
            type: 'chat',
          } as any);
          const newState = orchestratorRef.current.nextState(
            currentLead,
            orchestrationState,
            lastUserMsg.content,
          );
          setOrchestrationState(newState);
          setCurrentPersona(newState.currentAgentId as AgentPersona);
        }

        // APPLY OUTPUT SANITIZATION
        if (message.content) {
          message.content = OutputSanitizer.sanitize(message.content);
        }

        if (autoSpeakRef.current && message.content) {
          speakText(message.content);
          autoSpeakRef.current = false;
        }
      },
      onError: (err: Error) => {
        console.error('Copilot Error:', err);
      },
    },
  );

  const {
    isListening,
    toggleListening: toggleVoiceParams,
    isLoading: isLoadingVoice,
  } = useVoiceRecognition({
    onResult: (transcript) => {
      setInput(transcript);
      handleFormSubmit(null, transcript, true);
    },
    lang: 'es-US',
  });

  const autoSpeakRef = useRef(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-US';
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isOpen]);

  const handleFormSubmit = async (
    e: React.FormEvent | null,
    textOverride?: string,
    autoSpeak: boolean = false,
  ) => {
    if (e) e.preventDefault();
    const userMsg = textOverride || input;
    if (!userMsg.trim() || isLoading) return;

    if (userMsg.trim() === '/debug') {
      setShowDebug(!showDebug);
      setInput('');
      return;
    }

    autoSpeakRef.current = autoSpeak;

    // Auto Persona detection BEFORE sending to feel responsive
    const detected = detectIntent(userMsg);
    setCurrentPersona(detected);

    analytics.trackInteraction('message_sent', {
      content: userMsg,
      persona: detected,
    });

    await append({
      role: 'user',
      content: userMsg,
    });
  };

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Soy Ricardo. ¿En qué puedo ayudarte?',
        data: { agent: 'ricardo' },
      },
    ]);
    localStorage.removeItem('richard_chat_history');
  }, [setMessages]);

  const activeAgent = AGENTS[currentPersona];

  return (
    <div className="w-[380px] h-[600px] flex flex-col rounded-[35px] overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl bg-white/90 dark:bg-[#0d2232]/90 font-sans">
      {/* Dynamic Premium Header */}
      <header
        className={`relative p-6 text-white flex items-center justify-between shadow-lg z-10 transition-colors duration-500 
        ${
          currentPersona === 'ricardo'
            ? 'bg-gradient-to-r from-[#173d57] to-[#0f2a3d]'
            : currentPersona === 'sofia'
              ? 'bg-gradient-to-r from-emerald-900 to-emerald-800'
              : currentPersona === 'jordan'
                ? 'bg-gradient-to-r from-slate-900 to-rose-900 border-b border-rose-500/50'
                : 'bg-slate-900'
        }`}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden bg-white`}
            >
              <img
                src={activeAgent.avatar}
                alt={activeAgent.name}
                className="w-full h-full object-cover p-1"
              />
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
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            title="Reiniciar Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Chat Body */}
      <div
        className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-transparent"
        ref={scrollRef}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            <div
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-[20px] rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                    {msg.data && typeof msg.data === 'object' && 'agent' in msg.data
                      ? AGENTS[msg.data.agent as AgentPersona]?.name
                      : activeAgent.name}
                  </div>
                )}
                {msg.content}
              </div>
            </div>

            {/* --- GENERATIVE UI: TOOL INVOCATIONS --- */}
            {msg.toolInvocations?.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                if (toolName === 'checkInventory') {
                  const result = toolInvocation.result as Car[];
                  return (
                    <GenUICarCard key={toolCallId} cars={Array.isArray(result) ? result : []} />
                  );
                }
                if (toolName === 'calculatePayment') {
                  const result = toolInvocation.result as any;
                  const monthlyPayment =
                    result?.bestOption?.monthlyPayment || result?.monthlyPayment || '---';
                  const details = result?.disclaimer || result?.details || '';
                  return (
                    <div key={toolCallId} className="flex justify-start">
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Calculator size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            Pago Estimado
                          </div>
                          <div className="text-xl font-black text-emerald-700 dark:text-white">
                            ${monthlyPayment}/mo
                          </div>
                          <div className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70">
                            {details}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (toolName === 'captureCustomerLead') {
                  const result = toolInvocation.result as any;
                  return (
                    <div key={toolCallId} className="flex justify-start">
                      <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-3xl border border-primary/20 flex flex-col gap-3 max-w-[280px] shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                              Richard Sentinel
                            </div>
                            <div className="text-sm font-black text-slate-800 dark:text-white">
                              Registro Exitoso
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {result.message} Richard ha sido notificado y se pondrá en contacto pronto.
                        </p>
                        <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-primary">
                          <span>Status: Secured</span>
                          <RefreshCw size={10} className="animate-spin-slow" />
                        </div>
                      </div>
                    </div>
                  );
                }
                if (toolName === 'generatePreQualEstimate') {
                  const result = toolInvocation.result as any;
                  return (
                    <div key={toolCallId} className="flex justify-start">
                      <div className="bg-gradient-to-br from-[#0d2232] to-[#173d57] p-6 rounded-[30px] border border-primary/30 flex flex-col gap-4 max-w-[300px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Banknote size={80} className="text-white" />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                              Richard Financial
                            </div>
                            <div className="text-sm font-black text-white italic">
                              Pre-aprobación IA
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 relative z-10">
                          <div className="flex justify-between items-end border-b border-white/10 pb-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Poder de Pago</span>
                            <span className="text-lg font-black text-white">${result.buyingPower.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-white/10 pb-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Pago Estimado</span>
                            <span className="text-md font-bold text-primary">${result.maxMonthlyPayment}/mes</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Interés (APR)</span>
                            <span className="text-sm font-mono text-emerald-400">{result.apr}%</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-tight italic relative z-10">
                          *Análisis preliminar basado en crédito {result.creditTier}.
                        </p>

                        <button 
                          onClick={() => {
                            // Event to open formal pre-qual view
                            window.dispatchEvent(new CustomEvent('ra_open_formal_prequal', { 
                              detail: { creditTier: result.creditTier, monthlyIncome: 1 } 
                            }));
                          }}
                          className="w-full py-3 bg-primary hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 relative z-10"
                        >
                          Formalizar en Bóveda Segura
                        </button>
                      </div>
                    </div>
                  );
                }
              } else {
                return (
                  <div
                    key={toolCallId}
                    className="flex justify-start opacity-50 italic text-[10px] text-slate-400"
                  >
                    {toolName === 'checkInventory'
                      ? '🔍 Buscando autos...'
                      : toolName === 'calculatePayment'
                        ? '🧮 Calculando pago...'
                        : '⚙️ Procesando...'}
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}

        {(isLoading || isLoadingVoice) && !messages[messages.length - 1].content && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-400 ml-2 animate-pulse font-bold uppercase tracking-wider">
                {isLoadingVoice
                  ? '✨ Transcribiendo voz con IA...'
                  : `${activeAgent.name} está pensando...`}
              </span>
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-[20px] rounded-bl-sm border border-slate-100 dark:border-slate-700 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-start gap-2 text-[9px] text-slate-500 italic leading-tight px-2">
          <ShieldCheck size={12} className="shrink-0 text-primary" />
          {AI_LEGAL_DISCLAIMER}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0b1d2a] border-t border-slate-100 dark:border-slate-800 space-y-4 relative z-20">
        {messages.length < 3 && !isLoading && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-x">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleFormSubmit(null, prompt)}
                className="whitespace-nowrap px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full transition-all border border-slate-200 dark:border-slate-700 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            data-testid="chat-input"
            className="w-full bg-slate-100 dark:bg-slate-900 rounded-full py-3.5 pl-5 pr-12 text-sm font-medium text-slate-900 dark:text-white border border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-0 outline-none transition-all shadow-inner"
            placeholder={`Hablar con ${activeAgent.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Enviar mensaje"
            className="absolute right-1.5 top-1.5 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
          >
            <Send size={16} className={input.trim() ? 'translate-x-0.5' : ''} />
          </button>
          <button
            type="button"
            onClick={toggleVoiceParams}
            disabled={isLoadingVoice}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : isLoadingVoice
                  ? 'bg-primary text-white animate-spin-slow'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-primary'
            }`}
          >
            {isLoadingVoice ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : isListening ? (
              <MicOff size={16} />
            ) : (
              <Mic size={16} />
            )}
          </button>
        </form>

        <div className="flex justify-center items-center gap-1.5 opacity-40">
          <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            SDK Streaming & Gen UI Active
          </p>
          <div className="w-2 h-0.5 bg-slate-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;
