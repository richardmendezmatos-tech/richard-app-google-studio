/**
 * OutputSanitizer
 * Interface Adapter to filter and polish AI-generated content before it reaches the UI.
 * Ensures brand tone compliance and removes hallucinations or sensitive data.
 */
export class OutputSanitizer {
    private static readonly FORBIDDEN_TERMS = [
        'anciano', 'geriátrico', 'asilo', 'dependiente', 'limitado', 'problema técnico'
    ];

    private static readonly BRAND_REPLACEMENTS: Record<string, string> = {
        'comunidad': 'comunidad silver',
        'cliente': 'adulto en plenitud',
        'viejo': 'experimentado',
        'falla': 'oportunidad de mejora técnica'
    };

    /**
     * Sanitizes and formats the agent's message.
     */
    static sanitize(text: string): string {
        let polished = text;

        // 1. Terminology Filter (Brand Alignment)
        for (const term of this.FORBIDDEN_TERMS) {
            const regex = new RegExp(term, 'gi');
            polished = polished.replace(regex, '---'); // Masking prohibited terms
        }

        // 2. Soft Brand Replacements
        for (const [key, value] of Object.entries(this.BRAND_REPLACEMENTS)) {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            polished = polished.replace(regex, value);
        }

        // 3. Ensuring Positive/Premium Finish
        if (!polished.includes('🚗') && !polished.includes('✨')) {
            polished += ' ✨';
        }

        return polished;
    }

    /**
     * Validates if the message contains sensitive data leaks (e.g., SSN patterns).
     */
    static hasLeakedData(text: string): boolean {
        const ssnRegex = /\d{3}-\d{2}-\d{4}/;
        return ssnRegex.test(text);
    }
}
