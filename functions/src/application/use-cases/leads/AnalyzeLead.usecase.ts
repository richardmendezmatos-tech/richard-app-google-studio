import { z } from 'genkit';
import { InventoryRepository } from '../../../domain/repositories';
import { ScoreCalculator } from './ScoreCalculator.usecase';
import { Lead, LeadEntity } from '../../../domain/entities';
import { Result, success, failure } from '../../../domain/types';

/**
 * DTO de salida estricto para la capa de aplicación (Gold Standard).
 */
export const AnalyzeLeadOutputSchema = z.object({
    score: z.number(),
    category: z.enum(['HOT', 'WARM', 'COLD']),
    insights: z.array(z.string()),
    unidad_interes: z.string(),
    nextAction: z.string(),
    isHighPotential: z.boolean(),
    reasoning: z.string()
});

export type AnalyzeLeadOutput = z.infer<typeof AnalyzeLeadOutputSchema>;

export class AnalyzeLead {
    constructor(private inventoryRepo: InventoryRepository) { }

    /**
     * Ejecuta el análisis de un lead, orquestando infraestructura y lógica de dominio.
     */
    async execute(input: Partial<Lead>): Promise<Result<AnalyzeLeadOutput>> {
        let unidad_interes = input.vehicleId || "General";

        try {
            // 1. Obtener contexto de infraestructura (si aplica)
            if (input.vehicleId) {
                const car = await this.inventoryRepo.getById(input.vehicleId);
                if (car) {
                    unidad_interes = `${car.year} ${car.make} ${car.model}`;
                }
            }

            // 2. Utilizar Entidad de Dominio para lógica enriquecida
            const leadEntity = LeadEntity.create(input as Lead);

            // 3. Calcular scoring (Interactor)
            const scoringResult = ScoreCalculator.execute(input);

            // 4. Retorno exitoso con DTO validado
            return success({
                score: scoringResult.score,
                category: scoringResult.category,
                insights: scoringResult.insights,
                unidad_interes,
                nextAction: scoringResult.nextAction,
                isHighPotential: leadEntity.isHighPotential(),
                reasoning: scoringResult.reasoning
            });
        } catch (error) {
            console.error("Error fatal en AnalyzeLead UseCase:", error);
            return failure(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
