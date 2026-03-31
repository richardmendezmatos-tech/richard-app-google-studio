import {
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { UserRepository } from './UserRepository';
import { User } from '../model/types';
import { withSecureErrorHandling } from '@/shared/lib/errors/AppError';

export class FirestoreUserRepository implements UserRepository {
  private collectionName = 'users';

  async getUserById(id: string): Promise<User | null> {
    return withSecureErrorHandling(async () => {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as User;
    });
  }

  async getCurrentUser(): Promise<User | null> {
    // Basic placeholder for now since session management is in shared/auth
    return null;
  }
}
