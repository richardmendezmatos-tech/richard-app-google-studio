// Repository Registry for Dependency Injection
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { createClient } from '@supabase/supabase-js';
import { SupabaseUserRepository } from '@/entities/user/api/repositories/SupabaseUserRepository';
import { SupabaseHoustonRepository } from '@/entities/houston/api/SupabaseHoustonRepository';
import { SupabaseLeadRepository } from '@/entities/lead/api/repositories/SupabaseLeadRepository';
import { SupabaseSubscriberRepository, SupabaseSurveyRepository } from '@/entities/lead/api/repositories/SupabaseCaptureRepository';

/**
 * DI Registry - Richard Automotive Sentinel (Nivel 13)
 * Centralizes all dependencies and enforces the Repository Pattern.
 * Zero-Firebase Policy: All dependencies migrated to Supabase.
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
    const repository = new SupabaseLeadRepository();
    return {
      execute: (dealerId: string, limitCount: number = 100) => repository.getLeads(dealerId, limitCount)
    };
  },
  
  getLeadRepository: () => {
    return new SupabaseLeadRepository();
  },

  getStorageRepository: () => {
    return {
      uploadImage: async (file: File | Blob, path?: string, contentType?: string): Promise<string> => {
        // Migration Note: Firebase Storage replaced by Supabase Storage
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const fileName = path || `uploads/${Math.random()}.${fileExt}`;
        const filePath = fileName;

        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            contentType: contentType || (file instanceof File ? file.type : 'image/jpeg'),
            upsert: true
          });

        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        return publicUrl;
      }
    };
  },

  getApplicationRepository: () => {
    const sqlRepo = new SupabaseLeadRepository();
    return {
      submitApplication: async (data: any, dealerId: string) => {
         return await sqlRepo.saveLead({
            ...data,
            location: dealerId,
            status: 'new'
         });
      },
      getApplicationById: async (id: string) => {
         return await sqlRepo.getLeadById(id, 'richard-automotive') as any;
      }
    };
  },

  getSubscriberRepository: () => {
    return new SupabaseSubscriberRepository();
  },

  getSurveyRepository: () => {
    return new SupabaseSurveyRepository();
  },

  getUserRepository: () => {
    return new SupabaseUserRepository();
  },

  // Sentinel Outreach & Communications
  getAntigravityOutreachAction: (lead: any, context: any) => {
    return import('@/features/omnichannel/api/antigravityOmnichannelService')
      .then(m => m.getAntigravityOutreachAction(lead, context));
  },

  sendWhatsAppMessage: (to: string, message: string) => {
    return import('@/features/leads/model/whatsappService')
      .then(m => m.sendWhatsAppMessage(to, message));
  },

  getEvaluarAprobacionVentaUseCase: () => {
    return {
      execute: (solicitud: any) => import('@/features/loans/application/EvaluarAprobacionVenta')
        .then(m => new m.EvaluarAprobacionVenta().execute(solicitud))
    };
  },

  getHoustonTelemetryUseCase: () => {
    const repository = new SupabaseHoustonRepository();
    return {
      subscribe: (callback: any) => repository.subscribeToTelemetry(callback)
    };
  },

  getIdentifyOutreachOpportunitiesUseCase: () => {
    return {
      execute: async (threshold: number) => {
        const { SupabasePredictiveRepository } = await import('@/entities/lead/api/repositories/SupabasePredictiveRepository');
        const repository = new SupabasePredictiveRepository();
        const leads = await repository.getHighProbabilityLeads(threshold);
        return leads.map((l: any) => ({
          leadId: l.id!,
          reason: `Interés detectado en ${l.vehicle_of_interest || 'Inventario'}. Score (Closure): ${l.ai_analysis?.closureProbability || 0}`,
          suggestedAction: 'Enviar Oferta Personalizada F&I',
          potentialRoi: (l.ai_analysis?.closureProbability || 0) / 20,
          opportunityScale: l.ai_analysis?.closureProbability || 0,
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

