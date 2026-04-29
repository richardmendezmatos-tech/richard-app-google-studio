import { db } from '@/shared/api/firebase/firebaseService';
import {
  collection,
  addDoc,
  query,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { Lead } from '@/shared/types/types';
import { hubspotService } from '@/shared/api/hubspot/HubSpotClient';
import { extractMarketingData } from './marketingCaptureService';
import { dispatchLeadToWebhook } from '@/shared/api/communications/webhookService';

import { sendWhatsAppRetargeting } from '@/shared/api/communications/whatsappService';

export type { Lead };

const LEADS_COLLECTION = 'applications';

/**
 * Adds a new lead to Firestore
 */
export const addLead = async (lead: Omit<Lead, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  try {
    const marketingData = extractMarketingData();

    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      ...lead,
      marketingData,
      status: 'new',
      createdAt: serverTimestamp(),
    });
    console.log('Lead added successfully');

    const newLead = { ...lead, marketingData, id: docRef.id, status: 'new' } as Lead;

    // HubSpot Sync
    hubspotService
      .syncLeadToHubSpot(newLead)
      .catch((e) => console.error('HubSpot async sync failed', e));

    // Automation / Meta CAPI Webhook Sync
    dispatchLeadToWebhook(newLead).catch((e) => console.error('Webhook async sync failed', e));

    // WhatsApp Retargeting (Sentinel Funnel Optimization)
    sendWhatsAppRetargeting(newLead).catch((e) => console.error('WhatsApp dispatch failed', e));

    return docRef.id;
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};

/**
 * Updates any field of a lead
 */
export const updateLead = async (leadId: string, updates: Partial<Lead>) => {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    await updateDoc(leadRef, updates as { [x: string]: unknown });

    // HubSpot Sync - Fetch full lead only if critical fields are missing
    if (updates.email || updates.aiScore || updates.customerMemory || updates.status) {
      if (updates.email && (updates.name || updates.firstName)) {
        // We have enough local data to sync directly without fetching
        hubspotService
          .syncLeadToHubSpot({
            id: leadId,
            ...updates,
          } as Lead)
          .catch(console.error);
      } else {
        // Fallback to fetch the complete lead from DB
        getDoc(leadRef)
          .then((snap) => {
            if (snap.exists()) {
              hubspotService
                .syncLeadToHubSpot({
                  id: leadId,
                  ...snap.data(),
                } as Lead)
                .catch(console.error);
            }
          })
          .catch(console.error);
      }
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

/**
 * Updates the status of a lead (e.g. dragging card in Kanban)
 */
export const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
  await updateLead(leadId, { status: newStatus });
};

/**
 * CONTINUUM MEMORY SYSTEM (CMS) - Nested Frequency Updates
 */

/**
 * L1: Reactive Memory Update (High Frequency)
 * Triggered by real-time interactions
 */
export const updateLeadL1Memory = async (
  leadId: string,
  l1Data: Partial<NonNullable<Lead['customerMemory']>['l1_reactive']>,
) => {
  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  const snapshot = await getDoc(leadRef);
  if (!snapshot.exists()) return;

  const lead = snapshot.data() as Lead;
  const currentMemory = lead.customerMemory || {};

  await updateDoc(leadRef, {
    'customerMemory.l1_reactive': {
      ...(currentMemory.l1_reactive || {}),
      ...l1Data,
      activeContext: true,
    },
  });
};

/**
 * L2: Contextual Memory Update (Medium Frequency)
 * Triggered by daily analysis or significant behavior shifts
 */
export const updateLeadL2Memory = async (
  leadId: string,
  l2Data: Partial<NonNullable<Lead['customerMemory']>['l2_contextual']>,
) => {
  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  const snapshot = await getDoc(leadRef);
  if (!snapshot.exists()) return;

  const lead = snapshot.data() as Lead;
  const currentMemory = lead.customerMemory || {};

  await updateDoc(leadRef, {
    'customerMemory.l2_contextual': {
      ...(currentMemory.l2_contextual || {}),
      ...l2Data,
    },
  });
};

/**
 * L3: Evolutivo Memory Update (Low Frequency)
 * Triggered by milestone events or monthly reviews
 */
export const updateLeadL3Memory = async (
  leadId: string,
  l3Data: Partial<NonNullable<Lead['customerMemory']>['l3_evolutivo']>,
) => {
  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  const snapshot = await getDoc(leadRef);
  if (!snapshot.exists()) return;

  const lead = snapshot.data() as Lead;
  const currentMemory = lead.customerMemory || {};

  await updateDoc(leadRef, {
    'customerMemory.l3_evolutivo': {
      ...(currentMemory.l3_evolutivo || {}),
      ...l3Data,
    },
  });
};

/**
 * Near-real-time poller for leads - Aggregates from standard and secure collections
 */
import { limit } from 'firebase/firestore';

export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
  let cancelled = false;

  const fetchAll = async () => {
    try {
      const qApps = query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(50));
      const qSols = query(
        collection(db, 'solicitudes_credito'),
        orderBy('createdAt', 'desc'),
        limit(50),
      );

      const [snapApps, snapSols] = await Promise.all([getDocs(qApps), getDocs(qSols)]);

      if (cancelled) return;

      const apps = snapApps.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Lead);
      const sols = snapSols.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Lead);

      const combined = [...apps, ...sols].sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      callback(combined);
    } catch (error) {
      console.error('Error fetching combined leads:', error);
    }
  };

  fetchAll();
  // Adaptive/lazy interval setting: 30 seconds backpressure to prevent DB abuse instead of 10s
  const intervalId = setInterval(fetchAll, 30000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
};

/**
 * Fetches sensitive data from the Secure Vault
 * Note: This will fail if the user is not an authorized Admin (Richard/SuperAdmin)
 */
export const getSecureLeadData = async (leadId: string) => {
  try {
    const secureRef = doc(db, 'applications_secure', leadId);
    const snapshot = await getDoc(secureRef);
    if (snapshot.exists()) {
      return snapshot.data() as { ssn: string };
    }
    return null;
  } catch (error) {
    console.error('Vault Access Denied or Error:', error);
    throw new Error('No tienes permisos suficientes para acceder a la Bóveda Segura.', {
      cause: error,
    });
  }
};
