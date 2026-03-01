import React, { Suspense } from 'react';
import { BrandErrorBoundary } from '@/components/common/BrandErrorBoundary';
import { CinemaLayout } from '@/components/layout/CinemaLayout';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';

import { AppProviders } from '@/components/providers/AppProviders';
import { useAppController } from '@/hooks/useAppController';

const ComparisonBar = React.lazy(() => import('@/features/inventory/ui/ComparisonBar'));
const PrivacyBanner = React.lazy(() => import('@/features/privacy/components/PrivacyBanner'));

const RichardAutomotiveApp: React.FC = () => {
  const {
    inventory,
    pendingVisualSearch,
    setPendingVisualSearch,
    handleMagicFix,
    handleAdd,
    handleUpdate,
    handleDelete,
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

        {/* Global Overlays lazy-loaded para agilizar TTI */}
        <Suspense fallback={null}>
          <ComparisonBar />
          <PrivacyBanner />
        </Suspense>
      </CinemaLayout>
    </BrandErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <RichardAutomotiveApp />
    </AppProviders>
  );
};

export default App;
