import {
    collection,
    query,
    where,
    limit,
    getDocs,
    doc,
    getDoc
} from 'firebase/firestore/lite';
import { db } from '../firebase/client';
import { InventoryRepository } from '@domain/repositories/InventoryRepository';
import { Car } from '@domain/entities';

export class FirestoreInventoryRepository implements InventoryRepository {
    private collectionName = 'cars';

    async getInventory(dealerId: string, limitCount: number = 100): Promise<Car[]> {
        const q = query(
            collection(db, this.collectionName),
            where('dealerId', '==', dealerId),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Car));
    }

    async getCarById(id: string): Promise<Car | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as Car;
    }
}
