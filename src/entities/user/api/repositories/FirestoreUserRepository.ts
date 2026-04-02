import { db } from '@/shared/api/firebase/firebaseService';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from '../../model/types';

export class FirestoreUserRepository {
  private USERS_COLLECTION = 'users';
  private LOGS_COLLECTION = 'audit_logs';
  private LIMITS_COLLECTION = 'login_attempts';

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }

  async saveUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    await setDoc(userRef, data, { merge: true });
  }

  async getUserRole(uid: string): Promise<UserRole> {
    const profile = await this.getUserProfile(uid);
    return profile?.role || 'user';
  }

  async logActivity(activity: any): Promise<void> {
    await addDoc(collection(db, this.LOGS_COLLECTION), {
      ...activity,
      timestamp: serverTimestamp(),
    });
  }

  async deleteRateLimit(attemptId: string): Promise<void> {
    const limitRef = doc(db, this.LIMITS_COLLECTION, attemptId);
    await deleteDoc(limitRef);
  }

  async getUserByPasskeyId(passkeyId: string): Promise<UserProfile | null> {
    const q = query(collection(db, this.USERS_COLLECTION), where('passkeyId', '==', passkeyId));
    const snap = await getDocs(q);
    return !snap.empty ? (snap.docs[0].data() as UserProfile) : null;
  }
}
