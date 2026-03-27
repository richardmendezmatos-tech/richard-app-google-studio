import React, { useState } from 'react';
import { Lead } from '@/shared/api/adapters/leads/crmService';
import { X, Send, Bot, User, Phone, Mail, MessageCircle, Clock, Wand2, ShieldCheck } from 'lucide-react';

interface Props {
  lead: Lead;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent' | 'ai';
  channel: 'whatsapp' | 'email' | 'chat';
  text: string;
  timestamp: Date;
}

// Mocked conversations for demonstration
const mockConversation: Message[] = [
  {
    id: 'm1',
    sender: 'user',
    channel: 'chat',
    text: 'Hola, me interesa la Tacoma.',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'm2',
    sender: 'ai',
    channel: 'chat',
    text: '¡Hola! Claro que sí. Tenemos varias Tacomas TRD Sport. ¿Buscas 4x4 o 4x2?',
    timestamp: new Date(Date.now() - 3500000),
  },
  {
    id: 'm3',
    sender: 'user',
    channel: 'whatsapp',
    text: '4x4 preferiblemente. ¿Tienen financiamiento?',
    timestamp: new Date(Date.now() - 1000000),
  },
];

export const OmnichannelInbox: React.FC<Props> = ({ lead, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(mockConversation);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [aiAssist, setAiAssist] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      channel: activeChannel,
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white font-black text-xl">
              {lead.name?.charAt(0) || lead.firstName?.charAt(0) || 'L'}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {lead.name || `${lead.firstName} ${lead.lastName}`}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Phone size={10} /> {lead.phone || 'Sin número'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Mail size={10} /> {lead.email || 'Sin correo'}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
                  Score: {lead.aiScore || 0}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Cerrar chat"
            title="Cerrar ventana de chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-[#0B1120] custom-scrollbar">
          {messages.map((msg) => {
            const isMe = msg.sender === 'agent';
            const isUser = msg.sender === 'user';
            const isAi = msg.sender === 'ai';

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {msg.channel === 'whatsapp' ? (
                      <MessageCircle size={10} className="text-emerald-500" />
                    ) : msg.channel === 'email' ? (
                      <Mail size={10} className="text-blue-500" />
                    ) : (
                      <MessageCircle size={10} className="text-purple-500" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {isUser ? 'Cliente' : isAi ? 'Houston IA' : 'Asesor'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    isMe 
                      ? 'bg-slate-800 text-white rounded-tr-sm dark:bg-primary dark:text-slate-900 font-medium' 
                      : isAi
                        ? 'bg-purple-100 text-purple-900 rounded-tl-sm dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                        : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          
          {/* Channel Selector */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Responder vía:</span>
            <button 
              onClick={() => setActiveChannel('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeChannel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'}`}
            >
              <MessageCircle size={12} /> WhatsApp
            </button>
            <button 
              onClick={() => setActiveChannel('email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeChannel === 'email' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'}`}
            >
              <Mail size={12} /> Email
            </button>
            <div className="flex-1" />
            <button 
              onClick={() => setAiAssist(!aiAssist)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${aiAssist ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 dark:bg-slate-900'}`}
            >
              <Bot size={12} className={aiAssist ? "animate-pulse" : ""} /> IA Copilot
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={aiAssist ? "Houston IA está sugiriendo una respuesta..." : `Escribe tu mensaje para ${lead.name || 'el cliente'}...`}
                className={`w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3 px-4 text-sm resize-none focus:ring-2 transition-all ${aiAssist ? 'focus:ring-purple-500 placeholder-purple-300' : 'focus:ring-primary'}`}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              {aiAssist && !inputText && (
                <div className="absolute top-3 left-4 text-sm text-purple-500/50 italic pointer-events-none flex items-center gap-2">
                  <Wand2 size={14} className="animate-spin-slow" /> Sugiriendo respuesta basada en score {lead.aiScore}...
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-12 h-12 bg-primary hover:bg-slate-800 dark:bg-primary dark:hover:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
              aria-label="Enviar mensaje"
              title="Enviar"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black flex items-center justify-center gap-1">
              <ShieldCheck size={10} /> Richard Automotive SECURE OMNICHANNEL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmnichannelInbox;
