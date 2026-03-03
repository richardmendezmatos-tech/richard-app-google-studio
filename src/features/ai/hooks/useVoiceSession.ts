import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectToVoiceSession } from '@/services/geminiService';
import { VoiceCommandService } from '@/services/VoiceCommandService';
import { LiveServerMessage, Blob as GeminiBlob } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '@/utils/audioUtils';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type Transcription = { id: number; role: 'user' | 'model'; text: string; isFinal: boolean };

type RealtimeSession = {
  close: () => void;
  sendRealtimeInput: (payload: { media: GeminiBlob }) => void;
};

type ServerContent = {
  outputTranscription?: { text: string };
  inputTranscription?: { text: string };
  turnComplete?: boolean;
  modelTurn?: {
    parts?: Array<{
      inlineData?: { data?: string };
    }>;
  };
};

export const useVoiceSession = () => {
  const navigate = useNavigate();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const sessionPromise = useRef<Promise<RealtimeSession> | null>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const inputNode = useRef<ScriptProcessorNode | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  const nextStartTime = useRef(0);
  const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const transcriptionIdCounter = useRef(0);

  const stopSession = async () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }
    if (inputNode.current) {
      inputNode.current.disconnect();
      inputNode.current = null;
    }
    if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
      await inputAudioContext.current.close();
    }
    if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
      await outputAudioContext.current.close();
    }
    if (sessionPromise.current) {
      try {
        const session = await sessionPromise.current;
        session.close();
      } catch {
        /* Session already closed */
      }
      sessionPromise.current = null;
    }
    setConnectionState('disconnected');
    setIsListening(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    try {
      setConnectionState('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      inputAudioContext.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      outputAudioContext.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });

      sessionPromise.current = connectToVoiceSession({
        onopen: () => {
          setConnectionState('connected');
          const source = inputAudioContext.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (event) => {
            setIsListening(true);
            const inputData = event.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.current!.destination);
          inputNode.current = scriptProcessor;
        },
        onmessage: async (message: LiveServerMessage) => {
          handleTranscription(message);
          handleAudio(message);
        },
        onerror: (e: Event) => {
          console.error('Session error:', e);
          setConnectionState('error');
          stopSession();
        },
        onclose: () => {
          stopSession();
        },
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      setConnectionState('error');
    }
  };

  const handleTranscription = (message: LiveServerMessage) => {
    const content = message.serverContent as ServerContent | undefined;
    if (content?.outputTranscription) {
      const { text } = content.outputTranscription;
      currentOutputTranscriptionRef.current += text;
      updateTranscription('model', currentOutputTranscriptionRef.current, false);
    } else if (content?.inputTranscription) {
      const { text } = content.inputTranscription;
      currentInputTranscriptionRef.current += text;
      updateTranscription('user', currentInputTranscriptionRef.current, false);
    }

    if (content?.turnComplete) {
      const finalUserText = currentInputTranscriptionRef.current;

      setTranscriptions((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (!last.isFinal) {
          const updated = [...prev];
          updated[prev.length - 1] = { ...last, isFinal: true };
          return updated;
        }
        return prev;
      });

      // Process Voice Command
      if (finalUserText.trim()) {
        VoiceCommandService.parseCommand(finalUserText).then((intent) => {
          if (intent) {
            setLastAction(intent.action.type);
            VoiceCommandService.executeAction(intent, {
              navigate: (path) => navigate(path),
              setTab: (tab) => localStorage.setItem('admin_active_tab', tab),
              setSearch: (query) => localStorage.setItem('inventory_filter', query),
            });
            setTimeout(() => setLastAction(null), 3000);
          }
        });
      }

      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
      setIsListening(false);
    }
  };

  const updateTranscription = (role: 'user' | 'model', text: string, isFinal: boolean) => {
    setTranscriptions((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && !last.isFinal) {
        const updatedTranscriptions = [...prev];
        updatedTranscriptions[prev.length - 1] = { ...last, text, isFinal };
        return updatedTranscriptions;
      } else {
        transcriptionIdCounter.current++;
        return [...prev, { id: transcriptionIdCounter.current, role, text, isFinal }];
      }
    });
  };

  const handleAudio = async (message: LiveServerMessage) => {
    const content = message.serverContent as ServerContent | undefined;
    const audioData = content?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      setIsSpeaking(true);
      const audioBuffer = await decodeAudioData(
        decode(audioData),
        outputAudioContext.current!,
        24000,
        1,
      );
      const source = outputAudioContext.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.current!.destination);

      source.onended = () => {
        audioSources.current.delete(source);
        if (audioSources.current.size === 0) setIsSpeaking(false);
      };

      const currentTime = outputAudioContext.current!.currentTime;
      nextStartTime.current = Math.max(nextStartTime.current, currentTime);
      source.start(nextStartTime.current);
      nextStartTime.current += audioBuffer.duration;
      audioSources.current.add(source);
    }
  };

  return {
    connectionState,
    transcriptions,
    isSpeaking,
    isListening,
    lastAction,
    startSession,
    stopSession,
  };
};
