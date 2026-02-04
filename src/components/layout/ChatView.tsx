
import React, { useState, useRef, useEffect } from 'react';
import { generateText } from '@/services/geminiService';
import { ChatMessage } from '@/types/types';
import { Bot, Sparkles } from 'lucide-react';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await generateText(input);
    const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 lg:p-8">
      <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-full">
              <Bot size={48} className="text-[#00aed9]/50" />
            </div>
            <p className="text-lg font-medium">¡Hola! Listo para comenzar a conversar.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${msg.role === 'user'
              ? 'bg-[#00aed9] text-white rounded-tr-none'
              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
              }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              <span className="text-[10px] opacity-50 mt-2 block">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-5 py-3 border border-slate-700">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregúntale cualquier cosa a Richard IA..."
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition-all shadow-xl"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#00aed9] hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-xl transition-colors shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatView;
