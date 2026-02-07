import * as logger from 'firebase-functions/logger';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'sold' | 'lost';

export interface LeadState {
    status: LeadStatus;
    score?: number;
    assignedAgent?: string;
    lossReason?: string;
    saleId?: string;
    amount?: number;
    source?: string;
    timestamp?: Date;
}

/**
 * LeadLifecycleService: Unificación de lógica de estados (Migrado de Java)
 * Implementa resiliencia y trazabilidad de transiciones.
 */
export class LeadLifecycleService {

    static async processTransition(leadId: string, newState: LeadState): Promise<string> {
        logger.info(`Processing transition for lead ${leadId} to ${newState.status}`);

        // Simulación de "Circuit Breaker" lógico
        try {
            const result = this.generateStatusMessage(newState);

            // Registro en historial de transiciones (Reemplaza a LeadTransitionEvent.java)
            const { db } = await import('./firebaseAdmin');
            await db.collection('applications').doc(leadId).collection('transitions').add({
                fromStatus: newState.status, // En una implementación real, traeríamos el estado anterior
                toStatus: newState.status,
                timestamp: new Date(),
                score: newState.score || 0,
                processedBy: 'LeadLifecycleService-TS'
            });

            return result;
        } catch (error) {
            logger.error(`Error in LeadLifecycleService transition for ${leadId}`, error);
            return "Error procesando transición. Modo resiliencia activado.";
        }
    }

    private static generateStatusMessage(state: LeadState): string {
        switch (state.status) {
            case 'new':
                return `Nuevo lead desde ${state.source || 'web'} recibido. Activando secuencia de contacto.`;
            case 'qualified':
                return `Lead calificado con ${state.score}. Asignado a ${state.assignedAgent || 'Richard'} para cierre inmediato.`;
            case 'sold':
                return `VENTA CERRADA! Referencia: ${state.saleId}. Monto: $${state.amount?.toFixed(2)}. Registrando en CRM.`;
            case 'lost':
                return `Oportunidad perdida. Motivo: ${state.lossReason || 'Desconocido'}`;
            default:
                return `Estado del lead actualizado a ${state.status}.`;
        }
    }
}
