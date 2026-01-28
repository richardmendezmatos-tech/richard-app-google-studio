import React, { useEffect, useState, useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { useAuthListener } from './hooks/useAuthListener';
import { useCars } from './hooks/useCars';
import { useCarMutations } from './hooks/useCarMutations';
import { initializePushNotifications } from './services/pushService';
import { startGeofenceMonitoring } from './services/geofenceService';
import { uploadInitialInventory } from './services/firebaseService';
import { initialInventoryData } from './src/constants/initialInventory';

import ComparisonBar from './components/ComparisonBar';
import { BrandErrorBoundary } from './components/common/BrandErrorBoundary';
import { CinemaLayout } from './components/layout/CinemaLayout';
import { AnimatedRoutes } from './components/AnimatedRoutes';

// --- Router Logic ---
const SmartRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNative = !!((window as any).Capacitor && (window as any).Capacitor.isNative);
  const Router = isNative ? HashRouter : BrowserRouter;

  useEffect(() => {
    console.log(`[SmartRouter] Active mode: ${isNative ? 'HashRouter (Native/Capacitor)' : 'BrowserRouter (Web)'}`);
  }, [isNative]);

  return <Router>{children}</Router>;
};

const AppContent: React.FC = () => {
  const [pendingVisualSearch, setPendingVisualSearch] = useState<string | null>(null);

  // Hooks initialization
  const { user } = useSelector((state: RootState) => state.auth);
  useAuthListener();

  // Data Query
  const { data } = useCars(12);
  const inventory = data?.pages.flatMap(page => page.cars) || [];

  // Mutations
  const { addCar: handleAdd, updateCar: handleUpdate, deleteCar: handleDelete } = useCarMutations();
  const { addNotification } = useNotification();

  // App Lifecycle
  useEffect(() => {
    initializePushNotifications();
    startGeofenceMonitoring();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) registration.unregister();
      });
    }
  }, []);

  const handleMagicFix = useCallback(async () => {
    if (!import.meta.env.DEV) return;
    try {
      addNotification('info', 'Iniciando reparación automática...');
      await uploadInitialInventory(initialInventoryData);
      addNotification('success', '✅ REPARACIÓN DE INVENTARIO COMPLETA.');
    } catch (error: any) {
      addNotification('error', 'Error en reparación: ' + error.message);
    }
  }, [addNotification]);

  return (
    <BrandErrorBoundary>
      <CinemaLayout inventory={inventory}>
        <AnimatedRoutes
          inventory={inventory}
          pendingVisualSearch={pendingVisualSearch}
          setPendingVisualSearch={setPendingVisualSearch}
          handleMagicFix={handleMagicFix}
          handleAdd={handleAdd}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
        />
      </CinemaLayout>
    </BrandErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ComparisonProvider>
              <SmartRouter>
                <AppContent />
                <ComparisonBar />
              </SmartRouter>
            </ComparisonProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
