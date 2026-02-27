import { useState, useEffect, useCallback } from 'react';
import { Car } from '@/types/types';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuthListener } from './useAuthListener';
import { useCars } from '@/features/inventory/hooks/useCars';
import { useCarMutations } from '@/features/inventory/hooks/useCarMutations';

import { startGeofenceMonitoring } from '@/services/geofenceService';
import { uploadInitialInventory } from '@/features/inventory/services/inventoryService';
import { initialInventoryData } from '@/constants/initialInventory';
import { requestNotificationPermission, onForegroundMessage } from '@/services/notificationService';

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
      await addCar(car);
    },
    handleUpdate: async (car: Car) => {
      await updateCar(car);
    },
    handleDelete: deleteCar,
  };
};
