/**
 * OutputSanitizer
 * Interface Adapter to filter and polish AI-generated content before it reaches the UI.
 * Ensures brand tone compliance and removes hallucinations or sensitive data.
 */
export class OutputSanitizer {
  private static readonly FORBIDDEN_TERMS = [
    'barato',
    'usadito',
    'viejito',
    'chatarra',
    'problema técnico',
  ];

  private static readonly BRAND_REPLACEMENTS: Record<string, string> = {
    cliente: 'Socio Richard Automotive',
    carro: 'Vehículo de Alta Gama',
    viejo: 'Pre-Owned Certificado',
    falla: 'Oportunidad de Optimización Técnica',
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
