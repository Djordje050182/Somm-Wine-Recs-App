// Demonstration auth provider backed by localStorage.
// Passwords are salted and hashed with WebCrypto before storage — this is
// still a client-side demo, not production security, but nothing is stored
// in plaintext. Swap for a hosted provider via services/auth/index.ts.

import { AuthUser } from '../../types';
import { AuthService, AuthResult, SignUpInput } from './types';

const USERS_KEY = 'sommAccounts';
const SESSION_KEY = 'sommSession';

interface StoredAccount {
  user: AuthUser;
  salt: string;
  passwordHash: string;
}

type Listener = (user: AuthUser | null) => void;
const listeners = new Set<Listener>();

const notify = (user: AuthUser | null) => listeners.forEach(cb => cb(user));

const readAccounts = (): StoredAccount[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const writeAccounts = (accounts: StoredAccount[]) => localStorage.setItem(USERS_KEY, JSON.stringify(accounts));

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

const newSalt = (): string => toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);

export const localAuthService: AuthService = {
  async getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password || !input.name.trim()) {
      return { ok: false, error: 'Name, email and password are all required.' };
    }
    if (input.password.length < 6) {
      return { ok: false, error: 'Password needs at least six characters.' };
    }
    const accounts = readAccounts();
    if (accounts.some(a => a.user.email === email)) {
      return { ok: false, error: 'An account with that email already exists. Sign in instead.' };
    }
    const salt = newSalt();
    const user: AuthUser = {
      id: `u-${crypto.randomUUID()}`,
      name: input.name.trim(),
      email,
      role: input.role,
      wineryId: input.wineryId,
      createdAt: new Date().toISOString(),
    };
    accounts.push({ user, salt, passwordHash: await hashPassword(input.password, salt) });
    writeAccounts(accounts);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    notify(user);
    return { ok: true, user };
  },

  async signIn(emailRaw: string, password: string): Promise<AuthResult> {
    const email = emailRaw.trim().toLowerCase();
    const account = readAccounts().find(a => a.user.email === email);
    if (!account) return { ok: false, error: 'No account found with that email.' };
    const hash = await hashPassword(password, account.salt);
    if (hash !== account.passwordHash) return { ok: false, error: 'That password does not match.' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(account.user));
    notify(account.user);
    return { ok: true, user: account.user };
  },

  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    notify(null);
  },

  async updateProfile(patch) {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const current = JSON.parse(raw) as AuthUser;
    const updated = { ...current, ...patch };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const accounts = readAccounts();
    const idx = accounts.findIndex(a => a.user.id === current.id);
    if (idx >= 0) {
      accounts[idx].user = updated;
      writeAccounts(accounts);
    }
    notify(updated);
    return updated;
  },

  onAuthChange(cb: Listener) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
