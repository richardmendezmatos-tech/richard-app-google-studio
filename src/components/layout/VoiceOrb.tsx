
import React, { useEffect, useState } from 'react';
import { voiceService } from '@/services/voiceService';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceOrb: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        const unsubStatus = voiceService.onStatusChange(setIsListening);
        const unsubResult = voiceService.onResult((text: string, isFinal: boolean) => {
            setTranscript(text);
            if (isFinal) {
                setTimeout(() => setTranscript(''), 2000);
            }
        });

        return () => {
            unsubStatus();
            unsubResult();
        };
    }, []);

    return (
        <AnimatePresence>
            {isListening && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none"
                >
                    {/* The Orb */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 blur-md animate-pulse"></div>
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-cyan-200 opacity-50 animate-ping"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                        </div>
                    </div>

                    {/* Transcript or Prompt */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-premium px-6 py-2 rounded-full border border-cyan-500/30 text-center"
                    >
                        <p className="text-white font-black text-sm tracking-wide">
                            {transcript || "Escuchando..."}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceOrb;
