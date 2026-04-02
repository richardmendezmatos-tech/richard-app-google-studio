export type UserRole = 'admin' | 'user' | 'sales' | 'manager' | string;

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  dealerId?: string;
  isGhost?: boolean;
}

export interface UserProfile extends AppUser {
  dealerId: string;
  dealerName: string;
  createdAt: Date;
  isBlocked?: boolean;
  passkeyEnabled?: boolean;
  passkeyId?: string;
}
