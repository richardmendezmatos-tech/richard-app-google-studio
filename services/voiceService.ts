
// Types for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export interface VoiceConfig {
    lang: string;
    onResult: (text: string) => void;
    onEnd: () => void;
    onError: (error: any) => void;
}

export class VoiceService {
    private recognition: any;
    private synthesis: SpeechSynthesis;
    private isListening: boolean = false;
    private voice: SpeechSynthesisVoice | null = null;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.initRecognition();
        this.loadVoice();
    }

    private initRecognition() {
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

        if (SpeechRecognitionConstructor) {
            this.recognition = new SpeechRecognitionConstructor();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'es-US'; // Default to Spanish
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }

    private loadVoice() {
        // Try to load a high-quality Spanish voice
        const load = () => {
            const voices = this.synthesis.getVoices();
            // Prefer Google Español or Microsoft
            this.voice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google')) ||
                voices.find(v => v.lang.startsWith('es')) ||
                voices[0];
        };

        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = load;
        }
        load();
    }

    public startListening(config: VoiceConfig) {
        if (!this.recognition) return;

        this.recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            config.onResult(text);
        };

        this.recognition.onerror = (event: any) => {
            config.onError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            config.onEnd();
        };

        try {
            this.recognition.start();
            this.isListening = true;
        } catch (e) {
            console.error("Voice start error", e);
        }
    }

    public stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    public speak(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!text) {
                resolve();
                return;
            }

            // Cancel previous speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            if (this.voice) utterance.voice = this.voice;

            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(e);

            this.synthesis.speak(utterance);
        });
    }

    public isSupported(): boolean {
        return !!((window as unknown as IWindow).webkitSpeechRecognition || (window as unknown as IWindow).SpeechRecognition);
    }
}

export const voiceService = new VoiceService();
