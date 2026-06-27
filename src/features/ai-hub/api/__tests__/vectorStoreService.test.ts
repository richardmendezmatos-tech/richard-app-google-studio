import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorStoreService } from '../vectorStoreService';

// Mock the supabase singleton before the module is loaded
vi.mock('@/shared/api/supabase/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

import { supabase } from '@/shared/api/supabase/supabase';

const mockSupabase = supabase as unknown as {
  from: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
};

describe('VectorStoreService', () => {
  let service: VectorStoreService;
  const sampleEmbedding = [0.1, 0.5, 0.9];

  beforeEach(() => {
    service = new VectorStoreService();
    vi.clearAllMocks();
  });

  describe('upsertInteraction()', () => {
    it('upserts the interaction without error', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });

      await expect(
        service.upsertInteraction({
          leadId: 'lead-1',
          content: 'Me interesa un F-150',
          embedding: sampleEmbedding,
          metadata: { source: 'whatsapp' },
        }),
      ).resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('customer_interactions');
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ lead_id: 'lead-1', content: 'Me interesa un F-150' }),
      );
    });

    it('throws when Supabase returns an error', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: new Error('RLS violation') });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });

      await expect(
        service.upsertInteraction({
          leadId: 'lead-1',
          content: 'test',
          embedding: sampleEmbedding,
        }),
      ).rejects.toThrow('RLS violation');
    });
  });

  describe('querySimilarInteractions()', () => {
    it('returns matching interactions from RPC', async () => {
      const interactions = [
        { leadId: 'lead-1', content: 'F-150 rojo', embedding: sampleEmbedding },
      ];
      mockSupabase.rpc = vi.fn().mockResolvedValue({ data: interactions, error: null });

      const result = await service.querySimilarInteractions('lead-1', sampleEmbedding, 3);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('match_customer_interactions', {
        p_lead_id: 'lead-1',
        query_embedding: sampleEmbedding,
        match_threshold: 0.5,
        match_count: 3,
      });
      expect(result).toEqual(interactions);
    });

    it('returns empty array on RPC error instead of throwing', async () => {
      mockSupabase.rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('timeout') });

      const result = await service.querySimilarInteractions('lead-1', sampleEmbedding);
      expect(result).toEqual([]);
    });
  });
});
