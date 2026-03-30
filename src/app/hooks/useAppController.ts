import { useState, useEffect, useCallback } from 'react';
import { Car } from '@/entities/shared';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { useAuthListener } from '@/features/auth';
import { useCars } from '@/features/inventory';
import { useCarMutations } from '@/features/inventory';

import { startGeofenceMonitoring } from '@/shared/api/location/geofenceService';
import { uploadInitialInventory } from '@/entities/inventory/api/adapters/inventoryService';
import { initialInventoryData } from '@/entities/inventory';
import {
  requestNotificationPermission,
  onForegroundMessage,
} from '@/shared/api/communications/notificationService';

export const useAppController = () => {
  console.log('🌟 [AppController] Initializing...');
  const [pendingVisualSearch, setPendingVisualSearch] = useState<string | null>(null);

  // Hooks initialization
  useAuthListener();

  // Data Query
  const { data } = useCars(12);
  const inventory = data?.pages.flatMap((page) => page.cars) || [];

  // Mutations
  const { addCar, updateCar, deleteCar } = useCarMutations();
  const { addNotification } = useNotification();

  // Lifecycle: Global Services
  useEffect(() => {
    startGeofenceMonitoring();

    // Phase 22: Push Notifications
    const setupNotifications = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        addNotification('success', '🔔 Notificaciones activadas.');
      }

      onForegroundMessage((payload) => {
        addNotification(
          'info',
          `📢 ${payload.notification?.title || 'Nueva Alerta'}: ${payload.notification?.body || ''}`,
        );
      });
    };

    setupNotifications();
  }, [addNotification]);

  // Handlers
  const handleMagicFix = useCallback(async () => {
    if (!import.meta.env.DEV) return;
    try {
      addNotification('info', 'Iniciando reparación automática...');
      await uploadInitialInventory(initialInventoryData);
      addNotification('success', '✅ REPARACIÓN DE INVENTARIO COMPLETA.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addNotification('error', 'Error en reparación: ' + message);
    }
  }, [addNotification]);

  return {
    inventory,
    pendingVisualSearch,
    setPendingVisualSearch,
    handleMagicFix,
    handleAdd: async (car: Omit<Car, 'id'>) => {
      try {
        await addCar(car);
        addNotification('success', 'Vehículo agregado correctamente al inventario.');
      } catch (err: any) {
        addNotification('error', `Error al agregar: ${err.message}`);
      }
    },
    handleUpdate: async (car: Car) => {
      try {
        await updateCar(car);
        addNotification('success', 'Vehículo actualizado correctamente.');
      } catch (err: any) {
        addNotification('error', `Error al actualizar: ${err.message}`);
      }
    },
    handleDelete: async (id: string) => {
      try {
        await deleteCar(id);
        addNotification('success', 'Vehículo eliminado correctamente.');
      } catch (err: any) {
        addNotification('error', `Error al eliminar: ${err.message}`);
      }
    },
  };
};
