// Repository Registry for Dependency Injection
import { FirestoreInventoryRepository } from '@/entities/inventory/api/repositories/FirestoreInventoryRepository';
import { FirestoreUserRepository } from '@/entities/user/api/repositories/FirestoreUserRepository';
import { Lead } from '@/entities/lead';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageService } from '@/shared/api/firebase/optionalServices';
import { FirestoreHoustonRepository } from '@/entities/houston/api/FirestoreHoustonRepository';
import { FirestorePredictiveRepository } from '@/entities/lead/api/FirestorePredictiveRepository';
import { FirestoreLeadRepository } from '@/entities/lead/api/FirestoreLeadRepository';
import { FirestoreApplicationRepository } from '@/entities/lead/api/FirestoreApplicationRepository';
import { FirestoreSubscriberRepository, FirestoreSurveyRepository } from '@/entities/lead/api/FirestoreCaptureRepositories';

/**
 * DI Registry - Richard Automotive Sentinel (Nivel 13)
 * Centralizes all dependencies and enforces the Repository Pattern.
 * Zero-Logic Policy: This file only wires components, never queries DB.
 */
export const DI = {
  getInventoryUseCase: () => {
    const repository = new FirestoreInventoryRepository();
    return {
      execute: (dealerId: string) => repository.getInventory(dealerId)
    };
  },
  
  getLeadsUseCase: () => {
    const repository = new FirestoreLeadRepository();
    return {
      execute: (dealerId: string, limitCount: number = 100) => repository.getLeads(dealerId, limitCount)
    };
  },
  
  getLeadRepository: () => {
    return new FirestoreLeadRepository();
  },

  getStorageRepository: () => {
    return {
      uploadImage: async (file: File): Promise<string> => {
        const storage = await getStorageService();
        const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      }
    };
  },

  getApplicationRepository: () => {
    return new FirestoreApplicationRepository();
  },

  getSubscriberRepository: () => {
    return new FirestoreSubscriberRepository();
  },

  getSurveyRepository: () => {
    return new FirestoreSurveyRepository();
  },

  getUserRepository: () => {
    return new FirestoreUserRepository();
  },

  // Sentinel Outreach & Communications
  getAntigravityOutreachAction: (lead: any, context: any) => {
    // Import dynamically to avoid circular dependencies in registry
    return import('@/features/omnichannel/api/antigravityOmnichannelService')
      .then(m => m.getAntigravityOutreachAction(lead, context));
  },

  sendWhatsAppMessage: (to: string, message: string) => {
    return import('@/features/leads/model/whatsappService')
      .then(m => m.sendWhatsAppMessage(to, message));
  },

  getEvaluarAprobacionVentaUseCase: () => {
    // Import dynamically to avoid circular dependencies
    return {
      execute: (solicitud: any) => import('@/features/loans/application/EvaluarAprobacionVenta')
        .then(m => new m.EvaluarAprobacionVenta().execute(solicitud))
    };
  },

  getHoustonTelemetryUseCase: () => {
    const repository = new FirestoreHoustonRepository();
    return {
      subscribe: (callback: any) => repository.subscribeToTelemetry(callback)
    };
  },

  getIdentifyOutreachOpportunitiesUseCase: () => {
    const repository = new FirestorePredictiveRepository();
    return {
      execute: async (threshold: number) => {
        const leads = await repository.getHighProbabilityLeads(threshold);
        return leads.map(l => ({
          leadId: l.id!,
          reason: `Interés detectado en ${l.vehicleOfInterest || 'Inventario'}. Score: ${l.aiScore || 0}`,
          suggestedAction: 'Enviar Oferta Personalizada',
          potentialRoi: (l.aiScore || 0) / 20,
          opportunityScale: l.aiScore || 0,
          expiresAt: Date.now() + 86400000,
          actionType: 'whatsapp' as const
        }));
      }
    };
  }
};
