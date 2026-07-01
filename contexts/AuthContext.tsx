import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthUser } from '../types';
import { auth, SignUpInput, AuthResult } from '../services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'tier'>>) => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
    return auth.onAuthChange(setUser);
  }, []);

  const signUp = useCallback((input: SignUpInput) => auth.signUp(input), []);
  const signIn = useCallback((email: string, password: string) => auth.signIn(email, password), []);
  const signOut = useCallback(() => auth.signOut(), []);
  const updateProfile = useCallback(
    (patch: Partial<Pick<AuthUser, 'name' | 'tier'>>) => auth.updateProfile(patch),
    []
  );

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
