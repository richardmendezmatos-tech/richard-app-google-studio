import ComparisonView from '@/views/comparison/ui/ComparisonView';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Compara Autos en Puerto Rico | Richard Automotive',
  description:
    'Compara modelos de autos lado a lado en Puerto Rico. Especificaciones, precios, y más para encontrar el vehículo perfecto para ti.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/compare`,
  },
  openGraph: {
    title: 'Compara Autos en Puerto Rico | Richard Automotive',
    description:
      'Compara modelos lado a lado. Especificaciones, precios y más para encontrar tu vehículo ideal en Puerto Rico.',
    url: `${SITE_CONFIG.url}/compare`,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.seo.locale,
    type: 'website',
  },
};

export default function ComparePage() {
  return <ComparisonView />
}
