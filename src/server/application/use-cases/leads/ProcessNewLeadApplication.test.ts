import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessNewLeadApplication } from './ProcessNewLeadApplication.usecase';
import { LeadRepository, EmailRepository, SMSRepository, MetaRepository, WhatsAppRepository } from '../../../domain/repositories';
import { DealApi } from '../../../../entities/deal/api/dealApi';

// Mock dealApi to verify Deal creation
vi.mock('../../../../entities/deal/api/dealApi', () => {
  return {
    DealApi: {
      createDeal: vi.fn().mockImplementation((deal) => Promise.resolve(deal))
    }
  };
});

// Mock SupabaseInventoryRepository
const mockGetCarById = vi.fn();
vi.mock('../../../../entities/inventory/api/SupabaseInventoryRepository', () => {
  return {
    SupabaseInventoryRepository: class {
      getCarById = mockGetCarById;
    }
  };
});

// Mock supabase client
vi.mock('../../../../shared/api/supabase/client', () => {
  return {
    createClient: vi.fn().mockReturnValue({})
  };
});

describe('ProcessNewLeadApplication Use Case (F&I Pre-Desking - Option C)', () => {
  let mockLeadRepo: LeadRepository;
  let mockEmailRepo: EmailRepository;
  let mockSMSRepo: SMSRepository;
  let mockMetaRepo: MetaRepository;
  let mockWhatsAppRepo: WhatsAppRepository;
  let useCase: ProcessNewLeadApplication;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLeadRepo = {
      saveLead: vi.fn().mockResolvedValue('lead-123'),
      updateLead: vi.fn().mockResolvedValue(undefined),
      getLeads: vi.fn().mockResolvedValue([]),
      getLeadById: vi.fn().mockResolvedValue(null),
      getLeadVelocity: vi.fn().mockResolvedValue(0),
      getAverageAIScore: vi.fn().mockResolvedValue(0)
    } as unknown as LeadRepository;

    mockEmailRepo = {
      send: vi.fn().mockResolvedValue(undefined)
    } as unknown as EmailRepository;

    mockSMSRepo = {
      send: vi.fn().mockResolvedValue(undefined)
    } as unknown as SMSRepository;

    mockMetaRepo = {
      sendLeadEvent: vi.fn().mockResolvedValue(undefined)
    } as unknown as MetaRepository;

    mockWhatsAppRepo = {
      sendMessage: vi.fn().mockResolvedValue(undefined)
    } as unknown as WhatsAppRepository;

    useCase = new ProcessNewLeadApplication(
      mockLeadRepo,
      mockEmailRepo,
      mockSMSRepo,
      mockMetaRepo,
      mockWhatsAppRepo
    );
  });

  it('should process a lead application and skip pre-desking if no vehicleId is provided', async () => {
    const input = {
      id: 'lead-123',
      data: {
        firstName: 'Richard',
        lastName: 'Mendez',
        phone: '7870000000',
        email: 'richard@example.com',
        monthlyIncome: '6000',
        hasPronto: true,
        timeAtJob: '3 years'
      }
    };

    const result = await useCase.execute(input);

    expect(result.tag).toBe('success');
    expect(mockLeadRepo.updateLead).toHaveBeenCalled();
    expect(mockGetCarById).not.toHaveBeenCalled();
    expect(DealApi.createDeal).not.toHaveBeenCalled();
  });

  it('should trigger leasing pre-desking for Fords >= $35,000 with GAP insurance', async () => {
    mockGetCarById.mockResolvedValue({
      id: 'ford-explorer-123',
      vin: 'ford-explorer-123',
      make: 'Ford',
      model: 'Explorer',
      year: 2026,
      price: 49500,
      condition: 'new'
    });

    const input = {
      id: 'lead-123',
      data: {
        firstName: 'Richard',
        lastName: 'Mendez',
        phone: '7870000000',
        email: 'richard@example.com',
        monthlyIncome: '8000',
        hasPronto: true,
        vehicleId: 'ford-explorer-123',
        downPaymentAmount: 5000
      }
    };

    const result = await useCase.execute(input);

    expect(result.tag).toBe('success');
    expect(mockGetCarById).toHaveBeenCalledWith('ford-explorer-123');
    expect(DealApi.createDeal).toHaveBeenCalled();

    const createdDeal = vi.mocked(DealApi.createDeal).mock.calls[0][0];
    expect(createdDeal.structureType).toBe('leasing');
    expect(createdDeal.term).toBe(60);
    expect(createdDeal.apr).toBe(5.95);
    expect(createdDeal.downPayment).toBe(5000);
    expect(createdDeal.residualValue).toBeGreaterThan(0);
  });

  it('should trigger conventional pre-desking for non-Fords or vehicles under $35,000', async () => {
    mockGetCarById.mockResolvedValue({
      id: 'toyota-yaris-123',
      vin: 'toyota-yaris-123',
      make: 'Toyota',
      model: 'Yaris',
      year: 2024,
      price: 24000,
      condition: 'used'
    });

    const input = {
      id: 'lead-123',
      data: {
        firstName: 'Carlos',
        lastName: 'Rivera',
        phone: '7871112222',
        email: 'carlos@example.com',
        monthlyIncome: '3000',
        hasPronto: false,
        vehicleId: 'toyota-yaris-123'
      }
    };

    const result = await useCase.execute(input);

    expect(result.tag).toBe('success');
    expect(mockGetCarById).toHaveBeenCalledWith('toyota-yaris-123');
    expect(DealApi.createDeal).toHaveBeenCalled();

    const createdDeal = vi.mocked(DealApi.createDeal).mock.calls[0][0];
    expect(createdDeal.structureType).toBe('conventional');
    expect(createdDeal.term).toBe(72);
    expect(createdDeal.residualValue).toBeUndefined();
  });
});
