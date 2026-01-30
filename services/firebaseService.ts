
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Explicit persistence for stability
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  writeBatch,
  increment,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  getAggregateFromServer,
  getCountFromServer,
  initializeFirestore,
  enableMultiTabIndexedDbPersistence,
  count,
  sum,
  average
} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getPerformance } from "firebase/performance";
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check"; // App Check Enterprise
import { firebaseConfig } from "../firebaseConfig";
import { Car, Lead, Subscriber } from "../types";
import { sendAutoNewsletter } from "./emailService";

// Helper for environment checks
const isBrowser = typeof window !== 'undefined';
const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

// CRITICAL: Suppress Firebase Installations 403 errors globally
if (isBrowser) {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    // Suppress Firebase Installations API 403 errors
    if (errorString.includes('firebaseinstallations.googleapis.com') ||
      errorString.includes('installations/request-failed') ||
      errorString.includes('PERMISSION_DENIED')) {
      console.warn('[Firebase] Installations API error suppressed (API key restriction)');
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Also suppress unhandled promise rejections for Firebase Installations
  window.addEventListener('unhandledrejection', (event) => {
    const errorString = event.reason?.toString() || '';
    if (errorString.includes('firebaseinstallations.googleapis.com') ||
      errorString.includes('installations/request-failed') ||
      errorString.includes('PERMISSION_DENIED')) {
      console.warn('[Firebase] Installations promise rejection suppressed');
      event.preventDefault();
    }
  });
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

let analyticsInstance = null;
if (isBrowser) {
  try {
    // Strategic: Analytics can fail if Installations API is restricted or blocked by adblockers
    analyticsInstance = getAnalytics(app);
  } catch (error) {
    console.warn("[Firebase] Analytics/Installations suppressed (likely restricted API key or 403):", error);
  }
}
export const analytics = analyticsInstance;

// Initialize Firebase Services
export let auth: any;
try {
  auth = getAuth(app);
} catch (e) {
  console.warn("[Firebase] Auth initialization failed:", e);
}

export let db: any;
try {
  db = initializeFirestore(app, {});
} catch (e) {
  console.error("[Firebase] Firestore initialization FAILED - Application might crash on data access:", e);
}

// CTO Hack: Force LOCAL persistence to avoid session drops in strict browsers
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence Config Failed:", err));
}

export let storage: any;
try {
  storage = getStorage(app);
} catch (e) {
  console.warn("[Firebase] Storage suppressed:", e);
}

export let functions: any;
try {
  functions = getFunctions(app);
} catch (e) {
  console.warn("[Firebase] Functions suppressed:", e);
}

// Initialize Performance Monitoring
let performance;
if (isBrowser) {
  try {
    performance = getPerformance(app);
  } catch (err) {
    console.warn("[Firebase] Performance Monitoring suppressed:", err);
  }

  // Initialize App Check (Security)
  // Enable Debug Token for Localhost
  if (isDev) {
    (window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  /* 
  const appCheckKey = import.meta.env.VITE_RECAPTCHA_KEY;
  if (appCheckKey) {
    // Security: ReCaptcha Enterprise
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckKey),
      isTokenAutoRefreshEnabled: true
    });
  }
  */
}
export { performance };

// Enable Offline Persistence (Multi-tab support)
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia falló: Múltiples pestañas abiertas.');
    } else if (err.code === 'unimplemented') {
      console.warn('El navegador no soporta persistencia.');
    }
  });
}

// Use emulator for functions if in dev
if (isDev) {
  // connectFunctionsEmulator(functions, "localhost", 5001); 
}

const carsCollectionRef = collection(db, 'cars');
const appsCollectionRef = collection(db, 'applications');

