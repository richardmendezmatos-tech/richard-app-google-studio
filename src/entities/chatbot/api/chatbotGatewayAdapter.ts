import { ImmutableVehicle, ImmutableLead } from '@/entities/chatbot/model/entities';
import { Car, Lead } from '@/shared/types/types';

/**
 * ChatbotGatewayAdapter
 * Interface Adapter to map raw data from Infrastructure (Firebase/API) to Domain Entities.
 */
export class ChatbotGatewayAdapter {
  static toImmutableVehicle(car: Car): ImmutableVehicle {
    return {
      id: car.id,
      name: car.name,
      price: car.price,
      type: car.type,
      condition: car.year && car.year > 2024 ? 'new' : 'used',
      stockCount: 1, // Defaulting for simple entity mapping
      features: car.features || [],
      specifications: {
        year: car.year || 2024,
        transmission: 'Auto',
        fuelType: 'Gasoline',
      },
    };
  }

  static toImmutableLead(lead: Lead): ImmutableLead {
    return {
      id: lead.id,
      name:
        lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Valued Customer',
      intentScore: lead.aiScore || 0,
      vehicleOfInterestId: lead.vehicleId,
      budgetRange: {
        min: 0,
        max: 100000, // Domain default
      },
      context: {
        sessionCount: lead.behavioralMetrics?.inventoryViews || 1,
        lastInteractionType: lead.type,
        preferredAgent: lead.customerMemory?.l1_reactive?.currentTopic || 'ricardo',
      },
    };
  }
}
