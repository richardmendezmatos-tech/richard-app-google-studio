import { Car } from '../domain/entities';
import { InventoryMatcher, MatchResultDTO } from '../application/use-cases/inventory/InventoryMatcher.usecase';
import { FirestoreLeadRepository } from '../infrastructure/persistence/firestore/FirestoreLeadRepository';
import * as logger from 'firebase-functions/logger';
import { logFlowExecution } from './persistenceService';

/**
 * Service to proactively match new inventory units with potential leads.
 * Part of the Richard Automotive Command Center.
 * [REFAC] Using Clean Architecture Use Case & Repository with Result Pattern.
 */
export class InventoryMatchingService {

    /**
     * Finds potential matches for a new car and "notifies" the system/agent.
     */
    static async matchInventoryToLeads(carId: string, carData: any): Promise<MatchResultDTO[]> {
        logger.info(`🔍 Proactive Matching [CLEAN]: Looking for candidates for ${carData.name} (${carId})...`);

        try {
            // 1. Initialize Clean Architecture Components
            const leadRepository = new FirestoreLeadRepository();
            const matcher = new InventoryMatcher(leadRepository);

            // 2. Execute Use Case (Handles Result Pattern)
            const result = await matcher.execute(carId, carData as Car);

            if (result.isFailure()) {
                logger.error(`❌ Error executing InventoryMatcher for ${carId}:`, result.error);
                return [];
            }

            const matches = result.value;

            // 3. Log result for Command Center Dashboard
            const output = {
                carId,
                carName: carData.name,
                matchesFound: matches.length,
                matches
            };

            await logFlowExecution('proactiveMatching', { carId, carData }, output);

            if (matches.length > 0) {
                logger.info(`🎯 Found ${matches.length} matches for ${carData.name}!`);
            }

            return matches;

        } catch (error) {
            logger.error(`❌ Unexpected Error in Proactive Matching for ${carId}:`, error);
            return [];
        }
    }
}
