
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
  AuthError
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
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "../firebaseConfig";
import { Car, UserRole } from "../types";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

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
export const loginAdmin = async (email: string, password: string, twoFactorCode: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const role = await getUserRole(userCredential.user.uid);

  if (role !== 'admin') {
    await signOut(auth);
    throw new Error("ACCESS_DENIED: Credenciales no válidas para este portal.");
  }

  // Simulación de validación 2FA (En producción, esto se verificaría con un servicio como Authy/Google Authenticator)
  if (twoFactorCode !== '123456') { // Código de demo
    await signOut(auth);
    throw new Error("INVALID_2FA: Token de seguridad incorrecto.");
  }

  return userCredential;
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

export const submitApplication = async (data: any) => {
  const safeData = {
    ...data,
    ssn: `XXX-XX-${data.ssn.slice(-4)}`,
    timestamp: new Date(),
    status: 'pending'
  };


  await addDoc(appsCollectionRef, safeData);
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
