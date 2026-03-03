import { collection, doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/infra/firebase/client';

/**
 * Transacción Atómica "Venta Blindada"
 * Garantiza que:
 * 1. El vehículo esté disponible.
 * 2. Se marque como 'reservado' o 'vendido'.
 * 3. Se cree la aplicación de venta ligada al auto.
 * 4. Se incremente el contador de ventas del dealer.
 * Todo sucede o falla en conjunto.
 */
export const executeSecureSale = async (carId: string, leadData: any, dealerId: string) => {
  try {
    await runTransaction(db, async (transaction) => {
      const carRef = doc(db, 'cars', carId);
      const dealerRef = doc(db, 'metadata', `stats_${dealerId}`);

      // 1. Verificar disponibilidad del auto
      const carSnap = await transaction.get(carRef);
      if (!carSnap.exists()) throw new Error('Vehículo no existe');

      const carData = carSnap.data();
      if (carData.status === 'sold' || carData.status === 'reserved') {
        throw new Error('El vehículo ya no está disponible');
      }

      // 2. Crear referencia para la aplicación (Lead de Venta)
      const appCollection = collection(db, 'applications');
      const appRef = doc(appCollection);

      // 3. Ejecutar actualizaciones atómicas
      transaction.update(carRef, {
        status: 'reserved',
        reservedAt: serverTimestamp(),
        lastLeadId: appRef.id,
      });

      transaction.set(appRef, {
        ...leadData,
        carId,
        dealerId,
        type: 'sale_reservation',
        createdAt: serverTimestamp(),
        status: 'pending_deposit',
      });

      // 4. Actualizar metadatos del dealer (Optimización de Lecturas)
      transaction.set(
        dealerRef,
        {
          totalSalesPending: increment(1),
          lastUpdate: serverTimestamp(),
        },
        { merge: true },
      );
    });

    console.log('Transacción de venta completada con éxito');
    return { success: true, appId: '...' }; // En producción retornaríamos el ID generado
  } catch (error: any) {
    console.error('Fallo en transacción de venta:', error);
    return { success: false, error: error.message };
  }
};
