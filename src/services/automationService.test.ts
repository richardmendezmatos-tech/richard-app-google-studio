import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Lead } from '@/types/types';

const {
  updateLeadMock,
  sendWhatsAppMock,
  sendTransactionalEmailMock,
  getAntigravityOutreachActionMock
} = vi.hoisted(() => ({
  updateLeadMock: vi.fn(),
  sendWhatsAppMock: vi.fn(),
  sendTransactionalEmailMock: vi.fn(),
  getAntigravityOutreachActionMock: vi.fn()
}));

vi.mock('@/features/leads/services/crmService', () => ({
  updateLead: updateLeadMock
}));

vi.mock('./whatsappService', () => ({
  whatsappService: {
    sendMessage: sendWhatsAppMock
  }
}));

vi.mock('./emailService', () => ({
  sendTransactionalEmail: sendTransactionalEmailMock
}));

vi.mock('./antigravityOmnichannelService', () => ({
  getAntigravityOutreachAction: getAntigravityOutreachActionMock
}));

import { automationService } from './automationService';

const NOW = Date.UTC(2026, 1, 11, 15, 0, 0);

const baseLead: Lead = {
  id: 'lead-automation-1',
  type: 'chat',
  status: 'new',
  name: 'Carlos Rivera',
  email: 'carlos@example.com',
  phone: '17875551212',
  vehicleOfInterest: 'Hyundai Elantra',
  createdAt: { seconds: Math.floor((NOW - 2 * 24 * 60 * 60 * 1000) / 1000), nanoseconds: 0 }
};

describe('automationService.processLeadNurturing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  it('sends via email when Antigravity suggests email and marks lead as emailed', async () => {
    getAntigravityOutreachActionMock.mockResolvedValue({
      channel: 'email',
      message: 'Mensaje por email',
      subject: 'Asunto IA'
    });
    sendTransactionalEmailMock.mockResolvedValue(true);

    await automationService.processLeadNurturing(baseLead);

    expect(sendTransactionalEmailMock).toHaveBeenCalledTimes(1);
    expect(sendWhatsAppMock).not.toHaveBeenCalled();
    expect(updateLeadMock).toHaveBeenCalledTimes(1);
    expect(updateLeadMock).toHaveBeenCalledWith(
      'lead-automation-1',
      expect.objectContaining({
        nurture_day_1_actuarial: true,
        emailSent: true,
        nudgeSent: false
      })
    );
  });

  it('falls back to WhatsApp when email fails and phone exists', async () => {
    getAntigravityOutreachActionMock.mockResolvedValue({
      channel: 'email',
      message: 'Intento por email primero',
      subject: 'Asunto IA'
    });
    sendTransactionalEmailMock.mockResolvedValue(false);
    sendWhatsAppMock.mockResolvedValue(true);

    await automationService.processLeadNurturing(baseLead);

    expect(sendTransactionalEmailMock).toHaveBeenCalledTimes(1);
    expect(sendWhatsAppMock).toHaveBeenCalledTimes(1);
    expect(updateLeadMock).toHaveBeenCalledWith(
      'lead-automation-1',
      expect.objectContaining({
        nurture_day_1_actuarial: true,
        emailSent: false,
        nudgeSent: true
      })
    );
  });

  it('does not update lead when no delivery channel is available', async () => {
    getAntigravityOutreachActionMock.mockResolvedValue(null);
    const leadWithoutContacts: Lead = {
      ...baseLead,
      id: 'lead-no-channels',
      email: undefined,
      phone: undefined
    };

    await automationService.processLeadNurturing(leadWithoutContacts);

    expect(sendTransactionalEmailMock).not.toHaveBeenCalled();
    expect(sendWhatsAppMock).not.toHaveBeenCalled();
    expect(updateLeadMock).not.toHaveBeenCalled();
  });
});