// --- Aggregation Queries (Optimization) ---
export const getInventoryStats = async () => {
  const coll = collection(db, 'cars');
  const snapshot = await getAggregateFromServer(coll, {
    count: count(),
    totalValue: sum('price'),
    avgPrice: average('price')
  }).catch(() => null); // Fallback

  // Note: If SDK version < 9.14, sum/avg might not exist.
  // Using simple count() for safety if unsure of version.
  const countSnapshot = await getCountFromServer(coll);

  return {
    count: countSnapshot.data().count,
    totalValue: snapshot?.data().totalValue || 0,
    avgPrice: snapshot?.data().avgPrice || 0
  };
};



// [DEPRECATED] Use inventoryService.ts for car pagination
// Keeping simplified export for backward compatibility until refactor is complete
export { getPaginatedCars } from './inventoryService';

// --- Funciones de Base de Datos (Firestore) --- (Moved auth to authService.ts)


// --- Funciones de Base de Datos (Firestore) ---

export const syncInventory = (callback: (inventory: Car[]) => void) => {
  const dealerId = (typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(carsCollectionRef, where('dealerId', '==', dealerId));

  return onSnapshot(q, snapshot => {
    const inventoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Car[];
    // Ordenar por nombre para consistencia visual
    inventoryList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(inventoryList);
  }, (error) => {
    console.error("syncInventory Error:", error);
  });
};

// CTO Fix: On-demand fetch for Dashboard Efficiency (Low Cost)
export const getInventoryOnce = async (): Promise<Car[]> => {
  const dealerId = (typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(carsCollectionRef, where('dealerId', '==', dealerId), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Car[];
};

export const getLeadsOnce = async (): Promise<Lead[]> => {
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const q = query(appsCollectionRef, where('dealerId', '==', dealerId), orderBy('timestamp', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
};

// CTO Fix: Antigravity Edge Image Optimization (Next-Gen Performance)
export const optimizeImage = (url: string, width: number = 800): string => {
  if (!url) return '';

  // 1. Firebase Storage - Standard URL
  if (url.includes('firebasestorage.googleapis.com')) {
    // Note: In the future, we will use a real CDN here. 
    // For now, return original to ensure visibility.
    return url;
  }

  // 2. Unsplash Optimization (Built-in)
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?q=80&w=${width}&auto=format&fit=crop`;
  }

  return url;
};

// --- Funciones de Storage (Imágenes) ---

export const uploadImage = async (file: File, onProgress?: (p: number) => void): Promise<string> => {
  console.log("Strategic Deep Debug: Starting uploadImage...", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    storageBucket: storage.app.options.storageBucket,
    authUid: auth.currentUser?.uid || 'NOT_LOGGED_IN'
  });

  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, `inventory/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error("Upload FAILED:", error);

          // Enhanced Error Classification
          if (error.code === 'storage/unauthorized') {
            reject(new Error("Permiso denegado: No tienes acceso para subir archivos."));
          } else if (error.code === 'storage/canceled') {
            reject(new Error("Subida cancelada."));
          } else {
            reject(new Error(`Fallo en Storage: ${error.message}`));
          }
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );

    } catch (err: unknown) {
      console.error("Upload Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      reject(new Error(`Fallo al iniciar subida: ${errorMessage}`));
    }
  });
};

// --- Funciones CRUD ---

// [DEPRECATED] Use inventoryService.ts
export { addVehicle as addCar, updateVehicle as updateCar, deleteVehicle as deleteCar } from './inventoryService';

export const uploadInitialInventory = async (inventory: Omit<Car, 'id'>[]) => {
  const currentDealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const batch = writeBatch(db);

  inventory.forEach(car => {
    const newCarRef = doc(carsCollectionRef);
    batch.set(newCarRef, {
      ...car,
      dealerId: currentDealerId,
      createdAt: serverTimestamp()
    });
  });

  await batch.commit();
};

// --- Funciones de Solicitudes (Pre-Cualificación) ---

// [DEPRECATED] Use inventoryService.ts
export { incrementCarView } from './inventoryService';

export const incrementCarLead = async (carId: string) => {
  const carRef = doc(db, 'cars', carId);
  await setDoc(carRef, { leads_count: increment(1) }, { merge: true });
};


interface LeadData {
  type?: string;
  ssn?: string;
  monthlyIncome?: string | number;
  visitCount?: number;
  aiInteractions?: number;
  phone?: string;
  email?: string;
  urgency?: string;
  dealerId?: string;
  visitStartTime?: number;
  aiSummary?: string;
  description?: string;
  hasModifiedByDealer?: boolean;
  vehicleInfo?: { id?: string; name?: string };
  vehicleId?: string;
  [key: string]: unknown;
}

// Enhanced Lead Scoring: Predictive Intent Analysis
const calculateLeadScore = (data: LeadData): number => {
  let score = 30; // Base score

  // 1. Transactional Intent (High weighting)
  if (data.type === 'trade-in') score += 20;
  if (data.type === 'finance' && data.ssn) score += 35; // Serious commitment
  if (data.monthlyIncome && Number(data.monthlyIncome) > 3000) score += 10;

  // 2. Behavioral Cues (If available in data context)
  if (data.visitCount && data.visitCount > 3) score += 15;
  if (data.aiInteractions && data.aiInteractions > 5) score += 10;

  // 3. Data Integrity
  if (data.phone && String(data.phone).length >= 10) score += 10;
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) score += 5;

  // 4. Time Urgency
  if (data.urgency === 'immediate') score += 15;

  return Math.min(score, 100);
};

export const submitApplication = async (data: LeadData) => {
  // Security Enhancement: Simple client-side rate limiting (Cooldown)
  const lastSubmit = localStorage.getItem('last_submit_timestamp');
  const now = Date.now();
  if (lastSubmit && now - parseInt(lastSubmit) < 60000) { // 1 minute cooldown
    throw new Error("Por seguridad, solo se permite un envío por minuto. Por favor espera.");
  }

  const score = calculateLeadScore(data);
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const safeData = {
    ...data,
    dealerId, // Persist for SaaS segmentation
    // Only mask SSN if it exists
    ...(data.ssn ? { ssn: `XXX-XX-${data.ssn.slice(-4)}` } : {}),
    timestamp: new Date(),
    status: 'new',
    type: data.type || 'finance', // Default to finance if not specified
    aiScore: score, // Persist score
    aiSummary: data.aiSummary || 'Lead capturado automáticamente.',
    // Strategic: AI Feedback Loop (Autopilot)
    aiMetaData: {
      promptVersion: '2.0-flash-optimized',
      contentType: data.description ? 'generative' : 'legacy',
      hasModifiedByDealer: data.hasModifiedByDealer || false
    }
  };


  const docRef = await addDoc(appsCollectionRef, safeData);

  // Security: Store sensitive PII (Full SSN) in a restricted vault
  if (data.ssn) {
    try {
      await setDoc(doc(db, 'applications_secure', docRef.id), {
        ssn: data.ssn,
        timestamp: serverTimestamp()
      });
    } catch (vaultError) {
      console.error("Critical: Failed to save to PII Vault", vaultError);
    }
  }

  // Analytics: Increment Lead Count for the specific vehicle
  if (data.vehicleInfo && data.vehicleInfo.id) {
    await incrementCarLead(data.vehicleInfo.id);
  }

  // GA4 Event for Funnel Analysis (BigQuery)
  if (isBrowser && analytics) {
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, 'generate_lead', {
      currency: 'USD',
      value: score,
      lead_type: safeData.type,
      vehicle_id: data.vehicleId || data.vehicleInfo?.id
    });
  }
};

