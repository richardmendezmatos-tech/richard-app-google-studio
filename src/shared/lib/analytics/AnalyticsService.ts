import { Lead } from '@/entities/lead';
import { Car } from '@/entities/lead';

export class AnalyticsService {
  /**
   * Procesa los leads para generar los datos del embudo de conversión.
   */
  static getConversionFunnelData(leads: Lead[]) {
    const stages = {
      Nuevo: leads.length,
      Contactado: leads.filter(
        (l) => l.status === 'contacted' || l.status === 'negotiation' || l.status === 'sold',
      ).length,
      Negociación: leads.filter((l) => l.status === 'negotiation' || l.status === 'sold').length,
      'Cierre/Venta': leads.filter((l) => l.status === 'sold').length,
    };

    return Object.entries(stages).map(([name, value]) => ({ name, value }));
  }

  /**
   * Procesa los leads para generar los datos de origen (WhatsApp vs Web).
   */
  static getLeadSourceData(leads: Lead[]) {
    const counts = leads.reduce(
      (acc, lead) => {
        const source = lead.type === 'whatsapp' ? 'WhatsApp' : 'Web/Otros';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  /**
   * Procesa el inventario para generar datos financieros por categoría.
   */
  static getInventoryFinancialsData(inventory: Car[]) {
    const categories = ['suv', 'sedan', 'luxury', 'pickup'];

    return categories
      .map((cat) => {
        const units = inventory.filter((c) => c.type === carTypeMap[cat] || c.type === cat);
        const totalCost = units.reduce((sum, car) => sum + car.price * 0.8, 0);
        const totalMargin = units.reduce((sum, car) => sum + car.price * 0.2, 0);

        return {
          name: cat.toUpperCase(),
          Costo: totalCost,
          Margen: totalMargin,
        };
      })
      .filter((d) => d.Costo > 0);
  }
}

const carTypeMap: Record<string, string> = {
  suv: 'SUV',
  sedan: 'Sedán',
  luxury: 'Lujo',
  pickup: 'Pickup',
};
