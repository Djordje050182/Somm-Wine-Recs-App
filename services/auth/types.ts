import { AuthUser, UserRole } from '../../types';

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  wineryId?: string;
}

/**
 * Auth provider contract. The app only ever talks to this interface —
 * swap the localStorage implementation for Supabase/Firebase later by
 * changing one line in services/auth/index.ts. No UI changes required.
 */
export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  signUp(input: SignUpInput): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  updateProfile(patch: Partial<Pick<AuthUser, 'name' | 'tier'>>): Promise<AuthUser | null>;
  onAuthChange(cb: (user: AuthUser | null) => void): () => void;
}
