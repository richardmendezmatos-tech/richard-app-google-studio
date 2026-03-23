import { Lead } from '@/entities/lead';
import { hubspotService } from '../api/hubspot.api';
import { whatsappService } from '../api/whatsapp.api';

/**
 * Orchestrator to handle multiple background sales tasks simultaneously
 * without blocking the main thread or failing the user's lead submission.
 */
export class SalesOrchestratorService {
  async processNewLead(lead: Lead): Promise<void> {
    console.log(`[SalesOrchestrator] Processing new lead: ${lead.id}`);
    
    // We execute these concurrently and do not strictly await them to finish 
    // before returning to avoid perceived latency for the end user.
    // However, for this async method, we will await internally but wrap in safe try blocks inside the services.
    await Promise.allSettled([
      hubspotService.createContactAndDeal(lead),
      whatsappService.sendWelcomeTemplate(lead)
    ]);
    
    console.log(`[SalesOrchestrator] Completed background tasks for lead: ${lead.id}`);
  }
}

export const salesOrchestrator = new SalesOrchestratorService();
