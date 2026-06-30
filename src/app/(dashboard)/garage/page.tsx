'use client';

import React from 'react';
import DigitalGaragePage from '@/views/digital-garage/ui/DigitalGaragePage';
import { useCars } from '@/features/inventory/hooks/useCars';
import { useRouter } from 'next/navigation';

export default function GarageRoute() {
  const router = useRouter();
  const { data } = useCars(50);
  const inventory = data?.pages.flatMap((p) => p.cars) ?? [];

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <DigitalGaragePage inventory={inventory} onExit={() => router.push('/')} />
    </div>
  );
}
