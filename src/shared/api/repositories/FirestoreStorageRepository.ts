import { db, isBrowser } from '@/shared/api/firebase/client';
import { getStorageService } from '@/shared/api/firebase/optionalServices';

export class FirestoreStorageRepository {
  async uploadImage(file: File): Promise<string> {
    const storage = await getStorageService();
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const dealerId =
      (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
    const storageRef = ref(storage, `${dealerId}/profiles/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}
