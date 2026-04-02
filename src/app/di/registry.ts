// Repository Registry for Dependency Injection
import { FirestoreInventoryRepository } from '@/entities/inventory/api/repositories/FirestoreInventoryRepository';
import { FirestoreUserRepository } from '@/entities/user/api/repositories/FirestoreUserRepository';
import { updateLead, addLead } from '@/shared/api/adapters/leads/crmService';
import { db } from '@/shared/api/firebase/firebaseService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export const DI = {
  getInventoryUseCase: () => {
    const repository = new FirestoreInventoryRepository();
    return {
      execute: (dealerId: string) => repository.getInventory(dealerId)
    };
  },
  
  getLeadsUseCase: () => {
    return {
      execute: async (dealerId: string) => {
        // Fetch leads from 'applications' collection
        const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    };
  },
  
  getLeadRepository: () => {
    return {
      updateLead: (id: string, data: any) => updateLead(id, data),
      saveLead: (data: any) => addLead(data)
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
  }
};
