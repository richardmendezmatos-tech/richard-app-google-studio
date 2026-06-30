import React from 'react';
import Storefront from './Storefront';
import ContactInfoSection from './ContactInfoSection';
import { Car } from '@/shared/types/types';

interface Props {
  inventory: Car[];
}

export function LazyStorefrontContent({ inventory }: Props) {
  return (
    <>
      <Storefront inventory={inventory} hideHero hideMarketPulse />
      <ContactInfoSection />
    </>
  );
}
