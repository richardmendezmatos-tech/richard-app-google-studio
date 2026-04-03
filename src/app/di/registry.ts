// Repository Registry for Dependency Injection
import { FirestoreInventoryRepository } from '@/entities/inventory/api/repositories/FirestoreInventoryRepository';
import { FirestoreUserRepository } from '@/entities/user/api/repositories/FirestoreUserRepository';
import { updateLead, addLead, Lead } from '@/shared/api/adapters/leads/crmService';
import { db } from '@/shared/api/firebase/firebaseService';
import { collection, getDocs, addDoc, query, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageService } from '@/shared/api/firebase/optionalServices';
import { FirestoreHoustonRepository } from '@/entities/houston/api/FirestoreHoustonRepository';
import { FirestorePredictiveRepository } from '@/entities/lead/api/FirestorePredictiveRepository';

export const DI = {
  getInventoryUseCase: () => {
    const repository = new FirestoreInventoryRepository();
    return {
      execute: (dealerId: string) => repository.getInventory(dealerId)
    };
  },
  
  getLeadsUseCase: () => {
    return {
      execute: async (dealerId: string, limitCount: number = 100) => {
        // Fetch leads from 'applications' collection
        const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
      }
    };
  },
  
  getLeadRepository: () => {
    return {
      updateLead: (id: string, data: any): Promise<void> => updateLead(id, data),
      saveLead: (data: any): Promise<string> => addLead(data)
    };
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
    return {
      submitApplication: async (data: any, dealerId: string): Promise<string> => {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...data,
          dealerId,
          createdAt: new Date().toISOString()
        });
        return docRef.id;
      }
    };
  },

  getSubscriberRepository: () => {
    return {
      subscribe: async (email: string): Promise<void> => {
        await addDoc(collection(db, 'subscribers'), {
          email,
          subscribedAt: new Date().toISOString()
        });
      },
      getSubscribers: async (): Promise<any[]> => {
        const snap = await getDocs(collection(db, 'subscribers'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    };
  },

  getSurveyRepository: () => {
    return {
      submitSurvey: async (data: any): Promise<void> => {
        await addDoc(collection(db, 'surveys'), {
          ...data,
          submittedAt: new Date().toISOString()
        });
      }
    };
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
