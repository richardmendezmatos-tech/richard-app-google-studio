'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Storefront from './Storefront';
import { Car } from '@/shared/types/types';

const ContactInfoSection = dynamic(
  () => import('./ContactInfoSection'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] bg-slate-900/20 rounded-3xl mx-6 animate-pulse" />
    ),
  },
);

interface Props {
  inventory: Car[];
}

export function LazyStorefrontContent({ inventory }: Props) {
  return (
    <>
      <Storefront inventory={inventory} />
      <ContactInfoSection />
    </>
  );
}
