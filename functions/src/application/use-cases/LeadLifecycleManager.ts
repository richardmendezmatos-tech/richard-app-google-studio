import { CRMRepository, LeadTransition } from '../../domain/repositories/CRMRepository';
import { LeadStatus } from '../../services/leadLifecycleService';

export interface LeadLifecycleInput {
    leadId: string;
    status: LeadStatus;
    score?: number;
    assignedAgent?: string;
    lossReason?: string;
    saleId?: string;
    amount?: number;
    source?: string;
}

export interface LeadLifecycleResult {
    message: string;
    status: string;
}

/**
 * Use Case: Lead Lifecycle Manager
 * Handles transitions and CRM sync for business development.
 */
export class LeadLifecycleManager {
    constructor(private crmRepo: CRMRepository) { }

    async processTransition(input: LeadLifecycleInput): Promise<LeadLifecycleResult> {
        try {
            const message = this.generateStatusMessage(input);

            const transition: LeadTransition = {
                leadId: input.leadId,
                fromStatus: 'UNKNOWN', // Ideally tracked in state
                toStatus: input.status,
                timestamp: new Date(),
                score: input.score,
                metadata: {
                    assignedAgent: input.assignedAgent,
                    lossReason: input.lossReason,
                    saleId: input.saleId,
                    amount: input.amount,
                    source: input.source
                }
            };

            await this.crmRepo.recordTransition(transition);

            return { message, status: "SUCCESS" };
        } catch (error) {
            console.error(`[LeadLifecycle] Error processing transition for ${input.leadId}`, error);
            return {
                message: "Error procesando transición. Modo resiliencia activado.",
                status: "RESILIENCE_MODE"
            };
        }
    }

    private generateStatusMessage(input: LeadLifecycleInput): string {
        switch (input.status) {
            case 'new':
                return `Nuevo lead desde ${input.source || 'web'} recibido. Activando secuencia de contacto.`;
            case 'qualified':
                return `Lead calificado con ${input.score}. Asignado a ${input.assignedAgent || 'Richard'} para cierre inmediato.`;
            case 'sold':
                return `VENTA CERRADA! Referencia: ${input.saleId}. Monto: $${input.amount?.toFixed(2)}. Registrando en CRM.`;
            case 'lost':
                return `Oportunidad perdida. Motivo: ${input.lossReason || 'Desconocido'}`;
            default:
                return `Estado del lead actualizado a ${input.status}.`;
        }
    }
}
