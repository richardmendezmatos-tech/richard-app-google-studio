
import React from 'react';
import { ViewMode } from '../types';
import { MessageSquare, Code, ImageIcon, Settings, FlaskConical, Clapperboard, MicVocal, ArrowLeft, Github } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  onExit: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onExit }) => {
  const navItems = [
    { id: ViewMode.CHAT, label: 'Neural Chat', icon: <MessageSquare size={20} /> },
    { id: ViewMode.VOICE_ASSISTANT, label: 'Voice Core', icon: <MicVocal size={20} /> },
    { id: ViewMode.IMAGES, label: 'Image Forge', icon: <ImageIcon size={20} /> },
    { id: ViewMode.VIDEO_STUDIO, label: 'Video Studio', icon: <Clapperboard size={20} /> },
    { id: ViewMode.CODE_ANALYZER, label: 'Code Architect', icon: <Code size={20} /> },
    { id: ViewMode.DEVOPS, label: 'DevOps Architect', icon: <Github size={20} /> },
  ];

  return (
    <aside className="w-20 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 gap-3 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <FlaskConical size={20} />
          </div>
          <span className="hidden lg:block text-lg font-black tracking-tight text-white">AI LABS</span>
        </div>
        
        <div className="px-3 space-y-2">
            {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-4 rounded-xl transition-all duration-200 group relative ${
                currentView === item.id 
                    ? 'bg-[#00aed9] text-white shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
                <div className="min-w-[24px] flex justify-center">{item.icon}</div>
                <span className="hidden lg:block font-bold text-sm tracking-wide">{item.label}</span>
                {currentView === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
            </button>
            ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onExit}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
              <ArrowLeft size={20} />
              <span className="hidden lg:block font-bold text-sm">Volver a Tienda</span>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
