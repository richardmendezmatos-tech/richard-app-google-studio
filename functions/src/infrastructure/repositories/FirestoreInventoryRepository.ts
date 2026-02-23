import { db } from '../../services/firebaseAdmin';
import { InventoryRepository } from '../../domain/repositories/InventoryRepository';
import { Car } from '../../domain/entities';
import { FieldValue } from 'firebase-admin/firestore';

export class FirestoreInventoryRepository implements InventoryRepository {
    async getById(id: string): Promise<Car | null> {
        const doc = await db.collection('cars').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Car;
    }

    async updateEmbedding(id: string, embedding: number[]): Promise<void> {
        await db.collection('cars').doc(id).update({
            embedding: FieldValue.vector(embedding),
            updatedAt: FieldValue.serverTimestamp(),
        });
    }
}
