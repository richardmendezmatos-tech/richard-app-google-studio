import React, { Suspense } from 'react';
import { BrandErrorBoundary } from '@/shared/brand-ui/common/BrandErrorBoundary';
import { CinemaLayout } from '@/shared/brand-ui/layout/CinemaLayout';
import { AnimatedRoutes } from '@/shared/brand-ui/AnimatedRoutes';

import { AppProviders } from '@/shared/brand-ui/providers/AppProviders';
import { useAppController } from '@/hooks/useAppController';

const ComparisonBar = React.lazy(() => import('@/features/inventory/ui/ComparisonBar'));
const PrivacyBanner = React.lazy(() => import('@/features/privacy/components/PrivacyBanner'));
const CommandCenterPanel = React.lazy(
  () => import('@/command-center/components/CommandCenterPanel'),
);

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
