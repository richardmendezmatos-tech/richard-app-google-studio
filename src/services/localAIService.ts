/**
 * PHASE 11: Local AI Provider (Ollama Integration)
 * This service handles communication with a local inference engine.
 */

interface LocalSearchParams {
    model?: string;
    temperature?: number;
    stream?: boolean;
}

const OLLAMA_HOST = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3:8b-instruct-q4_K_M'; // Optimized for M1 8GB

export const localAIService = {
    /**
     * Check if Ollama is running locally.
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${OLLAMA_HOST}/api/tags`);
            return response.ok;
        } catch {
            return false;
        }
    },

    /**
     * Generate text using local Ollama instance.
     */
    async generateText(prompt: string, systemPrompt?: string, options: LocalSearchParams = {}): Promise<string> {
        try {
            const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: options.model || DEFAULT_MODEL,
                    prompt,
                    system: systemPrompt,
                    stream: options.stream || false,
                    options: {
                        temperature: options.temperature ?? 0.1,
                    }
                }),
            });

            if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Local AI Error:', error);
            throw error;
        }
    },

    /**
     * Identifies if a prompt contains sensitive F&I data that should remain local.
     */
    isSensitive(prompt: string): boolean {
        const sensitivePatterns = [
            /seguro de vida/i,
            /crédito/i,
            /financiamiento/i,
            /ssn/i,
            /seguro social/i,
            /préstamo/i,
            /banco/i,
            /estado financiero/i,
            /ingresos/i
        ];
        return sensitivePatterns.some(pattern => pattern.test(prompt));
    }
};