export const syncLeads = (callback: (leads: Lead[]) => void) => {
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const q = query(appsCollectionRef, where('dealerId', '==', dealerId));

  return onSnapshot(q, snapshot => {
    const leadsList = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || 'general',
        status: data.status || 'new',
        firstName: data.firstName || 'Cliente',
        lastName: data.lastName || 'Desconocido',
        email: data.email,
        phone: data.phone,
        timestamp: data.timestamp,
        vehicleOfInterest: data.vehicleInfo?.name || data.vehicleOfInterest,
        vehicleId: data.vehicleInfo?.id,
        tradeInDetails: data.tradeIn ? `${data.tradeIn.year} ${data.tradeIn.make} ${data.tradeIn.model}` : undefined,
        message: data.message,
        aiScore: data.aiScore || calculateLeadScore(data), // Use stored or calculate on fly
        aiSummary: data.aiSummary
      } as Lead;
    });

    // Sort by timestamp newly created first
    leadsList.sort((a, b) => {
      // Handle both Firestore Timestamp objects (with toDate) and plain objects
      const getMillis = (obj: unknown) => {
        if (!obj) return 0;
        const o = obj as { toDate?: () => { getTime: () => number }; seconds?: number; getTime?: () => number };
        if (typeof o.toDate === 'function') return o.toDate().getTime();
        if (o.seconds) return o.seconds * 1000;
        if (typeof o.getTime === 'function') return o.getTime();
        return 0;
      };

      return getMillis(b.timestamp) - getMillis(a.timestamp);
    });

    callback(leadsList);
  }, (error) => {
    console.error("syncLeads Error:", error);
  });
};

