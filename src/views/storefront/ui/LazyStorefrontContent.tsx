'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Storefront from './Storefront';
import { Car } from '@/shared/types/types';

const ContactInfoSection = dynamic(
  () => import('./ContactInfoSection'),
  { ssr: false },
);

interface Props {
  inventory: Car[];
}

export function LazyStorefrontContent({ inventory }: Props) {
  return (
    <>
      <Suspense fallback={null}>
        <Storefront inventory={inventory} />
      </Suspense>
      <Suspense fallback={null}>
        <ContactInfoSection />
      </Suspense>
    </>
  );
}
