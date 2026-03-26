import { useState, useEffect, useCallback } from 'react';
import { voiceService } from '@/features/ai-hub/voice-command/api/voiceService';
import { getAIResponse } from '@/shared/api/ai';
import { validationAgentService } from '@/features/ai-hub';

// Icons
const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a-3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.509v4.242a.75.75 0 01-1.5 0v-4.242A6.751 6.751 0 016 12.75v-1.5a.75.75 0 01.75-.75z" />
  </svg>
);

const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
      clipRule="evenodd"
    />
  </svg>
);

const Waveform = () => {
  const bars = [1, 2, 3, 4, 3, 2, 1];
  // Pre-generate stable random targets to maintain component purity
  const randomHeights = [12, 8, 16, 10, 14, 11, 9];

  return (
    <div className="flex items-center gap-1 h-4">
      {bars.map((_, i) => (
        <div
          key={i}
          className="w-1 bg-white rounded-full animate-pulse audio-bar-height"
          style={
            {
              '--bar-height': `${randomHeights[i]}px`,
              '--delay': `${i * 100}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

interface VoiceWidgetProps {
  onMessage?: (text: string, sender: 'user' | 'bot') => void;
}

import { VoiceCommandService } from '@/features/ai-hub/voice-command/api/VoiceCommandService';
import { useNavigate } from 'react-router-dom';

export const VoiceWidget = ({ onMessage }: VoiceWidgetProps) => {
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isSupported, setIsSupported] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
  }, []);

  const handleMicClick = useCallback(() => {
    if (state === 'speaking') {
      voiceService.stopListening(); // Actually stops implementation
      window.speechSynthesis.cancel();
      setState('idle');
      return;
    }

    if (state === 'listening') {
      voiceService.stopListening();
      setState('idle');
      return;
    }

    // START LISTENING
    setState('listening');
    voiceService.startListening({
      lang: 'es-US',
      onResult: async (text) => {
        console.log('Heard:', text);
        setState('thinking');

        // Show user message
        if (onMessage) onMessage(text, 'user');

        try {
          // 1. Try to parse intent first
          const intent = await VoiceCommandService.parseCommand(text);

          if (intent && intent.confidence >= 0.7) {
            console.log('[VoiceWidget] Intent recognized:', intent);
            VoiceCommandService.executeAction(intent, {
              navigate: (path) => navigate(path),
              setTab: (tab) => localStorage.setItem('admin_active_tab', tab),
              setSearch: (query) => {
                // If on storefront, this might not trigger a re-render unless we use query params
                // For now, save to localStorage and navigate to root
                localStorage.setItem('inventory_filter', query);
                navigate(`/?q=${encodeURIComponent(query)}`);
              },
            });

            // Acknowledge the command execution
            const ackMsg = 'Navegando ahora.';
            if (onMessage) onMessage(ackMsg, 'bot');
            setState('speaking');
            await voiceService.speak(ackMsg);
          } else {
            // 2. Fall back to conversational Gemini
            const rawResponse = await getAIResponse(
              text,
              [],
              [],
              'Responde brevemente para ser hablado.',
            );

            // Validation Agent Audit (Voice optimized check)
            const validation = await validationAgentService.validateResponse(text, rawResponse, []);
            const response = validation.sanitizedResponse;

            // Show bot message
            if (onMessage) onMessage(response, 'bot');

            // Speak response
            setState('speaking');
            await voiceService.speak(response);
          }
        } catch (e) {
          console.error('AI Error', e);
        } finally {
          setState('idle');
        }
      },
      onEnd: () => {
        // Reset if needed
        // if (state === 'listening') setState('idle');
      },
      onError: (e) => {
        console.error('Voice Error', e);
        setState('idle');
      },
    });
  }, [state, navigate, onMessage]);

  useEffect(() => {
    if (isSupported && state === 'idle') {
      handleMicClick();
    }
    return () => {
      voiceService.stopListening();
      window.speechSynthesis.cancel();
    };
  }, [isSupported, state, handleMicClick]);

  if (!isSupported) return null;

  return (
    <div className="relative">
      {state !== 'idle' && (
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/40 p-4 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-white/10 animate-in fade-in slide-in-from-top-4 duration-300 min-w-[220px]">
          <div className="relative z-10">
            {state === 'listening' && (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium tracking-wide text-white/90">Hearing...</span>
                <Waveform />
              </div>
            )}
            {state === 'thinking' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-400 animate-pulse">
                  Richard is thinking...
                </span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                </div>
              </div>
            )}
            {state === 'speaking' && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-sm font-medium text-cyan-400">Richard is responding</span>
              </div>
            )}
          </div>
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};
