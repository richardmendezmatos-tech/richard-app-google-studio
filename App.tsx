import React from 'react';
import ComparisonBar from './components/ComparisonBar';
import { BrandErrorBoundary } from './components/common/BrandErrorBoundary';
import { CinemaLayout } from './components/layout/CinemaLayout';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { CookieConsent } from './components/common/CookieConsent';
import { AppProviders } from './components/providers/AppProviders';
import { useAppController } from './hooks/useAppController';

const AppContent: React.FC = () => {
  const {
    inventory,
    pendingVisualSearch,
    setPendingVisualSearch,
    handleMagicFix,
    handleAdd,
    handleUpdate,
    handleDelete
  } = useAppController();

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
        <CookieConsent />
      </CinemaLayout>
    </BrandErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
      <ComparisonBar />
    </AppProviders>
  );
};

export default App;
