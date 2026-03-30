import { LeadRepository } from '@/entities/lead';
import { Lead } from '@/entities/lead';

export class GetLeads {
  constructor(private leadRepo: LeadRepository) {}

  async execute(dealerId: string, limit: number = 100): Promise<Lead[]> {
    if (!dealerId) throw new Error('Dealer ID is required');
    return await this.leadRepo.getLeads(dealerId, limit);
  }
}
