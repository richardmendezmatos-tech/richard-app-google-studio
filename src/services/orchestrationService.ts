import { Lead } from '@/features/leads/services/crmService';
import { VehicleHealthStatus } from '@/types/types';
import { calculateLeadScore, ScoringResult } from './leadScoringService';
import { AGENTS, AgentPersona } from './agentSystem';
import { copilotService } from './copilotService';

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
        const scoring = calculateLeadScore(lead as any, health);

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
        // For now, we use a template-based approach or simulate the LLM call.
        const agent = AGENTS[agentId];
        const healthContext = health ? `Su vehículo tiene un estado de ${health.overallStatus} con alertas: ${health.alerts.map(a => a.message).join(', ')}.` : '';

        const message = `Hola ${lead.name}, soy ${agent.name} de Richard Automotive. ${healthContext} Quisiera conversar sobre cómo podemos ayudarte con esto y las opciones para tu próximo auto.`;

        return {
            agentId,
            message,
            priority: scoring.priority,
            reasoning,
            suggestedAction
        };
    }
}

export const orchestrationService = new OrchestrationService();
