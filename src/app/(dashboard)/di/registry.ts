// Repository Registry for Dependency Injection
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { createClient } from '@supabase/supabase-js';
import { FirestoreUserRepository } from '@/entities/user/api/repositories/FirestoreUserRepository';
import { Lead } from '@/entities/lead';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageService } from '@/shared/api/firebase/optionalServices';
import { FirestoreHoustonRepository } from '@/entities/houston/api/FirestoreHoustonRepository';
import { SupabaseHoustonRepository } from '@/entities/houston/api/SupabaseHoustonRepository';
import { DataConnectLeadRepository } from '@/entities/lead/api/repositories/DataConnectLeadRepository';
import { FirestoreSubscriberRepository, FirestoreSurveyRepository } from '@/entities/lead/api/FirestoreCaptureRepositories';

/**
 * DI Registry - Richard Automotive Sentinel (Nivel 13)
 * Centralizes all dependencies and enforces the Repository Pattern.
 * Zero-Logic Policy: This file only wires components, never queries DB.
 */
export const DI = {
  getInventoryUseCase: () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ [DI] Supabase credentials missing. Inventory UseCase will be disabled.');
      return { execute: async () => [] };
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const repository = new SupabaseInventoryRepository(supabaseClient);
    return {
      execute: (dealerId: string) => repository.getInventory(dealerId)
    };
  },
  
  getLeadsUseCase: () => {
    const repository = new DataConnectLeadRepository();
    return {
      execute: (dealerId: string, limitCount: number = 100) => repository.getLeads(dealerId, limitCount)
    };
  },
  
  getLeadRepository: () => {
    return new DataConnectLeadRepository();
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
    // Adapter to use LeadRepository for credit applications now
    const sqlRepo = new DataConnectLeadRepository();
    return {
      submitApplication: async (data: any, dealerId: string) => {
         return await sqlRepo.saveLead({
            ...data,
            dealerId,
            type: 'credit_application',
            status: 'new'
         });
      },
      getApplicationById: async (id: string) => {
         return await sqlRepo.getLeadById(id, 'richard-automotive') as any;
      }
    };
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
    return {
      execute: async (threshold: number) => {
        // Dynamic import to prevent dependency cycles
        const { DataConnectPredictiveRepository } = await import('@/entities/lead/api/repositories/DataConnectPredictiveRepository');
        const repository = new DataConnectPredictiveRepository();
        const leads = await repository.getHighProbabilityLeads(threshold);
        return leads.map((l: any) => ({
          leadId: l.id!,
          reason: `Interés detectado en ${l.vehicleOfInterest || 'Inventario'}. Score (Closure): ${l.closureProbability || 0}`,
          suggestedAction: 'Enviar Oferta Personalizada F&I',
          potentialRoi: (l.closureProbability || 0) / 20,
          opportunityScale: l.closureProbability || 0,
          expiresAt: Date.now() + 86400000,
          actionType: 'whatsapp' as const
        }));
      }
    };
  },

  getPurchaseOrdersUseCase: () => {
    const repository = new SupabaseHoustonRepository();
    return {
      execute: () => repository.getPurchaseOrders(),
      updateStatus: (id: string, status: 'confirmed' | 'archived') => repository.updatePurchaseOrderStatus(id, status)
    };
  }
};
