/**
 * RA-Voice Bridge: Integrated Voice-to-Command Service
 *
 * Maps natural language intents from the VoiceAssistant to
 * specific application actions and state changes.
 */

import { parseVoiceIntent } from './aiService';

export type VoiceAction =
  | { type: 'NAVIGATE'; payload: { path: string; tab?: string } }
  | { type: 'SEARCH'; payload: { query: string; category?: string } }
  | { type: 'ACTION'; payload: { action: string; targetId?: string } }
  | { type: 'DASHBOARD_UPDATE'; payload: { filter: string } }
  | { type: 'UPDATE_FILTER'; payload: { filter: string } };

export interface CommandIntent {
  action: VoiceAction;
  confidence: number;
  originalText: string;
}

export const VoiceCommandService = {
  /**
   * Parse transcription text into an actionable intent
   */
  async parseCommand(text: string): Promise<CommandIntent | null> {
    const query = text.toLowerCase().trim();

    // 1. Navigation Commands
    if (/(ir a|abre|mostrar|ve a|ver)/i.test(query)) {
      if (/(pipeline|ventas|crm|oportunidades)/i.test(query)) {
        return {
          action: { type: 'NAVIGATE', payload: { path: '/admin', tab: 'pipeline' } },
          confidence: 0.95,
          originalText: text,
        };
      }
      if (/(inventario|stock|autos|unidades)/i.test(query)) {
        return {
          action: { type: 'NAVIGATE', payload: { path: '/admin', tab: 'inventory' } },
          confidence: 0.95,
          originalText: text,
        };
      }
      if (/(houston|terminal|telemetria|sentinel)/i.test(query)) {
        return {
          action: { type: 'NAVIGATE', payload: { path: '/admin/houston' } },
          confidence: 0.95,
          originalText: text,
        };
      }
      if (/(configuracion|ajustes|admin|panel)/i.test(query)) {
        return {
          action: { type: 'NAVIGATE', payload: { path: '/admin', tab: 'analytics' } },
          confidence: 0.9,
          originalText: text,
        };
      }
    }

    // 2. Search/Filter Commands
    if (/(busca|filtrar|encuentra|donde esta)/i.test(query)) {
      const remainingText = query.replace(/(busca|filtrar|encuentra|donde esta)/i, '').trim();
      if (remainingText) {
        return {
          action: { type: 'SEARCH', payload: { query: remainingText } },
          confidence: 0.85,
          originalText: text,
        };
      }
    }

    // 3. Filtering Commands (Inventory Age/Offers)
    if (/(ofertas|descuentos|promociones|bajos)/i.test(query)) {
      return {
        action: { type: 'UPDATE_FILTER', payload: { filter: 'offers' } },
        confidence: 0.9,
        originalText: text,
      };
    }
    if (/(viejos|antiguos|estancados|tiempo)/i.test(query)) {
      return {
        action: { type: 'UPDATE_FILTER', payload: { filter: 'aged' } },
        confidence: 0.9,
        originalText: text,
      };
    }

    // 4. Status/Query Commands
    if (/(como vamos|estado|resumen|analisis)/i.test(query)) {
      return {
        action: { type: 'NAVIGATE', payload: { path: '/admin', tab: 'dashboard' } },
        confidence: 0.8,
        originalText: text,
      };
    }

    // 5. LLM Fallback for complex routing/search
    console.log('[VoiceCommand] Falling back to LLM intent parser for:', query);
    try {
      const llmIntent = await parseVoiceIntent(text);
      if (llmIntent) {
        // Enforce confidence
        llmIntent.confidence = llmIntent.confidence || 0.8;
        return llmIntent;
      }
    } catch (error) {
      console.warn('[VoiceCommand] LLM Intent parsing failed:', error);
    }

    return null;
  },

  /**
   * Execute the identified action
   */
  executeAction(
    intent: CommandIntent,
    hooks: {
      navigate: (path: string) => void;
      setTab?: (tab: string) => void;
      setSearch?: (query: string) => void;
    },
  ) {
    console.log('[VoiceCommand] Executing:', intent);

    const { action } = intent;

    switch (action.type) {
      case 'NAVIGATE':
        hooks.navigate(action.payload.path);
        if (action.payload.tab && hooks.setTab) {
          hooks.setTab(action.payload.tab);
        }
        break;
      case 'SEARCH':
        if (hooks.setSearch) {
          hooks.setSearch(action.payload.query);
        }
        break;
      case 'UPDATE_FILTER':
        if (hooks.setSearch) {
          hooks.setSearch(action.payload.filter);
        }
        break;
      // Add more cases as needed
    }
  },
};
