import { createClient } from '@/shared/api/supabase/client';

/**
 * DI Registry - Richard Automotive Sentinel (Nivel 13)
 * Centralizes all dependencies and enforces the Repository Pattern.
 * Zero-Firebase Policy: All dependencies migrated to Supabase.
 */
export const DI = {
  getInventoryUseCase: () => {
    return {
      execute: async (dealerId: string) => {
        const { SupabaseInventoryRepository } = await import('@/entities/inventory/api/SupabaseInventoryRepository');
        const supabaseClient = createClient();
        const repository = new SupabaseInventoryRepository(supabaseClient);
        return repository.getInventory(dealerId);
      }
    };
  },
  
  getLeadsUseCase: () => {
    return {
      execute: async (dealerId: string, limitCount: number = 100) => {
        const { SupabaseLeadRepository } = await import('@/entities/lead/api/repositories/SupabaseLeadRepository');
        const repository = new SupabaseLeadRepository();
        return repository.getLeads(dealerId, limitCount);
      }
    };
  },
  
  getLeadRepository: async () => {
    const { SupabaseLeadRepository } = await import('@/entities/lead/api/repositories/SupabaseLeadRepository');
    return new SupabaseLeadRepository();
  },

  getStorageRepository: () => {
    return {
      uploadImage: async (file: File | Blob, path?: string, contentType?: string): Promise<string> => {
        // Migration Note: Firebase Storage replaced by Supabase Storage
        const supabase = createClient();
        
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
    return {
      submitApplication: async (data: any, dealerId: string) => {
         const { SupabaseLeadRepository } = await import('@/entities/lead/api/repositories/SupabaseLeadRepository');
         const sqlRepo = new SupabaseLeadRepository();
         return await sqlRepo.saveLead({
            ...data,
            location: dealerId,
            status: 'new'
         });
      },
      getApplicationById: async (id: string) => {
         const { SupabaseLeadRepository } = await import('@/entities/lead/api/repositories/SupabaseLeadRepository');
         const sqlRepo = new SupabaseLeadRepository();
         return await sqlRepo.getLeadById(id, 'richard-automotive') as any;
      }
    };
  },

  getSubscriberRepository: async () => {
    const { SupabaseSubscriberRepository } = await import('@/entities/lead/api/repositories/SupabaseCaptureRepository');
    return new SupabaseSubscriberRepository();
  },

  getSurveyRepository: async () => {
    const { SupabaseSurveyRepository } = await import('@/entities/lead/api/repositories/SupabaseCaptureRepository');
    return new SupabaseSurveyRepository();
  },

  getUserRepository: async () => {
    console.log('📡 [DI:Registry] Accessing UserRepository...');
    try {
      const { SupabaseUserRepository } = await import('@/entities/user/api/repositories/SupabaseUserRepository');
      return new SupabaseUserRepository();
    } catch (error) {
      console.error('❌ [DI:Registry] Failed to load UserRepository:', error);
      throw error;
    }
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
      execute: async (solicitud: any) => {
        const [{ EvaluarAprobacionVenta }, { SupabaseLoanRepository }] = await Promise.all([
          import('@/features/loans/application/EvaluarAprobacionVenta'),
          import('@/features/loans/infra/SupabaseLoanRepository')
        ]);
        const repository = new SupabaseLoanRepository();
        return new EvaluarAprobacionVenta(repository).execute(solicitud);
      }
    };
  },

  getHoustonTelemetryUseCase: () => {
    return {
      subscribe: async (callback: any) => {
        const { SupabaseHoustonRepository } = await import('@/entities/houston/api/SupabaseHoustonRepository');
        const repository = new SupabaseHoustonRepository();
        return repository.subscribeToTelemetry(callback);
      }
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
    return {
      execute: async () => {
        const { SupabaseHoustonRepository } = await import('@/entities/houston/api/SupabaseHoustonRepository');
        const repository = new SupabaseHoustonRepository();
        return repository.getPurchaseOrders();
      },
      updateStatus: async (id: string, status: 'confirmed' | 'archived') => {
        const { SupabaseHoustonRepository } = await import('@/entities/houston/api/SupabaseHoustonRepository');
        const repository = new SupabaseHoustonRepository();
        return repository.updatePurchaseOrderStatus(id, status);
      }
    };
  }
};

