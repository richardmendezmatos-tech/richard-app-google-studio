import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Send, Save, RotateCcw, Trash2, Mic, MicOff, Camera, UserCircle2 } from 'lucide-react';
import { getAIResponse } from '@/services/geminiService';
import { AI_LEGAL_DISCLAIMER } from '@/services/firebaseShared';
import { addLead } from '@/features/leads/services/crmService';
import { sendWhatsAppMessage } from '@/features/leads/services/whatsappService';
import { getPaginatedCars } from '@/features/inventory/services/inventoryService';
import type { Car } from '@/types/types';

type ChatMessage = {
  role: 'user' | 'bot';
  text: string;
};

type FaceMode = 'bot' | 'photo' | 'webcam';
type ActionKind = 'create_lead' | 'search_inventory' | 'send_whatsapp';

const STORAGE_KEYS = {
  personaName: 'digital_twin_persona_name',
  instructions: 'digital_twin_instructions',
  chat: 'digital_twin_chat_history',
  faceMode: 'digital_twin_face_mode',
  facePhoto: 'digital_twin_face_photo'
};

const DEFAULT_PERSONA_NAME = 'Richard Mendez';
const DEFAULT_INSTRUCTIONS = `Tu rol: asesor automotriz y financiero.
Objetivo: convertir conversaciones en acciones concretas (cita, llamada, pre-calificacion).
Estilo: directo, profesional y en espanol claro.
Reglas:
1) Si falta contexto, pregunta 1-2 datos clave.
2) Da pasos accionables, no solo teoria.
3) No inventes datos tecnicos o financieros exactos.`;

