import React, { Suspense } from 'react';
import { BrandErrorBoundary } from '@/shared/ui/common/BrandErrorBoundary';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import { AnimatedRoutes } from '@/widgets/brand-ui/AnimatedRoutes';

import { AppProviders } from '@/widgets/brand-ui/providers/AppProviders';
import { useAppController } from '@/app/hooks/useAppController';

const ComparisonBar = React.lazy(() => import('@/widgets/comparison/ComparisonBar').then(m => ({ default: m.default || m })));
const PrivacyBanner = React.lazy(() => import('@/features/privacy/components/PrivacyBanner').then(m => ({ default: m.default || m })));
import SEO from '@/shared/ui/seo/SEO';
import { getWebsiteSchema } from '@/shared/config/seoSchemas';

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
      <SEO schema={getWebsiteSchema()} />
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
