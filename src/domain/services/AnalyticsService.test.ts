import { describe, it, expect } from 'vitest';
import { AnalyticsService } from './AnalyticsService';
import { Lead, Car } from '../entities';

describe('AnalyticsService', () => {
  const mockLeads: Lead[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      phone: '123',
      email: 'j@d.com',
      status: 'new',
      type: 'whatsapp',
      dealerId: 'd1',
    } as Lead,
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '456',
      email: 'ja@d.com',
      status: 'contacted',
      type: 'chat',
      dealerId: 'd1',
    } as Lead,
    {
      id: '3',
      firstName: 'Jim',
      lastName: 'Beam',
      phone: '789',
      email: 'jb@d.com',
      status: 'sold',
      type: 'whatsapp',
      dealerId: 'd1',
    } as Lead,
  ];

  const mockInventory: Car[] = [
    { id: 'c1', type: 'suv', price: 50000 } as Car,
    { id: 'c2', type: 'sedan', price: 30000 } as Car,
  ];

  it('debe generar correctamente los datos del embudo de conversión', () => {
    const data = AnalyticsService.getConversionFunnelData(mockLeads);
    expect(data.find((d) => d.name === 'Nuevo')?.value).toBe(3);
    expect(data.find((d) => d.name === 'Cierre/Venta')?.value).toBe(1);
  });

  it('debe generar correctamente los datos de origen de leads', () => {
    const data = AnalyticsService.getLeadSourceData(mockLeads);
    expect(data.find((d) => d.name === 'WhatsApp')?.value).toBe(2);
    expect(data.find((d) => d.name === 'Web/Otros')?.value).toBe(1);
  });

  it('debe generar correctamente los datos financieros del inventario', () => {
    const data = AnalyticsService.getInventoryFinancialsData(mockInventory);
    const suvData = data.find((d) => d.name === 'SUV');
    expect(suvData?.Costo).toBe(50000 * 0.8);
    expect(suvData?.Margen).toBe(50000 * 0.2);
  });
});
