import { z } from 'genkit';
import { CRMRepository, LeadTransition } from '../../../domain/repositories';
import { Result, success, failure } from '../../../domain/types';

/**
 * Esquema de entrada estricto para la gestión del ciclo de vida (Gold Standard).
 */
export const LeadLifecycleInputSchema = z.object({
    leadId: z.string(),
    status: z.enum(['new', 'contacted', 'qualified', 'negotiating', 'sold', 'lost', 'pre-approved']),
    score: z.number().optional(),
    assignedAgent: z.string().optional(),
    lossReason: z.string().optional(),
    saleId: z.string().optional(),
    amount: z.number().optional(),
    source: z.string().optional()
});

export type LeadLifecycleInput = z.infer<typeof LeadLifecycleInputSchema>;

export const LeadLifecycleResultSchema = z.object({
    message: z.string(),
    status: z.string()
});

export type LeadLifecycleResult = z.infer<typeof LeadLifecycleResultSchema>;

/**
 * Use Case: Lead Lifecycle Manager
 * Handles transitions and CRM sync for business development.
 */
export class LeadLifecycleManager {
    constructor(private crmRepo: CRMRepository) { }

    /**
     * Procesa una transición de estado en el ciclo de vida del lead.
     */
    async processTransition(input: LeadLifecycleInput): Promise<Result<LeadLifecycleResult>> {
        try {
            const message = this.generateStatusMessage(input);

            const transition: LeadTransition = {
                leadId: input.leadId,
                fromStatus: 'UNKNOWN', // En una versión futura, esto se recuperaría del estado actual
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

            return success({ message, status: "SUCCESS" });
        } catch (error) {
            console.error(`[LeadLifecycle] Error processing transition for ${input.leadId}`, error);
            return failure(error instanceof Error ? error : new Error(String(error)));
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
