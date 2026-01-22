
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Only getAuth needed for export
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
  QueryDocumentSnapshot
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check"; // App Check Enterprise
import {
  getCountFromServer,
  getAggregateFromServer,
  sum,
  average,
  AggregateField
} from "firebase/firestore"; // Aggregations
import { firebaseConfig } from "../firebaseConfig";
import { Car, Lead } from "../types";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Performance Monitoring
let performance;
if (typeof window !== 'undefined') {
  performance = getPerformance(app);

  // Initialize App Check (Security)
  // Note: Replacing generic "debug" with actual ReCaptcha key in prod is required.
  // Using Debug provider for localhost to avoid issues during dev.
  // Enable Debug Token for Localhost
  if (import.meta.env.DEV) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const appCheckKey = import.meta.env.VITE_RECAPTCHA_KEY;
  if (appCheckKey) {
    // Elite Security: Enterprise ReCaptcha
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckKey),
      isTokenAutoRefreshEnabled: true
    });
  }
}
export { performance };

// Enable Offline Persistence
import { enableMultiTabIndexedDbPersistence } from "firebase/firestore";
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open.');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported by browser.');
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
  let constraints: any[] = [];

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
  return onSnapshot(carsCollectionRef, snapshot => {
    const inventoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Car[];
    // Ordenar por nombre para consistencia visual
    inventoryList.sort((a, b) => a.name.localeCompare(b.name));
    callback(inventoryList);
  });
};

// --- Funciones de Storage (Imágenes) ---

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `inventory/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw new Error("No se pudo subir la imagen a Firebase Storage.");
  }
};

// --- Funciones CRUD ---

export const addCar = async (carData: Omit<Car, 'id'>) => {
  await addDoc(carsCollectionRef, carData);
};

export const updateCar = async (car: Car) => {
  const carDocRef = doc(db, 'cars', car.id);
  const { id, ...dataToUpdate } = car;
  await setDoc(carDocRef, dataToUpdate);
};

export const deleteCar = async (id: string) => {
  const carDocRef = doc(db, 'cars', id);
  await deleteDoc(carDocRef);
};

export const uploadInitialInventory = async (inventory: Omit<Car, 'id'>[]) => {
  const batch = writeBatch(db);

  inventory.forEach(car => {
    const newCarRef = doc(carsCollectionRef);
    batch.set(newCarRef, car);
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


// Helper to calculate score based on data completeness and intent
const calculateLeadScore = (data: any): number => {
  let score = 40; // Base score for interest

  // High Intent Signals
  if (data.type === 'trade-in') score += 15; // Putting skin in the game
  if (data.type === 'finance' && data.ssn) score += 25; // Serious buyer providing sensitive info

  // Data Quality
  if (data.firstName && data.lastName) score += 5;
  if (data.phone && data.phone.length >= 10) score += 15;
  if (data.email && data.email.includes('@')) score += 10;

  // Context
  if (data.vehicleInfo && data.vehicleInfo.id) score += 10;
  if (data.monthlyIncome && Number(data.monthlyIncome) > 2000) score += 10;
  if (data.message && data.message.length > 20) score += 5;

  return Math.min(score, 99); // Cap at 99
};

export const submitApplication = async (data: any) => {
  const score = calculateLeadScore(data);
  const safeData = {
    ...data,
    // Only mask SSN if it exists
    ...(data.ssn ? { ssn: `XXX-XX-${data.ssn.slice(-4)}` } : {}),
    timestamp: new Date(),
    status: 'new',
    type: data.type || 'finance', // Default to finance if not specified
    aiScore: score, // Persist score
    aiSummary: data.aiSummary || 'Lead capturado automáticamente.'
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
  return onSnapshot(appsCollectionRef, snapshot => {
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
