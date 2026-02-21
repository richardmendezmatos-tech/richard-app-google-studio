import { db } from './firebaseAdmin';
import * as logger from 'firebase-functions/logger';
import { logFlowExecution } from './persistenceService';

export interface MatchResult {
    leadId: string;
    leadName: string;
    matchScore: number;
    reason: string;
}

/**
 * Service to proactively match new inventory units with potential leads.
 * Part of the Richard Automotive Command Center.
 */
export class InventoryMatchingService {

    /**
     * Finds potential matches for a new car and "notifies" the system/agent.
     */
    static async matchInventoryToLeads(carId: string, carData: any): Promise<MatchResult[]> {
        logger.info(`🔍 Proactive Matching: Looking for candidates for ${carData.name} (${carId})...`);

        try {
            // For now, let's fetch HOT leads from Firestore to find potential buyers
            const hotLeadsSnapshot = await db.collection('applications')
                .where('category', '==', 'HOT')
                .limit(10)
                .get();

            const matches: MatchResult[] = [];

            for (const doc of hotLeadsSnapshot.docs) {
                const lead = doc.data();

                // Simple matching logic: Check if lead's preferred type or brand matches
                // In a more advanced version, we'd use vector embeddings of lead preferences
                let matchScore = 0;
                let reason = "";

                if (lead.preferredType === carData.type) {
                    matchScore += 40;
                    reason += `Busca un ${carData.type}. `;
                }

                if (lead.budget >= (carData.price * 0.9)) {
                    matchScore += 30;
                    reason += `Presupuesto compatible. `;
                }

                if (matchScore >= 40) {
                    matches.push({
                        leadId: doc.id,
                        leadName: lead.fullName || "Cliente Anónimo",
                        matchScore,
                        reason: reason.trim()
                    });
                }
            }

            // 2. Log result for Command Center Dashboard
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
            logger.error(`❌ Error in Proactive Matching for ${carId}:`, error);
            return [];
        }
    }
}
