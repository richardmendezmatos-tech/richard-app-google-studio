'use client';

import { useRouter } from 'next/navigation';
import HeroSection from './HeroSection';

export default function HeroWrapper() {
  const router = useRouter();
  return (
    <HeroSection
      onBrowseInventory={() => router.push('/inventario')}
      onNeuralMatch={() => router.push('/match-automotriz')}
      onSellCar={() => router.push('/trade-in')}
    />
  );
}
