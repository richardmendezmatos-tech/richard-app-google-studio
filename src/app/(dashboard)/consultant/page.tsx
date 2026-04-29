import React from 'react';
import AIConsultant from '@/widgets/ai-chat/AIConsultant';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';

/**
 * Next.js App Router entry point for /consultant
 * Bridges to the AI Chat widget.
 */
export default async function ConsultantRoute() {
  let inventory: Car[] = [];
  
  try {
    const result = await getPaginatedCars(20);
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for Consultant:', error);
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <AIConsultant inventory={inventory} />
    </div>
  );
}
