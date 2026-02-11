import { Lead } from '@/app/adapters/leads/crmGateway';
import { OrchestrationAction } from '@/services/orchestrationService';
import { antigravityFetch, getAntigravityConfig } from '@/services/antigravityService';

interface AntigravityLeadActionResponse {
  action: OrchestrationAction;
}

export const getAntigravityLeadAction = async (
  lead: Lead
): Promise<OrchestrationAction | null> => {
  const cfg = getAntigravityConfig();
  if (!cfg.apiUrl) return null;

  try {
    const payload = {
      lead: {
        id: lead.id,
        name: lead.name,
        type: lead.type,
        status: lead.status,
        aiScore: lead.aiScore ?? 0,
        vehicleId: lead.vehicleId ?? null
      }
    };

    const response = await antigravityFetch<AntigravityLeadActionResponse>(
      cfg.leadActionPath,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    return response?.action ?? null;
  } catch (error) {
    console.warn('Antigravity lead action fallback:', error);
    return null;
  }
};