const parseField = (text: string, keys: string[]): string | null => {
  for (const key of keys) {
    const pattern = new RegExp(`${key}\\s*[:=]\\s*([^,;\\n]+)`, 'i');
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
};

const normalizePhone = (value: string | null): string | null => {
  if (!value) return null;
  const clean = value.replace(/[^\d+]/g, '');
  return clean.length >= 7 ? clean : null;
};

const detectAction = (text: string): { kind: ActionKind; payload: Record<string, string> } | null => {
  const lower = text.toLowerCase();

  if (lower.startsWith('/lead') || lower.includes('crear lead') || lower.includes('nuevo lead')) {
    return {
      kind: 'create_lead',
      payload: {
        name: parseField(text, ['nombre', 'name']) || '',
        phone: parseField(text, ['telefono', 'phone', 'tel']) || '',
        email: parseField(text, ['email', 'correo']) || '',
        interest: parseField(text, ['interes', 'interest', 'vehiculo']) || ''
      }
    };
  }

  if (lower.startsWith('/inventario') || lower.includes('buscar inventario') || lower.includes('buscar auto')) {
    return {
      kind: 'search_inventory',
      payload: {
        query: parseField(text, ['q', 'query', 'buscar', 'modelo', 'tipo']) || text.replace('/inventario', '').trim()
      }
    };
  }

  if (lower.startsWith('/whatsapp') || lower.includes('enviar whatsapp') || lower.includes('enviar seguimiento')) {
    return {
      kind: 'send_whatsapp',
      payload: {
        phone: parseField(text, ['telefono', 'phone', 'tel']) || '',
        message: parseField(text, ['mensaje', 'message', 'msg']) || ''
      }
    };
  }

  return null;
};

const formatCars = (cars: Car[]): string => {
  if (cars.length === 0) return 'No encontre unidades con ese criterio.';
  return cars
    .slice(0, 5)
    .map((car, idx) => `${idx + 1}. ${car.name} - $${(car.price || 0).toLocaleString()}${car.type ? ` (${car.type})` : ''}`)
    .join('\n');
};

const buildSystemPrompt = (personaName: string, instructions: string) => `
Eres la version digital de ${personaName}.
Debes obedecer estas instrucciones operativas:
${instructions}

Cuando respondas:
- Resume intencion del usuario en 1 linea.
- Propone siguiente paso concreto.
- Mantente en contexto de negocio automotriz/financiamiento salvo que el usuario pida otro tema.

Acciones reales disponibles:
- crear lead
- buscar inventario
- enviar seguimiento por WhatsApp
`;

const loadInitialChat = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.chat);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const DigitalTwinDashboard: React.FC = () => {
  const [personaName, setPersonaName] = useState(() => localStorage.getItem(STORAGE_KEYS.personaName) || DEFAULT_PERSONA_NAME);
  const [instructions, setInstructions] = useState(() => localStorage.getItem(STORAGE_KEYS.instructions) || DEFAULT_INSTRUCTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadInitialChat());
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [faceMode, setFaceMode] = useState<FaceMode>(() => (localStorage.getItem(STORAGE_KEYS.faceMode) as FaceMode) || 'bot');
  const [facePhoto, setFacePhoto] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.facePhoto));
  const [faceError, setFaceError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const systemPrompt = useMemo(() => buildSystemPrompt(personaName, instructions), [personaName, instructions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.personaName, personaName);
  }, [personaName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.instructions, instructions);
  }, [instructions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.faceMode, faceMode);
  }, [faceMode]);

  useEffect(() => {
    if (facePhoto) localStorage.setItem(STORAGE_KEYS.facePhoto, facePhoto);
    else localStorage.removeItem(STORAGE_KEYS.facePhoto);
  }, [facePhoto]);

  useEffect(() => {
    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    if (faceMode !== 'webcam') {
      stopStream();
      return;
    }

    const startWebcam = async () => {
      try {
        setFaceError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('No se pudo activar la camara:', error);
        setFaceError('No pude acceder a la camara. Verifica permisos del navegador.');
        setFaceMode('bot');
      }
    };

    startWebcam();
    return stopStream;
  }, [faceMode]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!speakEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveProfile = () => {
    localStorage.setItem(STORAGE_KEYS.personaName, personaName);
    localStorage.setItem(STORAGE_KEYS.instructions, instructions);
  };

  const handleResetProfile = () => {
    setPersonaName(DEFAULT_PERSONA_NAME);
    setInstructions(DEFAULT_INSTRUCTIONS);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.chat);
  };

  const handleFaceUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setFacePhoto(result);
        setFaceMode('photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || isThinking) return;

    const nextMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(nextMessages);
    setInput('');
    setIsThinking(true);

    try {
      const action = detectAction(userText);

      if (action) {
        if (action.kind === 'create_lead') {
          const name = action.payload.name.trim();
          const phone = normalizePhone(action.payload.phone);
          const email = action.payload.email.trim();
          const interest = action.payload.interest.trim();

          if (!name) {
            setMessages((prev) => [...prev, { role: 'bot', text: 'Para crear el lead necesito al menos `nombre:`.' }]);
            return;
          }

          await addLead({
            type: 'chat',
            name,
            phone: phone || undefined,
            email: email || undefined,
            vehicleOfInterest: interest || undefined,
            notes: 'Creado por Agente Digital'
          });

          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              text: `Lead creado: ${name}${phone ? ` | Tel: ${phone}` : ''}${interest ? ` | Interes: ${interest}` : ''}`
            }
          ]);
          return;
        }

        if (action.kind === 'search_inventory') {
          const queryText = action.payload.query.toLowerCase().trim();
          const { cars } = await getPaginatedCars(40, null, 'all', null);
          const filtered = queryText
            ? cars.filter((car) =>
                `${car.name || ''} ${car.type || ''} ${car.badge || ''}`.toLowerCase().includes(queryText)
              )
            : cars;

          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              text: `Resultado inventario${queryText ? ` para "${queryText}"` : ''}:\n${formatCars(filtered)}`
            }
          ]);
          return;
        }

        if (action.kind === 'send_whatsapp') {
          const phone = normalizePhone(action.payload.phone);
          const message = action.payload.message.trim();

          if (!phone || !message) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'bot',
                text: 'Para WhatsApp necesito `telefono:` y `mensaje:`.'
              }
            ]);
            return;
          }

          const result = await sendWhatsAppMessage(phone, message);
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              text: result.success
                ? `WhatsApp enviado a ${phone}. ID: ${result.messageId || 'N/A'}`
                : `No se pudo enviar WhatsApp: ${result.error || 'Error desconocido'}`
            }
          ]);
          return;
        }
      }

      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, text: m.text }));
      const response = await getAIResponse(userText, [], history, systemPrompt);
      setMessages((prev) => [...prev, { role: 'bot', text: response }]);
      speak(response);
    } catch (error) {
      console.error('Digital twin chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'No pude responder ahora mismo. Intenta nuevamente en unos segundos.' }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
      <aside className="w-full max-w-md border-r border-slate-800 bg-slate-900/70 backdrop-blur p-6 space-y-5">
        <div className="flex items-center gap-3">
          {faceMode === 'photo' && facePhoto ? (
            <img src={facePhoto} alt="Tu rostro" className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              {faceMode === 'webcam' ? <Camera size={20} /> : <Bot size={20} />}
            </div>
          )}
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider">Agente Digital</h1>
            <p className="text-xs text-slate-400">Usando tu cara en foto o webcam</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nombre de la Persona</label>
          <input
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value)}
            placeholder="Ej: Richard Mendez"
            className="w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Instrucciones del Agente</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full min-h-[220px] rounded-xl bg-black/40 border border-slate-700 px-3 py-3 text-sm outline-none focus:border-cyan-500"
            placeholder="Define tono, reglas y objetivos"
          />
          <p className="text-[10px] text-slate-500">
            Comandos: `/lead nombre:... telefono:... interes:...`, `/inventario q:...`, `/whatsapp telefono:... mensaje:...`
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSaveProfile}
            className="py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Save size={14} /> Guardar
          </button>
          <button
            onClick={handleResetProfile}
            className="py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => setSpeakEnabled((v) => !v)}
            className="py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {speakEnabled ? <Mic size={14} /> : <MicOff size={14} />} Voz
          </button>
          <button
            onClick={handleClearChat}
            className="py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Limpiar Chat
          </button>
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rostro del Agente</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFaceMode('bot')}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${faceMode === 'bot' ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
            >
              Bot
            </button>
            <label className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border text-center cursor-pointer ${faceMode === 'photo' ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
              Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFaceUpload(e.target.files?.[0] || null)}
              />
            </label>
            <button
              onClick={() => setFaceMode('webcam')}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border ${faceMode === 'webcam' ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
            >
              Webcam
            </button>
          </div>
          {facePhoto && (
            <button
              onClick={() => {
                setFacePhoto(null);
                if (faceMode === 'photo') setFaceMode('bot');
              }}
              className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider border bg-red-500/10 border-red-500/30 text-red-300"
            >
              Eliminar Foto
            </button>
          )}
          {faceError && <p className="text-[11px] text-red-400">{faceError}</p>}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="border-b border-slate-800 p-4">
          <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/70">
            {faceMode === 'webcam' ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-56 object-cover" />
            ) : faceMode === 'photo' && facePhoto ? (
              <img src={facePhoto} alt="Tu rostro digital" className="w-full h-56 object-cover" />
            ) : (
              <div className="w-full h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
                <UserCircle2 size={44} />
                <p className="text-sm">Selecciona Foto o Webcam para usar tu cara</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Escribe una instruccion para empezar a entrenar tu version digital.
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-100'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && <p className="text-slate-500 text-sm animate-pulse">Procesando respuesta...</p>}
        </div>

        <div className="border-t border-slate-800 p-4 space-y-3">
          <div className="flex items-start gap-2 text-[11px] text-slate-500 italic leading-tight">
            {AI_LEGAL_DISCLAIMER}
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Dale una instruccion a tu version digital..."
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 flex items-center justify-center"
              aria-label="Enviar"
              title="Enviar"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DigitalTwinDashboard;
