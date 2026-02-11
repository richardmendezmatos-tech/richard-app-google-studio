import { Lead } from '@/features/leads/services/crmService';
import { antigravityFetch, getAntigravityConfig } from '@/services/antigravityService';

export type OutreachChannel = 'whatsapp' | 'email';

export interface AntigravityOutreachAction {
  channel: OutreachChannel;
  message: string;
  subject?: string;
  reasoning?: string;
  shouldSend?: boolean;
}

interface AntigravityOutreachResponse {
  action?: AntigravityOutreachAction;
}

interface OutreachRequestContext {
  trigger: 'nurture' | 'manual_crm' | 'copilot';
  ruleId?: string;
  fallbackMessage: string;
  fallbackChannel: OutreachChannel;
  priority?: 'urgent' | 'high' | 'normal';
}

const normalizeChannel = (value: string | undefined): OutreachChannel | null => {
  if (value === 'whatsapp' || value === 'email') return value;
  return null;
};

export const getAntigravityOutreachAction = async (
  lead: Lead,
  context: OutreachRequestContext
): Promise<AntigravityOutreachAction | null> => {
  const cfg = getAntigravityConfig();
  if (!cfg.apiUrl) return null;

  try {
    const response = await antigravityFetch<AntigravityOutreachResponse>(
      cfg.outreachActionPath,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: {
            id: lead.id,
            name: lead.name,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            type: lead.type,
            aiScore: lead.aiScore ?? lead.aiAnalysis?.score ?? 0,
            vehicleOfInterest: lead.vehicleOfInterest,
            vehicleId: lead.vehicleId
          },
          context
        })
      }
    );

    const action = response?.action;
    if (!action) return null;

    const channel = normalizeChannel(action.channel);
    if (!channel) return null;

    return {
      channel,
      message: action.message || context.fallbackMessage,
      subject: action.subject,
      reasoning: action.reasoning,
      shouldSend: action.shouldSend
    };
  } catch (error) {
    console.warn('Antigravity outreach action fallback:', error);
    return null;
  }
};
