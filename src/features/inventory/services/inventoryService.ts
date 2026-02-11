import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    increment,
    QueryDocumentSnapshot,
    setDoc,
    writeBatch
} from 'firebase/firestore/lite';
import { db, getStorageService, getAnalyticsService } from '@/services/firebaseService';
import { Car } from '@/types/types';

const CARS_COLLECTION = 'cars';

export interface PaginatedResult {
    cars: Car[];
    lastDoc: QueryDocumentSnapshot | null;
    hasMore: boolean;
}

// --- Data Fetching ---

export const getPaginatedCars = async (
    pageSize: number = 9,
    lastVisible: QueryDocumentSnapshot | null = null,
    filterType: string = 'all',
    sortOrder: 'asc' | 'desc' | null = null
): Promise<PaginatedResult> => {
    const constraints: any[] = [];
    const carsCollectionRef = collection(db, CARS_COLLECTION);

    // 5. Multi-tenancy (Moved up to be an equality filter)
    let dealerId = (typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null);
    if (!dealerId || dealerId === 'undefined' || dealerId === 'null') {
        dealerId = 'richard-automotive';
    }
    constraints.push(where('dealerId', '==', dealerId));

    // 1. Filter
    if (filterType && filterType !== 'all') {
        constraints.push(where('type', '==', filterType));
    }

    // 2. Sort
    if (sortOrder) {
        constraints.push(orderBy('price', sortOrder));
    } else {
        constraints.push(orderBy('createdAt', 'desc'));
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
        throw e;
    }
};

export const getCarById = async (id: string): Promise<Car | null> => {
    try {
        const docRef = doc(db, CARS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Car;
        }
        return null;
    } catch (error) {
        console.error("Error fetching car:", error);
        return null;
    }
};

// --- CRUD Operations (Admin) ---

export const addVehicle = async (carData: Omit<Car, 'id'>): Promise<string> => {
    const currentDealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';

    const docRef = await addDoc(collection(db, CARS_COLLECTION), {
        ...carData,
        dealerId: currentDealerId,
        views: 0,
        leads_count: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return docRef.id;
};

export const updateVehicle = async (id: string, updates: Partial<Car>) => {
    const docRef = doc(db, CARS_COLLECTION, id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};

export const deleteVehicle = async (id: string) => {
    await deleteDoc(doc(db, CARS_COLLECTION, id));
};

export const uploadInitialInventory = async (inventory: Omit<Car, 'id'>[]) => {
    const currentDealerId = localStorage.getItem('current_dealer_id') || 'richard-automotive';
    const batch = writeBatch(db);

    inventory.forEach(car => {
        const newCarRef = doc(collection(db, CARS_COLLECTION));
        batch.set(newCarRef, {
            ...car,
            dealerId: currentDealerId,
            createdAt: serverTimestamp()
        });
    });

    await batch.commit();
};

// --- Metrics & Analytics ---

export const incrementCarView = async (carId: string) => {
    const carRef = doc(db, CARS_COLLECTION, carId);
    await setDoc(carRef, { views: increment(1) }, { merge: true });

    const analytics = await getAnalyticsService();
    if (typeof window !== 'undefined' && analytics) {
        const { logEvent } = await import('firebase/analytics');
        logEvent(analytics, 'view_item', {
            items: [{ item_id: carId }]
        });
    }
};

// --- Image Management ---

export const uploadVehicleImages = async (files: File[], vin: string): Promise<string[]> => {
    const storage = await getStorageService();
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
    const uploadPromises = files.map(file => {
        const path = `vehicles/${vin}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed',
                null,
                (error) => reject(error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(resolve);
                }
            );
        });
    });

    return Promise.all(uploadPromises);
};
