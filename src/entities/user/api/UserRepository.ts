import { User } from '../model/types';

export interface UserRepository {
  getUserById(id: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
}
