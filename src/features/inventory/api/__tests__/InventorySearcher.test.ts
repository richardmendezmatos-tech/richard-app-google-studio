import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventorySearcher } from '../InventorySearcher';
import type { VectorRepository } from '@/features/ai-hub/api/IVectorRepository';
import type { Car } from '@/entities/inventory/model/CarEntity';

const mockCar: Car = {
  id: 'car-1',
  name: 'Ford Explorer 2024',
  type: 'SUV',
  category: 'SUV',
  condition: 'New',
  make: 'Ford',
  model: 'Explorer',
  year: 2024,
  price: 42000,
  mileage: 0,
  features: ['SYNC 4', 'Ford Co-Pilot360', 'AWD'],
  description: 'Nuevo Explorer con tecnología de seguridad avanzada.',
};

function makeMockRepo(overrides: Partial<VectorRepository> = {}): VectorRepository {
  return {
    generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    semanticSearch: vi.fn().mockResolvedValue([mockCar]),
    updateEmbedding: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('InventorySearcher', () => {
  let repo: VectorRepository;
  let searcher: InventorySearcher;

  beforeEach(() => {
    repo = makeMockRepo();
    searcher = new InventorySearcher(repo);
  });

  describe('search()', () => {
    it('generates an embedding for the query and returns semantic matches', async () => {
      const results = await searcher.search('SUV familiar Ford', 3);

      expect(repo.generateEmbedding).toHaveBeenCalledWith('SUV familiar Ford');
      expect(repo.semanticSearch).toHaveBeenCalledWith([0.1, 0.2, 0.3], 3);
      expect(results).toEqual([mockCar]);
    });

    it('defaults to limit=3 when not specified', async () => {
      await searcher.search('pickup truck');
      expect(repo.semanticSearch).toHaveBeenCalledWith(expect.any(Array), 3);
    });

    it('returns empty array when repo finds no matches', async () => {
      repo = makeMockRepo({ semanticSearch: vi.fn().mockResolvedValue([]) });
      searcher = new InventorySearcher(repo);
      const results = await searcher.search('auto volador');
      expect(results).toEqual([]);
    });
  });

  describe('indexCar()', () => {
    it('builds enriched text from car fields and stores the embedding', async () => {
      await searcher.indexCar('car-1', mockCar);

      expect(repo.generateEmbedding).toHaveBeenCalledOnce();
      const textArg = vi.mocked(repo.generateEmbedding).mock.calls[0][0];
      expect(textArg).toContain('Ford');
      expect(textArg).toContain('Explorer');
      expect(textArg).toContain('2024');
      expect(textArg).toContain('SYNC 4');

      expect(repo.updateEmbedding).toHaveBeenCalledWith('car-1', [0.1, 0.2, 0.3]);
    });

    it('handles cars with no features or description gracefully', async () => {
      const minimal: Car = { ...mockCar, features: undefined, description: undefined };
      await expect(searcher.indexCar('car-2', minimal)).resolves.not.toThrow();
    });
  });
});
