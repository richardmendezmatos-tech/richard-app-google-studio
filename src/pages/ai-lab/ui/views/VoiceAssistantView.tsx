import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Bot, Activity, Wifi, Cpu, Gauge, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceSession } from '@/features/ai-hub';
import { useTelemetry } from '@/features/houston';

const VoiceAssistantView: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    connectionState,
    transcriptions,
    isSpeaking,
    isListening,
    lastAction,
    startSession,
    stopSession,
  } = useVoiceSession();

  const telemetry = useTelemetry(connectionState);

  // Auto-scroll transcriptions
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  return (
    <div className="h-full flex flex-col items-center justify-between p-8 relative overflow-hidden bg-[#0a0f1a]">
      {/* Background Ambience / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0f1a] to-[#0a0f1a] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none opacity-20" />

      {/* Top Header - Houston Telemetry Panel */}
      <div className="flex w-full max-w-5xl justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <Wifi
              size={16}
              className={connectionState === 'connected' ? 'text-emerald-400' : 'text-slate-500'}
            />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              {connectionState}
            </span>
          </div>
          {connectionState === 'connected' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] font-mono text-primary ml-2"
            >
              <Radio size={12} className="animate-pulse" />
              LIVE STREAM ACTIVE
            </motion.div>
          )}
        </div>

        {/* Houston Telemetry Indicators */}
        <AnimatePresence>
          {connectionState === 'connected' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-end bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center gap-1">
                  <Gauge size={10} /> LATENCY
                </span>
                <span className="text-sm font-mono text-emerald-400">{telemetry.latency}ms</span>
              </div>
              <div className="flex flex-col items-end bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center gap-1">
                  <Cpu size={10} /> QOS
                </span>
                <span className="text-sm font-mono text-primary">{telemetry.quality}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center - AI Core Visualizer */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full min-h-[400px]">
        <div className="relative flex items-center justify-center">
          {/* Reactive Rings using framer-motion */}
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.5, 1.2] : isListening ? [1, 1.1, 1] : 1,
              opacity: isSpeaking ? [0.2, 0.5, 0.2] : 0.1,
              rotate: isSpeaking ? 180 : 0,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute w-[400px] h-[400px] border border-primary/30 rounded-full ${isListening ? 'border-emerald-500/30' : ''}`}
          />
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.05, 1] : 1,
              opacity: isSpeaking ? [0.4, 0.7, 0.4] : 0.2,
              rotate: isSpeaking ? -180 : 0,
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute w-[300px] h-[300px] border border-primary/40 rounded-full ${isListening ? 'border-emerald-500/40' : ''}`}
          />
          <motion.div
            animate={{
              scale: isSpeaking ? [0.9, 1.1, 0.9] : isListening ? 0.95 : 1,
              boxShadow: isSpeaking
                ? [
                    '0 0 60px rgba(0,174,217,0.4)',
                    '0 0 120px rgba(0,174,217,0.8)',
                    '0 0 60px rgba(0,174,217,0.4)',
                  ]
                : '0 0 40px rgba(0,174,217,0.2)',
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-36 h-36 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center z-20 relative overflow-hidden ${isListening ? 'ring-4 ring-emerald-500/50' : ''}`}
          >
            {/* Inner AI Sparkle */}
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full mix-blend-overlay" />
            <Bot size={48} className="text-white drop-shadow-2xl z-10" />
          </motion.div>

          {/* Connection Spinner */}
          {connectionState === 'connecting' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="absolute w-44 h-44 border-4 border-primary/20 border-t-primary rounded-full"
            />
          )}

          {/* Action Feedback Overlay */}
          <AnimatePresence>
            {lastAction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                className="absolute top-0 z-50 flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm flex gap-2 items-center">
                    ACTON TRIGGERED: {lastAction}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom - Transcripts & Controls */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center gap-6 mb-4">
        {/* Transcript Glass Panel */}
        <div className="w-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent z-10 h-12 bottom-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-transparent to-transparent z-10 h-8 top-0 pointer-events-none" />

          <div
            ref={scrollRef}
            className="h-[200px] overflow-y-auto space-y-4 px-6 scroll-smooth scrollbar-hide"
          >
            {transcriptions.length === 0 && connectionState === 'connected' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-slate-500 gap-3"
              >
                <Activity size={24} className="animate-pulse text-primary/50" />
                <p className="uppercase tracking-widest text-xs font-bold">
                  Esperando comando de la unidad...
                </p>
              </motion.div>
            )}
            <AnimatePresence>
              {transcriptions.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-4 rounded-3xl shadow-lg backdrop-blur-xl border ${
                      t.role === 'user'
                        ? 'bg-white/10 text-slate-100 rounded-br-sm border-white/10'
                        : 'bg-primary/15 text-primary rounded-bl-sm border-primary/20'
                    }`}
                  >
                    <p className="text-base md:text-lg font-medium leading-relaxed tracking-wide">
                      {t.text}
                    </p>
                    {!t.isFinal && (
                      <span className="inline-block w-2 h-2 rounded-full bg-current opacity-50 animate-pulse ml-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Master Control */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={
              connectionState === 'disconnected' || connectionState === 'error'
                ? startSession
                : stopSession
            }
            className={`
              relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-500
              ${
                connectionState === 'connected'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:text-red-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : 'bg-white text-[#0a0f1a] hover:bg-slate-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]'
              }
            `}
            disabled={connectionState === 'connecting'}
          >
            {connectionState === 'connected' ? (
              <MicOff size={28} />
            ) : (
              <Mic size={28} className="ml-1" />
            )}
            {connectionState === 'connecting' && (
              <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            )}
          </motion.button>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              {connectionState === 'connected' ? 'SECURE CONNECTION ACTIVE' : 'VAULT VOICE ENGINE'}
            </p>
            {connectionState === 'connected' && (
              <p
                className="text-xs text-red-400/80 mt-1 cursor-pointer hover:text-red-400"
                onClick={stopSession}
              >
                Disconnect
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantView;
