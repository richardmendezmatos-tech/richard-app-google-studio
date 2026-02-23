import { db } from '@/infra/firebase/client';
import { doc, getDoc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore/lite';
import { AppUser, UserRole } from '../../domain/entities';

export class FirestoreUserRepository {
    async getUserProfile(uid: string): Promise<AppUser | null> {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as AppUser) : null;
    }

    async saveUserProfile(uid: string, profile: Partial<AppUser>): Promise<void> {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, { ...profile, updatedAt: new Date() }, { merge: true });
    }

    async getUserRole(uid: string): Promise<UserRole> {
        const profile = await this.getUserProfile(uid);
        return profile?.role || 'user';
    }

    async logActivity(data: Record<string, any>): Promise<void> {
        try {
            await addDoc(collection(db, 'audit_logs'), {
                ...data,
                timestamp: new Date()
            });
        } catch (e) {
            console.warn("[UserRepository] Logging failed:", e);
        }
    }

    async deleteRateLimit(id: string): Promise<void> {
        await deleteDoc(doc(db, 'login_attempts', id));
    }
}
