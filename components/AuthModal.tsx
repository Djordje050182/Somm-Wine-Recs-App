import React, { useState } from 'react';
import { X, Wine, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRegion } from '../contexts/RegionContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Button } from './ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const { region, wineries, regionId } = useRegion();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('consumer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wineryId, setWineryId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result =
        mode === 'signin'
          ? await signIn(email, password)
          : await signUp({
              name,
              email,
              password,
              role,
              wineryId: role === 'winery' ? wineryId || undefined : undefined,
            });

      if (result.ok === false) {
        setError(result.error);
        return;
      }
      onClose();
      if (result.user.role === 'winery') {
        navigate(`/${regionId}/portal`);
      }
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full bg-paper border border-hairline rounded-sm px-3.5 py-2.5 font-ui text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-claret transition-colors';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-parchment border border-hairline rounded-sm w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink/40 hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <p className="kicker mb-2">{mode === 'signin' ? 'Welcome back' : 'Join the table'}</p>
          <h2 className="font-display text-3xl text-ink mb-1">
            {mode === 'signin' ? 'Good to see you again.' : 'Pull up a chair.'}
          </h2>
          <p className="font-body text-ink/50 mb-6">
            {mode === 'signin'
              ? 'Your cellar, cases and saved estates are where you left them.'
              : 'Keep a cellar, save the estates you love, and let the Somm get to know your taste.'}
          </p>

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setRole('consumer')}
                className={`flex flex-col items-start gap-1.5 border rounded-sm p-3.5 text-left transition-colors ${
                  role === 'consumer' ? 'border-claret bg-paper' : 'border-hairline hover:border-ink/30'
                }`}
              >
                <Wine className={`w-4 h-4 ${role === 'consumer' ? 'text-claret' : 'text-ink/40'}`} />
                <span className="font-ui text-xs font-semibold text-ink">Wine lover</span>
                <span className="font-body text-xs text-ink/50 leading-snug">Explore, plan and collect</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('winery')}
                className={`flex flex-col items-start gap-1.5 border rounded-sm p-3.5 text-left transition-colors ${
                  role === 'winery' ? 'border-claret bg-paper' : 'border-hairline hover:border-ink/30'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'winery' ? 'text-claret' : 'text-ink/40'}`} />
                <span className="font-ui text-xs font-semibold text-ink">Winery</span>
                <span className="font-body text-xs text-ink/50 leading-snug">Manage your listing and wines</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder={role === 'winery' ? 'Your name' : 'Full name'}
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
                required
              />
            )}
            {mode === 'signup' && role === 'winery' && (
              <select
                value={wineryId}
                onChange={e => setWineryId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select your estate in {region.name}…</option>
                {[...wineries]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              required
              minLength={mode === 'signup' ? 6 : undefined}
            />

            {error && <p className="font-ui text-xs text-terracotta">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="font-body text-sm text-ink/50 mt-5 text-center">
            {mode === 'signin' ? (
              <>
                New here?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-claret font-semibold hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already at the table?{' '}
                <button onClick={() => { setMode('signin'); setError(''); }} className="text-claret font-semibold hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="font-ui text-[10px] text-ink/30 mt-6 text-center uppercase tracking-kicker">
            Demonstration accounts — stored on this device only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
