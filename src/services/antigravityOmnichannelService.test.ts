import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Lead } from '@/types/types';

const { antigravityFetchMock, getAntigravityConfigMock } = vi.hoisted(() => ({
  antigravityFetchMock: vi.fn(),
  getAntigravityConfigMock: vi.fn()
}));

vi.mock('@/services/antigravityService', () => ({
  antigravityFetch: antigravityFetchMock,
  getAntigravityConfig: getAntigravityConfigMock
}));

import { getAntigravityOutreachAction } from './antigravityOmnichannelService';

const lead: Lead = {
  id: 'lead-1',
  type: 'chat',
  status: 'new',
  name: 'Ana Perez',
  email: 'ana@example.com',
  phone: '7875551212',
  aiScore: 92,
  vehicleOfInterest: 'Hyundai Tucson'
};

describe('getAntigravityOutreachAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAntigravityConfigMock.mockReturnValue({
      apiUrl: 'https://api.antigravity.local',
      outreachActionPath: '/copilot/outreach-action'
    });
  });

  it('returns null when Antigravity API URL is missing', async () => {
    getAntigravityConfigMock.mockReturnValue({
      apiUrl: '',
      outreachActionPath: '/copilot/outreach-action'
    });

    const action = await getAntigravityOutreachAction(lead, {
      trigger: 'nurture',
      fallbackMessage: 'Hola',
      fallbackChannel: 'whatsapp'
    });

    expect(action).toBeNull();
    expect(antigravityFetchMock).not.toHaveBeenCalled();
  });

  it('normalizes a valid action and uses fallback message when message is empty', async () => {
    antigravityFetchMock.mockResolvedValue({
      action: {
        channel: 'email',
        message: '',
        subject: 'Seguimiento',
        shouldSend: true
      }
    });

    const action = await getAntigravityOutreachAction(lead, {
      trigger: 'manual_crm',
      fallbackMessage: 'Mensaje fallback',
      fallbackChannel: 'email',
      priority: 'high'
    });

    expect(action).toEqual({
      channel: 'email',
      message: 'Mensaje fallback',
      subject: 'Seguimiento',
      reasoning: undefined,
      shouldSend: true
    });
    expect(antigravityFetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null for unsupported channels', async () => {
    antigravityFetchMock.mockResolvedValue({
      action: {
        channel: 'sms',
        message: 'Hola'
      }
    });

    const action = await getAntigravityOutreachAction(lead, {
      trigger: 'copilot',
      fallbackMessage: 'fallback',
      fallbackChannel: 'whatsapp'
    });

    expect(action).toBeNull();
  });
});
