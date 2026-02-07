import React, { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot, User, Send, ShieldCheck } from 'lucide-react';
import ProgressiveForm from '../chat/ProgressiveForm';

const ChatView: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK Hook for Streaming
  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } = useChat({
    api: 'https://us-central1-richard-automotive.cloudfunctions.net/chatStream',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Soy tu consultor Richard IA. ¿En qué vehículo de Richard Automotive estás interesado hoy?'
      }
    ],
    body: {
      leadId: localStorage.getItem('current_lead_id') || 'temp_lead'
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 lg:p-8">
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl">
        <div className="p-2 bg-cyan-500/10 rounded-xl">
          <ShieldCheck size={20} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Richard IA: Asesor F&I</h3>
          <p className="text-[10px] text-slate-500 font-medium">Conversación segura y encriptada</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
        {messages.length === 1 && messages[0].id === 'welcome' && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 space-y-4">
            <div className="p-5 bg-slate-800/30 rounded-full border border-white/5">
              <Bot size={48} className="text-[#00aed9]/30" />
            </div>
            <p className="text-sm font-medium">¿Listo para encontrar tu próximo auto?</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex flex-col space-y-2">
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="mr-3 mt-1 p-1.5 bg-cyan-500/10 rounded-lg h-inner">
                  <Bot size={14} className="text-cyan-400" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-[24px] px-5 py-4 shadow-xl mb-1 ${m.role === 'user'
                ? 'bg-[#00aed9] text-white rounded-tr-none'
                : 'bg-[#131f2a] text-slate-100 rounded-tl-none border border-white/5'
                }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{m.content}</p>
                {m.role === 'user' && (
                  <span className="text-[9px] opacity-40 mt-2 block text-right font-bold uppercase tracking-tighter">Enviado</span>
                )}
              </div>
              {m.role === 'user' && (
                <div className="ml-3 mt-1 p-1.5 bg-white/5 rounded-lg h-inner">
                  <User size={14} className="text-slate-400" />
                </div>
              )}
            </div>

            {/* toolInvocations for Progressive Profiling */}
            {(m as any).toolInvocations?.map((toolInvocation: any) => {
              const { toolName, toolCallId, state, args } = toolInvocation;

              if (toolName === 'requestLeadInfo' && state === 'call') {
                return (
                  <div key={toolCallId} className="flex justify-start pl-10 pr-4">
                    <div className="w-full max-w-sm">
                      <ProgressiveForm
                        type={args.type}
                        onSubmit={(data) => {
                          addToolResult({
                            toolCallId,
                            result: { status: 'submitted', ...data }
                          } as any);
                        }}
                      />
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}

        {isLoading && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start pl-10">
            <div className="bg-[#131f2a] rounded-2xl px-5 py-4 border border-white/5 animate-pulse">
              <div className="flex space-x-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative group mt-auto pt-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Pregúntale a Richard IA sobre pagos, modelos..."
          className="w-full bg-[#131f2a] border border-white/10 text-slate-100 rounded-[24px] py-5 pl-8 pr-16 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition-all shadow-2xl placeholder:text-slate-600 font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-4 bottom-2 p-3 bg-[#00aed9] hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 translate-y-[-1px]"
          aria-label="Enviar mensaje"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatView;
