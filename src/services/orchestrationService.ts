import { Lead } from '@/features/leads/services/crmService';
import { VehicleHealthStatus } from '@/types/types';
import { calculateLeadScore, ScoringResult } from './leadScoringService';
import { AGENTS, AgentPersona } from './agentSystem';

export interface OrchestrationAction {
    agentId: AgentPersona;
    message: string;
    priority: ScoringResult['priority'];
    reasoning: string;
    suggestedAction: string;
}

/**
 * Orchestration Service
 * Coordinates multiple agents to provide a unified, intelligent response to leads.
 */
class OrchestrationService {
    /**
     * Analyzes a lead and its vehicle health to generate an orchestrated action package.
     */
    async orchestrateLeadFollowUp(
        lead: Lead,
        health: VehicleHealthStatus | null
    ): Promise<OrchestrationAction> {
        // 1. Get Score & Priority
        const scoring = calculateLeadScore(lead, health);

        // 2. Determine Primary Agent
        let agentId: AgentPersona = 'ricardo'; // Default Sales
        let reasoning = 'Seguimiento de ventas estándar.';
        let suggestedAction = 'Enviar catálogo actualizado.';

        if (health?.overallStatus === 'critical') {
            agentId = 'mateo';
            reasoning = 'El vehículo presenta una falla crítica. Se requiere intervención técnica antes de la venta.';
            suggestedAction = 'Ofrecer cita técnica prioritaria y descuento en reparación/trade-in.';
        } else if (lead.type === 'trade-in' && scoring.score > 70) {
            agentId = 'sofia';
            reasoning = 'Lead de alta intención con interés en trade-in. Enfoque financiero.';
            suggestedAction = 'Presentar pre-cualificación y oferta de toma de vehículo.';
        } else if (scoring.score > 90) {
            agentId = 'jordan';
            reasoning = 'Lead extremadamente caliente. Requiere cierre inmediato.';
            suggestedAction = 'Llamada de cierre con bono de reserva hoy mismo.';
        }

        // 3. Generate Personalized Message (using Copilot Service for LLM reasoning)
        const agent = AGENTS[agentId];
        const healthContext = health ? `Su vehículo tiene un estado de ${health.overallStatus} con alertas: ${health.alerts.map(a => a.message).join(', ')}.` : '';

        // AI Orchestration 2.0: Context Injection
        let memoryNudge = '';
        if (lead.customerMemory) {
            const prefs = lead.customerMemory.preferences;
            if (prefs?.models && prefs.models.length > 0) {
                memoryNudge = `Recuerdo que te interesaban modelos como ${prefs.models.join(', ')}. `;
            }
            if (lead.customerMemory.lifestyle) {
                memoryNudge += `Teniendo en cuenta tu perfil de ${lead.customerMemory.lifestyle}, `;
            }
        }

        const message = `Hola ${lead.name}, soy ${agent.name} de Richard Automotive. ${memoryNudge}${healthContext} Quisiera conversar sobre cómo podemos ayudarte con esto y las opciones para tu próximo auto.`;

        return {
            agentId,
            message,
            priority: scoring.priority,
            reasoning,
            suggestedAction
        };
    }

    /**
     * AI Orchestration 2.0: Preference Extraction
     * Simple heuristic-based extraction of user preferences from message context.
     * In a real system, this would use a dedicated LLM call (Gemini).
     */
    extractLeadPreferences(lead: Lead, message: string): Lead['customerMemory'] {
        const memory = lead.customerMemory || {
            preferences: { models: [], colors: [], features: [] },
            historicalContext: []
        };

        const lowerMsg = message.toLowerCase();

        // Heuristic: Car models
        const modelKeywords = ['tucson', 'tacoma', 'civic', 'corolla', 'rav4', 'f150', 'mustang'];
        modelKeywords.forEach(model => {
            if (lowerMsg.includes(model) && !memory.preferences?.models?.includes(model)) {
                memory.preferences = {
                    ...memory.preferences,
                    models: [...(memory.preferences?.models || []), model]
                };
            }
        });

        // Heuristic: Lifestyle
        if (lowerMsg.includes('familia') || lowerMsg.includes('hijos')) {
            memory.lifestyle = 'Family-oriented';
        } else if (lowerMsg.includes('trabajo') || lowerMsg.includes('carga')) {
            memory.lifestyle = 'Professional/Work';
        } else if (lowerMsg.includes('monte') || lowerMsg.includes('4x4')) {
            memory.lifestyle = 'Off-road enthusiast';
        }

        memory.lastInteractionSummary = `Interés detectado en el mensaje: "${message.substring(0, 50)}..."`;

        return memory;
    }
}

export const orchestrationService = new OrchestrationService();
