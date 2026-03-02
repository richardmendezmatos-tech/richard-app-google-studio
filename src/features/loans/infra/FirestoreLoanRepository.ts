import { db } from '../../../infra/firebase/client';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Prestamo, SolicitudPrestamo } from '../domain/Loan';

/**
 * Adaptador de Infraestructura para Préstamos (Firebase)
 * Implementa la persistencia cumpliendo con Clean Architecture.
 */
export class FirestoreLoanRepository {
  private collectionName = 'loans';

  /**
   * Registra un nuevo intento de aprobación/préstamo
   */
  async save(prestamo: Omit<Prestamo, 'id' | 'fechaCreacion'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...prestamo,
        fechaCreacion: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving loan to Firestore:', error);
      throw new Error('No se pudo guardar la información del préstamo.');
    }
  }

  /**
   * Obtiene préstamos por solicitante
   */
  async getBySolicitante(solicitanteId: string): Promise<Prestamo[]> {
    const q = query(
      collection(db, this.collectionName),
      where('solicitanteId', '==', solicitanteId),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: (data.fechaCreacion as Timestamp).toDate(),
      } as Prestamo;
    });
  }
}

export const loanRepository = new FirestoreLoanRepository();
