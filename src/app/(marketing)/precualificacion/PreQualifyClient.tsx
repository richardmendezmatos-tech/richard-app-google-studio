'use client';

import React from 'react';
import PreQualifyView from '@/pages/leads/ui/PreQualifyView';
import { useRouter } from 'next/navigation';

export default function PreQualifyClient() {
  const router = useRouter();

  return <PreQualifyView onExit={() => router.push('/')} />;
}
