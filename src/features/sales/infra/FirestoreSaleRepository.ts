import { db } from '@/infra/firebase/client';
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  increment,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { SaleRepository } from '../domain/repositories/SaleRepository';
import { Venta } from '../domain/Venta';

/**
 * Implementación de Firestore para el repositorio de Ventas.
 * Mueve la lógica atómica de 'secureSaleService.ts' a un componente de infraestructura.
 */
export class FirestoreSaleRepository implements SaleRepository {
  async isUnidadAvailable(unidadId: string): Promise<boolean> {
    const carRef = doc(db, 'cars', unidadId);
    const carSnap = await getDoc(carRef);

    if (!carSnap.exists()) return false;

    const data = carSnap.data();
    return data.status !== 'sold' && data.status !== 'reserved';
  }

  async executeTransaction(saleData: Omit<Venta, 'id' | 'fechaVenta'>): Promise<string> {
    const saleId = await runTransaction(db, async (transaction) => {
      const carRef = doc(db, 'cars', saleData.unidadId);
      const saleCollection = collection(db, 'sales');
      const saleDocRef = doc(saleCollection);

      // 1. Bloqueo y actualización de la Unidad (Marcado como vendido para consistencia)
      transaction.update(carRef, {
        status: 'sold',
        lastSaleId: saleDocRef.id,
        updatedAt: serverTimestamp(),
      });

      // 2. Registro de la Venta
      transaction.set(saleDocRef, {
        ...saleData,
        createdAt: serverTimestamp(),
        status: 'completada',
      });

      return saleDocRef.id;
    });

    // 3. Incremento de métricas en el Sentinel (Fuera de la transacción para evitar contención)
    const sentinelRef = doc(db, 'sentinel', `CommandCenter_${saleData.vendedorId}`);
    // No esperamos a que termine para no bloquear la respuesta de la venta
    setDoc(
      sentinelRef,
      {
        totalSales: increment(1),
        lastSaleAt: serverTimestamp(),
      },
      { merge: true },
    ).catch((err: Error) => console.error('Sentinel update failed:', err));

    return saleId as string;
  }
}

export const firestoreSaleRepository = new FirestoreSaleRepository();
