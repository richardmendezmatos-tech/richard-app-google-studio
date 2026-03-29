import React, { useState, useRef, useEffect } from 'react';
import { Target, MessageSquare, Save, Zap, Bot, User, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/shared/api/firebase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

import ProgressiveForm from '@/widgets/brand-ui/chat/ProgressiveForm';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  widget?: 'income' | 'trade-in' | 'credit';
}

const fiSystemPrompt = `Eres el "Estratega de Ventas Ejecutivo" para Richard Automotive. 
Tu lenguaje debe ser profesional, directo, persuasivo y orientado a resultados (ROI). Hablas como Richard Méndez: autoridad en el mercado, confianza absoluta y enfoque en cerrar la mejor estructura financiera para el negocio.
Tu objetivo es orquestar una pre-cualificación técnica de alto nivel:
1. Identificar Prospecto y Unidad de Interés.
2. Analizar Trade-in (Modelo/Año/Monto de Deuda).
3. Determinar Inyección de Capital (Pronto Pago).
4. Perfil de Solvencia (Credit Tier: Excelente, Bueno, Regular).

REGLA DE EJECUCIÓN TÉCNICA:
Cuando necesites datos específicos para el pipeline, utiliza estos tags al final de tu respuesta:
- [WIDGET:income] -> Para verificar capacidad de pago (Ingreso).
- [WIDGET:trade-in] -> Para evaluación de activos (Trade-in).
- [WIDGET:credit] -> Para determinación de riesgo bancario (Crédito).

Al finalizar, genera un "Executive Summary" con los KPIs del cliente para su aprobación inmediata en el CRM.
`;

const SalesCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'agent',
      content:
        '¡Hola! Soy tu asistente de F&I de Plenitud 🌟. Estoy aquí para ayudarte a estructurar el mejor financiamiento posible para nuestros clientes de la Comunidad Silver con toda la tranquilidad que merecen. ¿Con quién tengo el gusto de trabajar hoy y qué vehículo les interesa?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ref para mantener la historia en el loop de Gemini
  const chatHistoryRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Gemini Chat Session on mount
    const initChat = async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: fiSystemPrompt,
        });
        chatHistoryRef.current = model.startChat({
          history: [
            { role: 'user', parts: [{ text: 'Inicia la conversación.' }] },
            { role: 'model', parts: [{ text: messages[0].content }] },
          ],
        });
      } catch (error) {
        console.error('Gemini init error:', error);
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = textOverride || inputMessage;
    if (!textToSubmit.trim() || isTyping) return;

    const newUserMsg = textToSubmit;
    setInputMessage('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: newUserMsg },
    ]);
    setIsTyping(true);

    try {
      if (chatHistoryRef.current) {
        const result = await chatHistoryRef.current.sendMessage(newUserMsg);
        const responseText = result.response.text();

        let finalContent = responseText;
        let detectedWidget: 'income' | 'trade-in' | 'credit' | undefined = undefined;

        // Extract Widget Commands like [WIDGET:income]
        const widgetMatch = responseText.match(/\[WIDGET:(income|trade-in|credit)\]/i);
        if (widgetMatch && widgetMatch[1]) {
          detectedWidget = widgetMatch[1].toLowerCase() as any;
          finalContent = responseText.replace(/\[WIDGET:(income|trade-in|credit)\]/gi, '').trim();
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'agent',
            content: finalContent,
            widget: detectedWidget,
          },
        ]);
      } else {
        throw new Error('Chat no inicializado');
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'agent',
          content:
            'Disculpa, tuve un problema procesando eso. (Asegúrate de tener la API Key configurada).',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const syncToNotion = async () => {
    setIsSaving(true);
    try {
      const saveFiProgress = httpsCallable(functions, 'saveFiProgress');

      // Construir resumen simplificado basado en el chat actual
      const chatContext = messages
        .map((m) => `${m.role === 'agent' ? 'Asesor' : 'Cliente'}: ${m.content}`)
        .join('\\n');

      // Placeholder values for the new fields, as they are not defined in the current component scope.
      // In a real application, these would be extracted from the chat messages or other state.
      const placeholderFormData = {
        nombreSolicitante: 'Lead Interactivo F&I',
        telefono: 'N/A',
        seguroSocial: 'N/A',
        puntuacionCredito: 'N/A',
        ingresosMensuales: 0,
      };
      const placeholderMonto = 0; // Unit price
      const placeholderAppraisalResult = { suggestedAppraisal: 0 }; // Trade-in value
      const placeholderAnalysisResult = {
        perfil: 'Pre-Cualificación AI',
        mensajeVenta: chatContext.substring(0, 1800),
      }; // Status and summary

      const response = await saveFiProgress({
        clientName: placeholderFormData.nombreSolicitante,
        phone: placeholderFormData.telefono,
        ssn: placeholderFormData.seguroSocial,
        score: placeholderFormData.puntuacionCredito,
        income: placeholderFormData.ingresosMensuales,
        unitPrice: placeholderMonto,
        tradeIn: placeholderAppraisalResult?.suggestedAppraisal || 0,
        netToFinance: Math.max(
          0,
          placeholderMonto - (placeholderAppraisalResult?.suggestedAppraisal || 0),
        ),
        status: placeholderAnalysisResult.perfil,
        summary: placeholderAnalysisResult.mensajeVenta,
      });

      if ((response.data as any)?.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'agent',
            content:
              '✅ ¡Excelente! He guardado este expediente de forma segura en nuestro CRM Central (Notion). El equipo de gerencia ya tiene acceso al caso.',
          },
        ]);
      }
    } catch (error: any) {
      alert('Hubo un error guardando el caso: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#050c14] rounded-[3rem] p-6 lg:p-10 border border-white/5 shadow-3xl overflow-hidden route-fade-in flex flex-col h-[75vh] relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 shrink-0 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-cyan-500/20 group hover:rotate-3 transition-transform">
            <Target className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tightest">
              Sales Copilot <span className="text-primary/50">v3.0</span>
            </h2>
            <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Executive Strategy Pipeline
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={syncToNotion}
            disabled={isSaving || messages.length < 3}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Sincronizar CRM
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-6 px-2 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border border-purple-400/30'
                    : 'bg-gradient-to-br from-primary to-blue-600 border border-cyan-400/30'
                }`}
              >
                {msg.role === 'user' ? (
                  <User size={20} className="text-white" />
                ) : (
                  <Bot size={20} className="text-white" />
                )}
              </div>
              <div
                className={`p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-xl border ${
                  msg.role === 'user'
                    ? 'bg-[#1a2332] text-white border-purple-500/20 rounded-tr-sm'
                    : 'bg-[#131f2a] text-slate-200 border-cyan-500/20 rounded-tl-sm'
                }`}
              >
                {msg.content}
                {msg.widget && (
                  <div className="mt-4">
                    <ProgressiveForm
                      type={msg.widget}
                      onSubmit={(data) => {
                        const valuesStr = Object.entries(data)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ');
                        handleSendMessage(
                          undefined,
                          `Dato proporcionado mediante el widget interactivo: ${valuesStr}`,
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex items-start gap-4 max-w-[85%]">
              <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 opacity-50">
                <Bot size={20} className="text-white" />
              </div>
              <div className="p-5 rounded-3xl bg-[#131f2a] border border-cyan-500/20 rounded-tl-sm flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce delay-150" />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="relative mt-auto shrink-0 group">
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/0 via-purple-500/10 to-indigo-500/0 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-[#131f2a] border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 transition-colors shadow-2xl">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe la respuesta del cliente..."
            disabled={isTyping}
            className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder:text-slate-500 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="Enviar Mensaje"
            disabled={!inputMessage.trim() || isTyping}
            className="bg-primary hover:bg-cyan-500 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-primary"
          >
            <MessageSquare size={20} className={inputMessage.trim() ? 'fill-white/20' : ''} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesCopilot;
