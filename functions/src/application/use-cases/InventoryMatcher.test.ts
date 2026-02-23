import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryMatcher } from './InventoryMatcher';
import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { Lead, Car } from '../../domain/entities';

// Mock LeadRepository
class MockLeadRepository implements LeadRepository {
    private leads: Lead[] = [];

    setLeads(leads: Lead[]) { this.leads = leads; }

    async getById(id: string): Promise<Lead | null> {
        return this.leads.find(l => l.id === id) || null;
    }

    async getHotLeads(limit: number): Promise<Lead[]> {
        return this.leads.filter(l => l.category === 'HOT').slice(0, limit);
    }

    async save(lead: Lead): Promise<void> { }

    async update(id: string, data: Partial<Lead>): Promise<void> { }
}

describe('InventoryMatcher', () => {
    let repo: MockLeadRepository;
    let matcher: InventoryMatcher;

    beforeEach(() => {
        repo = new MockLeadRepository();
        matcher = new InventoryMatcher(repo);
    });

    it('should match a car to a lead with compatible interests', async () => {
        const lead: Lead = {
            id: 'lead-1',
            firstName: 'Richard',
            lastName: 'Mendez',
            phone: '7870000000',
            email: 'richard@example.com',
            category: 'HOT',
            monthlyIncome: '5000',
            aiAnalysis: {
                preferredType: 'Sedan',
                budget: 30000
            }
        };

        repo.setLeads([lead]);

        const car: Car = {
            id: 'car-1',
            name: 'Toyota Camry',
            type: 'Sedan',
            price: 25000,
            year: 2024,
            make: 'Toyota',
            model: 'Camry',
            mileage: 0
        };

        const matches = await matcher.execute('car-1', car);
        expect(matches.length).toBe(1);
        expect(matches[0].leadId).toBe('lead-1');
        expect(matches[0].matchScore).toBeGreaterThanOrEqual(40);
    });

    it('should not match if Budget is too low', async () => {
        const lead: Lead = {
            id: 'lead-1',
            firstName: 'Richard',
            lastName: 'Mendez',
            phone: '7870000000',
            email: 'richard@example.com',
            category: 'HOT',
            aiAnalysis: {
                preferredType: 'Pickup',
                budget: 10000
            }
        };

        repo.setLeads([lead]);

        const car: Car = {
            id: 'car-1',
            name: 'Lexus RX',
            type: 'SUV',
            price: 60000,
            year: 2024,
            make: 'Lexus',
            model: 'RX',
            mileage: 0
        };

        const matches = await matcher.execute('car-1', car);
        expect(matches.length).toBe(0);
    });
});
