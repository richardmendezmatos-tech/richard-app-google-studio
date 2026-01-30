import { useState, useEffect } from 'react';
import { voiceService } from '../../services/voiceService';
import { getAIResponse } from '../../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a-3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.509v4.242a.75.75 0 01-1.5 0v-4.242A6.751 6.751 0 016 12.75v-1.5a.75.75 0 01.75-.75z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

const Waveform = () => {
    const bars = [1, 2, 3, 4, 3, 2, 1];
    // Pre-generate stable random targets to maintain component purity
    const randomHeights = [12, 8, 16, 10, 14, 11, 9];

    return (
        <div className="flex items-center gap-1 h-4">
            {bars.map((scale, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-white rounded-full"
                    animate={{ height: [4, randomHeights[i], 4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    style={{ height: 4 + scale * 2 }}
                />
            ))}
        </div>
    );
};

interface VoiceWidgetProps {
    onMessage?: (text: string, sender: 'user' | 'bot') => void;
}

export const VoiceWidget = ({ onMessage }: VoiceWidgetProps) => {
    const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported(voiceService.isSupported());
    }, []);

    const handleMicClick = () => {
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
                console.log("Heard:", text);
                setState('thinking');

                // Show user message
                if (onMessage) onMessage(text, 'user');

                try {
                    // Send to Gemini
                    const response = await getAIResponse(text, [], [], "Responde brevemente para ser hablado.");

                    // Show bot message
                    if (onMessage) onMessage(response, 'bot');

                    // Speak response
                    setState('speaking');
                    await voiceService.speak(response);
                } catch (e) {
                    console.error("AI Error", e);
                } finally {
                    setState('idle');
                }
            },
            onEnd: () => {
                // Reset if needed
                // if (state === 'listening') setState('idle'); 
            },
            onError: (e) => {
                console.error("Voice Error", e);
                setState('idle');
            }
        });
    };

    if (!isSupported) return null;

    return (
        <div className="fixed bottom-6 right-28 z-[1001]">
            <AnimatePresence>
                {state !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-16 right-0 bg-black/80 backdrop-blur-md text-white p-3 rounded-xl mb-2 whitespace-nowrap border border-white/10 shadow-2xl"
                    >
                        {state === 'listening' && <div className="flex items-center gap-2">Listening... <Waveform /></div>}
                        {state === 'thinking' && <span className="animate-pulse">Thinking... 🧠</span>}
                        {state === 'speaking' && <span className="text-cyan-400">Richard is speaking...</span>}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMicClick}
                className={`p-4 rounded-full shadow-lg border-2 backdrop-blur-md transition-all ${state === 'listening'
                    ? 'bg-red-500/90 border-red-400 animate-pulse'
                    : 'bg-indigo-600/90 border-indigo-400 hover:bg-indigo-500'
                    }`}
            >
                <div className="text-white">
                    {state === 'listening' ? <StopIcon /> : <MicIcon />}
                </div>
            </motion.button>
        </div>
    );
};