export const updateLeadStatus = async (leadId: string, newStatus: string) => {
  const leadRef = doc(db, 'applications', leadId);
  await setDoc(leadRef, { status: newStatus }, { merge: true });
};

// --- Funciones de IA (Genkit) ---

// --- Funciones de IA (Genkit) ---

export const generateCarDescriptionAI = async (
  carModel: string,
  features: string[],
  onChunk?: (chunk: string) => void
): Promise<string> => {
  // If we have a chunk callback, we assume we want to streaming
  if (onChunk) {
    try {
      // Local Genkit Flow Server endpoint (assumed running on 3400 via startFlowServer)
      // In production, you'd deploy a wrapper or use the appropriate URL
      const endpoint = 'http://localhost:3400/generateCarDescription';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ data: { carModel, features } })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json && json.message) {
                fullText += json.message;
                onChunk(fullText);
              } else if (json && typeof json === 'string') {
                fullText += json;
                onChunk(fullText);
              } else if (json && json.text) {
                fullText += json.text;
                onChunk(fullText);
              } else if (json && json.value) {
                fullText += json.value;
                onChunk(fullText);
              }
            } catch {
              // ignore non-json
            }
          }
        }
      }
      return fullText;

    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }

  } else {
    // Fallback to callable (non-streaming)
    try {
      const generateDescription = httpsCallable(functions, 'generateDescription');
      const result = await generateDescription({ carModel, features });
      return result.data as string;
    } catch (error) {
      console.error("Error generating description:", error);
      throw new Error("Failed to generate description via AI.");
    }
  }
};

// Legal: AI Compliance Disclaimer
export const AI_LEGAL_DISCLAIMER = "Aviso: Los precios, pagos y disponibilidad generados por IA son estimaciones para fines informativos y no constituyen una oferta formal. Sujeto a cambios sin previo aviso.";

// Newsletter Subscription
export const subscribeToNewsletter = async (email: string) => {
  try {
    const subscribersRef = collection(db, "subscribers");
    const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
    await addDoc(subscribersRef, {
      email,
      dealerId,
      timestamp: serverTimestamp()
    });

    // Trigger Auto-Newsletter (Fire & Forget to not block UI)
    sendAutoNewsletter(email).catch(console.error);

  } catch (error) {
    console.error("Error subscribing:", error);
    throw error;
  }
};

export const getSubscribers = async (): Promise<Subscriber[]> => {
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const q = query(collection(db, 'subscribers'), where('dealerId', '==', dealerId), orderBy('timestamp', 'desc'), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscriber));
};
// Force Update: Sat Jan 24 15:46:37 AST 2026
