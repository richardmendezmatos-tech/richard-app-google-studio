import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReindexInventory } from '../ReindexInventory';
import type { InventoryRepository } from '@/features/inventory/api';
import type { Car } from '@/entities/inventory/model/CarEntity';

const makeCar = (id: string): Car => ({
  id,
  name: `Ford F-150 ${id}`,
  type: 'Pickup',
  category: 'Pickup',
  condition: 'New',
  make: 'Ford',
  model: 'F-150',
  year: 2024,
  price: 55000,
  mileage: 0,
});

function makeMockRepo(cars: Car[]): Pick<InventoryRepository, 'getAll'> {
  return {
    getAll: vi.fn().mockResolvedValue(cars),
  } as unknown as InventoryRepository;
}

describe('ReindexInventory', () => {
  let callbackMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callbackMock = vi.fn().mockResolvedValue(undefined);
  });

  it('calls the embedding callback for each car and returns success with count', async () => {
    const cars = [makeCar('car-1'), makeCar('car-2'), makeCar('car-3')];
    const repo = makeMockRepo(cars);
    const useCase = new ReindexInventory(repo as InventoryRepository);

    const result = await useCase.execute(callbackMock);

    expect(result.tag).toBe('success');
    if (result.tag === 'success') expect(result.value).toBe(3);
    expect(callbackMock).toHaveBeenCalledTimes(3);
    expect(callbackMock).toHaveBeenCalledWith('car-1', cars[0]);
  });

  it('skips cars without an id', async () => {
    const cars = [makeCar('car-1'), { ...makeCar('car-2'), id: undefined } as any];
    const repo = makeMockRepo(cars);
    const useCase = new ReindexInventory(repo as InventoryRepository);

    const result = await useCase.execute(callbackMock);

    expect(result.tag).toBe('success');
    if (result.tag === 'success') expect(result.value).toBe(1);
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  it('returns failure when the repository throws', async () => {
    const repo = {
      getAll: vi.fn().mockRejectedValue(new Error('DB connection lost')),
    } as unknown as InventoryRepository;
    const useCase = new ReindexInventory(repo);

    const result = await useCase.execute(callbackMock);

    expect(result.tag).toBe('failure');
    if (result.tag === 'failure') expect(result.error.message).toContain('DB connection lost');
    expect(callbackMock).not.toHaveBeenCalled();
  });

  it('returns failure when a callback throws mid-batch', async () => {
    const cars = [makeCar('car-1'), makeCar('car-2')];
    const repo = makeMockRepo(cars);
    callbackMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Embedding API timeout'));
    const useCase = new ReindexInventory(repo as InventoryRepository);

    const result = await useCase.execute(callbackMock);

    expect(result.tag).toBe('failure');
    if (result.tag === 'failure') expect(result.error.message).toContain('Embedding API timeout');
  });

  it('handles empty inventory and returns success with count 0', async () => {
    const repo = makeMockRepo([]);
    const useCase = new ReindexInventory(repo as InventoryRepository);

    const result = await useCase.execute(callbackMock);

    expect(result.tag).toBe('success');
    if (result.tag === 'success') expect(result.value).toBe(0);
    expect(callbackMock).not.toHaveBeenCalled();
  });
});
