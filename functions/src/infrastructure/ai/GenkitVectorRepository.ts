import { VectorRepository } from '../../domain/repositories';
import { Car } from '../../domain/entities';
import { ai } from '../../services/aiManager';
import { db } from '../../services/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export class GenkitVectorRepository implements VectorRepository {
    async generateEmbedding(text: string): Promise<number[]> {
        const embeddingResponse = await ai.embed({
            embedder: 'vertexai/text-embedding-004',
            content: text,
        });
        return embeddingResponse as any;
    }

    async semanticSearch(vector: number[], limit: number = 3): Promise<Car[]> {
        const snapshot = await (db.collection('cars') as any)
            .where('status', '==', 'available') // Pre-filter: Only retrieve available cars
            .findNearest('embedding', FieldValue.vector(vector), {
                limit: limit,
                distanceMeasure: 'COSINE'
            })
            .get();

        return snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async updateEmbedding(id: string, vector: number[]): Promise<void> {
        await db.collection('cars').doc(id).update({
            embedding: FieldValue.vector(vector),
            updatedAt: FieldValue.serverTimestamp(),
            version: '2.0.0', // Protocol Version
        });
    }
}
