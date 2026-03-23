import { describe, it, expect } from 'vitest';
import { LeadMapper } from './LeadMapper';

describe('LeadMapper', () => {
  it('debe transformar datos de Firestore al dominio con valores por defecto', () => {
    const rawData = {
      firstName: 'Richard',
      email: 'test@example.com',
      dealerId: 'custom-dealer',
    };

    const lead = LeadMapper.toDomain('id123', rawData);

    expect(lead.id).toBe('id123');
    expect(lead.firstName).toBe('Richard');
    expect(lead.lastName).toBe(''); // Default
    expect(lead.dealerId).toBe('custom-dealer');
    expect(lead.status).toBe('new'); // Default
  });

  it('debe preparar datos para persistencia eliminando el ID', () => {
    const lead = {
      id: 'id123',
      firstName: 'Richard',
      dealerId: 'd1',
    };

    const persistence = LeadMapper.toPersistence(lead);

    expect(persistence.id).toBeUndefined();
    expect(persistence.firstName).toBe('Richard');
  });
});
