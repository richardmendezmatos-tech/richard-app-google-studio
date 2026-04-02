import React from 'react';
import AIConsultant from '@/widgets/ai-chat/AIConsultant';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';

/**
 * Next.js App Router entry point for /consultant
 * Bridges to the AI Chat widget.
 */
export default async function ConsultantRoute() {
  let inventory: any[] = [];
  
  try {
    // SSR: Fetching data from GCP Java Backend
    inventory = await fetchInventoryFromJava(20);
  } catch (error) {
    console.error('Error fetching inventory for Consultant:', error);
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <AIConsultant inventory={inventory} />
    </div>
  );
}
