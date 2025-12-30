
import React, { useState } from 'react';
import { ViewMode } from '../types';
import Sidebar from './Sidebar';
import ChatView from './ChatView';
import CodeLab from './CodeLab';
import ImageView from './ImageView';
import VideoView from './VideoView';
import VoiceAssistantView from './VoiceAssistantView';
import DevOpsView from './DevOpsView';

interface Props {
    onExit: () => void;
    onVisualSearch: (base64: string) => void;
}

const AILabView: React.FC<Props> = ({ onExit, onVisualSearch }) => {
  const [labView, setLabView] = useState<ViewMode>(ViewMode.CHAT);

  const renderContent = () => {
    switch (labView) {
      case ViewMode.CHAT:
        return <ChatView />;
      case ViewMode.CODE_ANALYZER:
        return <CodeLab />;
      case ViewMode.IMAGES:
        return <ImageView onSearchSimilar={onVisualSearch} />;
      case ViewMode.VIDEO_STUDIO:
        return <VideoView />;
      case ViewMode.VOICE_ASSISTANT:
        return <VoiceAssistantView />;
      case ViewMode.DEVOPS:
        return <DevOpsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden animate-in fade-in duration-500">
      <Sidebar currentView={labView} setView={setLabView} onExit={onExit} />
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Top Header Area specific to Lab */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
             <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${labView === ViewMode.VOICE_ASSISTANT ? 'bg-green-500 animate-pulse' : 'bg-[#00aed9]'}`}></div>
                 <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                     System Status: Online | Model: Gemini 2.5/3.0
                 </span>
             </div>
             <div className="text-xs font-bold text-slate-500">RICHARD AI LABS</div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AILabView;
