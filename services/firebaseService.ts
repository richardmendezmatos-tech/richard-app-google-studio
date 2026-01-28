
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Explicit persistence for stability
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  increment,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  getAggregateFromServer,
  getCountFromServer,
  sum,
  average,
  AggregateField,
  initializeFirestore,
  QueryDocumentSnapshot,
  enableMultiTabIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check"; // App Check Enterprise
import { firebaseConfig } from "../firebaseConfig";
import { Car, Lead } from "../types";
import { sendAutoNewsletter } from "./emailService";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase Services
export const auth = getAuth(app);

export const db = initializeFirestore(app, {});

// CTO Hack: Force LOCAL persistence to avoid session drops in strict browsers
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence Config Failed:", err));
}

export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Performance Monitoring
let performance;
if (typeof window !== 'undefined') {
  performance = getPerformance(app);

  // Initialize App Check (Security)
  // Enable Debug Token for Localhost
  if (import.meta.env.DEV) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
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
if (import.meta.env.DEV) {
  // connectFunctionsEmulator(functions, "localhost", 5001); 
}

const carsCollectionRef = collection(db, 'cars');
const appsCollectionRef = collection(db, 'applications');

// --- Aggregation Queries (Optimization) ---
export const getInventoryStats = async () => {
  const coll = collection(db, 'cars');
  const snapshot = await getAggregateFromServer(coll, {
    count: (sum as any)('count') || ((field: any) => new (AggregateField as any)('count')), // v10 syntax varies, simplified
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

export interface PaginatedResult {
  cars: Car[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export const getPaginatedCars = async (
  pageSize: number = 9,
  lastVisible: QueryDocumentSnapshot | null = null,
  filterType: string = 'all',
  sortOrder: 'asc' | 'desc' | null = null
): Promise<PaginatedResult> => {
  const constraints: any[] = [];

  // 1. Filter
  if (filterType && filterType !== 'all') {
    constraints.push(where('type', '==', filterType));
  }

  // 2. Sort
  // Must generally match where clause or exist as composite index
  if (sortOrder) {
    constraints.push(orderBy('price', sortOrder));
  } else {
    // Default consistent sort
    constraints.push(orderBy('name', 'asc'));
  }

  // 3. Cursor
  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }

  // 4. Limit
  constraints.push(limit(pageSize));

  // STEP 5.1: SaaS Filter (Multi-tenancy)
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  constraints.push(where('dealerId', '==', dealerId));

  const q = query(carsCollectionRef, ...constraints);

  try {
    const snapshot = await getDocs(q);
    const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Car[];
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return {
      cars,
      lastDoc,
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (e: any) {
    console.error("Pagination Error:", e);
    // Fallback if index missing: return empty or try without sort
    if (e.code === 'failed-precondition') {
      console.warn("Index missing for this query. Check console link.");
    }
    throw e;
  }
};

// --- Funciones de Base de Datos (Firestore) --- (Moved auth to authService.ts)


// --- Funciones de Base de Datos (Firestore) ---

export const syncInventory = (callback: (inventory: Car[]) => void) => {
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
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
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const q = query(carsCollectionRef, where('dealerId', '==', dealerId), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Car[];
};

export const getLeadsOnce = async (): Promise<Lead[]> => {
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const q = query(appsCollectionRef, where('dealerId', '==', dealerId), orderBy('timestamp', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
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

    } catch (error: any) {
      console.error("Upload Error:", error);
      reject(new Error(`Fallo al iniciar subida: ${error.message}`));
    }
  });
};

// --- Funciones CRUD ---

export const addCar = async (carData: Omit<Car, 'id'>) => {
  const currentDealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  console.log(`[CRUD] Starting addCar... Dealer: ${currentDealerId}`);

  // No manual timeout - Using native Firestore retry behavior.
  await addDoc(carsCollectionRef, {
    dealerId: currentDealerId, // Default first
    ...carData, // Override if present
    createdAt: serverTimestamp()
  });

  console.log("[CRUD] addCar completed successfully.");
};

export const updateCar = async (car: Car) => {
  const currentDealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  console.log(`[CRUD] Starting updateCar for ${car.id}...`);

  const carDocRef = doc(db, 'cars', car.id);
  const { id, ...dataToUpdate } = car;

  await setDoc(carDocRef, {
    ...dataToUpdate,
    dealerId: currentDealerId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log(`[CRUD] updateCar completed for ${car.id}.`);
};

export const deleteCar = async (id: string) => {
  const carDocRef = doc(db, 'cars', id);
  await deleteDoc(carDocRef);
};

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

export const incrementCarView = async (carId: string) => {
  const carRef = doc(db, 'cars', carId);
  await setDoc(carRef, { views: increment(1) }, { merge: true });

  if (typeof window !== 'undefined') {
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, 'view_item', {
      items: [{ item_id: carId }]
    });
  }
};

export const incrementCarLead = async (carId: string) => {
  const carRef = doc(db, 'cars', carId);
  await setDoc(carRef, { leads_count: increment(1) }, { merge: true });
};


// Enhanced Lead Scoring: Predictive Intent Analysis
const calculateLeadScore = (data: any): number => {
  let score = 30; // Base score

  // 1. Transactional Intent (High weighting)
  if (data.type === 'trade-in') score += 20;
  if (data.type === 'finance' && data.ssn) score += 35; // Serious commitment
  if (data.monthlyIncome && Number(data.monthlyIncome) > 3000) score += 10;

  // 2. Behavioral Cues (If available in data context)
  if (data.visitCount && data.visitCount > 3) score += 15;
  if (data.aiInteractions && data.aiInteractions > 5) score += 10;

  // 3. Data Integrity
  if (data.phone && data.phone.length >= 10) score += 10;
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) score += 5;

  // 4. Time Urgency
  if (data.urgency === 'immediate') score += 15;

  return Math.min(score, 100);
};

export const submitApplication = async (data: any) => {
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


  await addDoc(appsCollectionRef, safeData);

  // Analytics: Increment Lead Count for the specific vehicle
  if (data.vehicleInfo && data.vehicleInfo.id) {
    await incrementCarLead(data.vehicleInfo.id);
  }

  // GA4 Event for Funnel Analysis (BigQuery)
  if (typeof window !== 'undefined') {
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, 'generate_lead', {
      currency: 'USD',
      value: score, // Use AI score as value proxy
      lead_type: safeData.type,
      vehicle_id: safeData.vehicleId
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
      const getMillis = (obj: any) => {
        if (!obj) return 0;
        if (typeof obj.toDate === 'function') return obj.toDate().getTime();
        if (obj.seconds) return obj.seconds * 1000;
        if (obj instanceof Date) return obj.getTime();
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
            } catch (e) {
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

export const getSubscribers = async (): Promise<any[]> => {
  const dealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
  const q = query(collection(db, 'subscribers'), where('dealerId', '==', dealerId), orderBy('timestamp', 'desc'), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Force Update: Sat Jan 24 15:46:37 AST 2026
