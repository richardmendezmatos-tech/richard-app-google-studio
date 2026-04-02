"use client";

import React, { useState } from 'react';
import { Bot, Mic, Image as ImageIcon, Video, Code2, ArrowLeft } from 'lucide-react';
import SEO from '@/shared/ui/seo/SEO';

// Lazy load the underlying views for performance
const ChatView = React.lazy(() => import('./views/ChatView'));
const VoiceAssistantView = React.lazy(() => import('./views/VoiceAssistantView'));
const ImageView = React.lazy(() => import('./views/ImageView'));
const VideoView = React.lazy(() => import('./views/VideoView'));
const SandboxView = React.lazy(() => import('./views/SandboxView'));

type AILabTab = 'chat' | 'voice' | 'vision' | 'video' | 'sandbox';

const tabs: { id: AILabTab; label: string; icon: React.FC<any>; color: string }[] = [
  { id: 'chat', label: 'Consultor AI', icon: Bot, color: 'text-cyan-400' },
  { id: 'voice', label: 'Asistente de Voz', icon: Mic, color: 'text-emerald-400' },
  { id: 'vision', label: 'Visión Computacional', icon: ImageIcon, color: 'text-purple-400' },
  { id: 'video', label: 'Generación Dinámica', icon: Video, color: 'text-rose-400' },
  { id: 'sandbox', label: 'Developer Sandbox', icon: Code2, color: 'text-amber-400' },
];

export const AILabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AILabTab>('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatView />;
      case 'voice':
        return <VoiceAssistantView />;
      case 'vision':
        return <ImageView onSearchSimilar={() => {}} />;
      case 'video':
        return <VideoView />;
      case 'sandbox':
        return <SandboxView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d2232] text-white">
      <SEO
        title="Richard AI Lab"
        description="Centro experimental de inteligencia artificial generativa, asistentes de voz y visión computacional."
      />

      {/* Header FSD */}
      <header className="px-6 py-4 bg-slate-900/80 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              Richard <span className="text-primary">AI Lab</span>
            </h1>
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] uppercase font-black tracking-widest rounded-full border border-primary/30">
              Beta Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
            Centro de Comando Inteligente
          </p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 overflow-x-auto w-full md:w-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'opacity-50'} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        {/* Futuristic Background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-20"></div>
        <div className="relative z-10 w-full h-full">
          <React.Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-[50vh] text-primary animate-pulse space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-widest text-primary/70">
                  Instanciando Motor IA...
                </p>
              </div>
            }
          >
            {renderContent()}
          </React.Suspense>
        </div>
      </main>
    </div>
  );
};

export default AILabPage;
