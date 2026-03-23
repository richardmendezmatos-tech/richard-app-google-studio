import { Lead } from '@/entities/shared';

export class LeadMapper {
  /**
   * Transforma datos crudos de Firestore en una entidad Lead del dominio.
   * Proporciona valores por defecto y asegura que el ID esté presente.
   */
  static toDomain(id: string, data: any): Lead {
    return {
      id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      email: data.email || '',
      category: data.category,
      type: data.type || 'general',
      vehicleOfInterest: data.vehicleOfInterest,
      message: data.message,
      monthlyIncome: data.monthlyIncome,
      hasPronto: data.hasPronto ?? false,
      vehicleId: data.vehicleId,
      chatInteractions: data.chatInteractions || 0,
      dealerId: data.dealerId || 'richard-automotive',
      timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
      status: data.status || 'new',
      responded: data.responded ?? false,
      documentsSent: data.documentsSent ?? false,
      dealClosed: data.dealClosed ?? false,
      appointmentCompleted: data.appointmentCompleted ?? false,
      aiScore: data.aiScore,
      aiSummary: data.aiSummary,
      aiAnalysis: data.aiAnalysis,
      predictiveScore: data.predictiveScore,
      behavioralMetrics: data.behavioralMetrics,
    };
  }

  /**
   * Prepara una entidad Lead para ser guardada en Firestore.
   */
  static toPersistence(lead: Partial<Lead>): any {
    const persistenceData = { ...lead };
    delete persistenceData.id; // No guardamos el ID dentro del documento
    return persistenceData;
  }
}
