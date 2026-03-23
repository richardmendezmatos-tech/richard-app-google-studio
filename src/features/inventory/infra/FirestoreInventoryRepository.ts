import { InventoryRepository } from '../domain/InventoryRepository';
import { Unidad } from '../domain/Unidad';
import { db } from '@/shared/api/firebase/client';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

export class FirestoreInventoryRepository implements InventoryRepository {
  private readonly collectionName = 'inventory';

  async save(unidad: Unidad): Promise<void> {
    await setDoc(doc(db, this.collectionName, unidad.id), {
      ...unidad,
      updatedAt: new Date(),
    });
  }

  async findById(id: string): Promise<Unidad | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Unidad) : null;
  }

  async findAll(): Promise<Unidad[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map((doc) => doc.data() as Unidad);
  }

  async updateStatus(id: string, estado: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, { estado, updatedAt: new Date() });
  }
}

export const inventoryRepository = new FirestoreInventoryRepository();
