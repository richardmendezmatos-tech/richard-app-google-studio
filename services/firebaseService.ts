
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  AuthError,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  writeBatch,
  increment,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "../firebaseConfig";
import { Car, UserRole, Lead } from "../types";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

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
  // Note: Genkit usually serves on a different port or wraps functions.
  // Standard firebase emulator port for functions is 5001.
  // But Genkit dev UI is 4000.  Usually Genkit dev server proxies callable calls?
  // Let's assume standard callable function behavior for now.
}

const carsCollectionRef = collection(db, 'cars');
const appsCollectionRef = collection(db, 'applications');

// --- Funciones de Autenticación & Roles ---

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Función auxiliar para obtener el rol
export const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return 'user'; // Default role
  } catch (e) {
    console.error("Error fetching role:", e);
    return 'user';
  }
};

/**
 * LOGIN PARA CLIENTES
 * Simula endpoint: /api/v1/auth/client/login
 * Regla: RECHAZA si el usuario tiene rol de 'admin'.
 */
export const loginUserClient = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const role = await getUserRole(userCredential.user.uid);

  if (role === 'admin') {
    await signOut(auth); // Seguridad: Cerrar sesión inmediatamente
    throw new Error("ADMIN_PORTAL_ONLY: Acceso no autorizado en este portal.");
  }

  return userCredential;
};

/**
 * LOGIN PARA ADMINISTRADORES
 * Simula endpoint: /api/v1/auth/admin/login
 * Reglas:
 * 1. RECHAZA si el usuario NO tiene rol de 'admin'.
 * 2. Valida un token 2FA (simulado).
 */

// --- Helper para obtener IP (Client-side best effort) ---
const getClientIP = async (): Promise<string> => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    return 'unknown_ip';
  }
};

// --- Auditoría y Seguridad ---
const auditLogsRef = collection(db, 'audit_logs');
const rateLimitsRef = collection(db, 'login_attempts'); // Para Rate Limiting

export const logAdminAccess = async (email: string, success: boolean, method: string) => {
  const ip = await getClientIP();
  const device = navigator.userAgent;

  await addDoc(auditLogsRef, {
    email,
    ip,
    device,
    method, // 'password', '2fa', 'passkey'
    success,
    timestamp: new Date(),
    location: window.location.pathname
  });
};

/**
 * LOGIN PARA ADMINISTRADORES (SECURED)
 * Implementa:
 * 1. Rate Limiting (Check de intentos fallidos en Firestore)
 * 2. Role Check
 * 3. 2FA Check
 * 4. Audit Logging
 */
export const loginAdmin = async (email: string, password: string, twoFactorCode: string) => {
  // Optimization: Parallelize IP check and Auth attempt to reduce waterfall latency
  const [ip, authResult] = await Promise.all([
    getClientIP(),
    signInWithEmailAndPassword(auth, email, password).catch(e => ({ error: e } as any))
  ]);

  const attemptId = `${email}_${ip}`.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize for doc ID

  // Helper to record failures
  const recordFailure = async () => {
    const currentAttempts = rateLimitDoc.exists() ? rateLimitDoc.data().attempts : 0;
    await setDoc(doc(rateLimitsRef, attemptId), {
      attempts: currentAttempts + 1,
      lastAttempt: new Date().getTime(),
      ip
    }, { merge: true });
  };

  // 1. Check Rate Limit (Frontend enforcement logic backed by Firestore)
  const rateLimitDoc = await getDoc(doc(rateLimitsRef, attemptId));
  if (rateLimitDoc.exists()) {
    const data = rateLimitDoc.data();
    const now = new Date().getTime();
    if (data.attempts >= 5 && now - data.lastAttempt < 15 * 60 * 1000) { // 15 min ban
      await logAdminAccess(email, false, 'blocked_ip');
      // If we authenticated successfully but are rate limited, sign out immediately
      if (!(authResult as any).error) await signOut(auth);
      throw new Error("ACCESS_DENIED: IP bloqueada temporalmente por intentos fallidos. Intente en 15 minutos.");
    }
  }

  // Handle Auth Result from the parallel promise
  if ((authResult as any).error) {
    const error = (authResult as any).error;
    await recordFailure();

    if (!error.message.includes("IP bloqueada")) {
      await logAdminAccess(email, false, 'auth_failed');
    }
    throw error;
  }

  const userCredential = authResult as any;

  try {
    const role = await getUserRole(userCredential.user.uid);

    if (role !== 'admin') {
      await signOut(auth);
      await recordFailure();
      await logAdminAccess(email, false, 'role_check_failed');
      throw new Error("ACCESS_DENIED: Credenciales no válidas para este portal.");
    }

    // 2. 2FA Check (Simulado pero estricto)
    if (twoFactorCode !== '123456') {
      await logAdminAccess(email, false, '2fa_failed');
      await signOut(auth);
      await recordFailure();
      throw new Error("INVALID_2FA: Token de seguridad incorrecto.");
    }

    // Success - Reset attempts & Log
    if (rateLimitDoc.exists()) {
      await deleteDoc(doc(rateLimitsRef, attemptId));
    }
    await logAdminAccess(email, true, 'login_success');
    return userCredential;

  } catch (error: any) {
    // If logic inside try fails (and wasn't handled specifically above), propagate
    throw error;
  }
};

export const registerUser = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Al registrarse, creamos el perfil en Firestore
  // Lógica simple para demo: Si el email contiene "admin" o "richard", es admin.
  // En producción, esto se haría manualmente o mediante Claims.
  const role: UserRole = email.includes('admin') || email.includes('richard') ? 'admin' : 'user';

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    role,
    createdAt: new Date()
  });

  return userCredential;
};

export const logoutUser = () => {
  return signOut(auth);
};

// Social Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const loginWithGoogle = async () => {
  try {
    // Force persistence to be local (survives browser restart)
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    // Verificar si existe perfil, si no, crearlo como user
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: 'user', // Social login siempre es user por defecto para seguridad
        createdAt: new Date()
      });
    }
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: 'user',
        createdAt: new Date()
      });
    }
    return result.user;
  } catch (error) {
    throw error;
  }
};


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
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
      return dateB.getTime() - dateA.getTime();
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
