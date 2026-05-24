
import React, { useState } from 'react';
import { X, Wine, Building2, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { AccountType } from '../types';
import { WINERIES } from '../data/wineries';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string; tier?: string; accountType: AccountType; wineryId?: number }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<AccountType>('consumer');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wineryId, setWineryId] = useState<number | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setName(''); setEmail(''); setPassword(''); setError(''); setWineryId(null);
  };

  const handleSubmit = () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return; }
    if (accountType === 'estate_owner' && !wineryId) { setError('Please select your winery.'); return; }

    const savedUsers: any[] = JSON.parse(localStorage.getItem('sommUsers') || '[]');

    if (mode === 'login') {
      const existing = savedUsers.find(u => u.email === email);
      if (!existing) { setError('No account found with that email.'); return; }
      if (existing.password !== password) { setError('Incorrect password.'); return; }
      const { password: _, ...user } = existing;
      onLogin(user);
    } else {
      if (savedUsers.find(u => u.email === email)) { setError('An account with this email already exists.'); return; }
      const winery = wineryId ? WINERIES.find(w => w.id === wineryId) : null;
      const newUser = {
        name: accountType === 'estate_owner' ? (winery?.name || name) : name,
        email,
        password,
        tier: accountType === 'estate_owner' ? 'Free' : 'Member',
        accountType,
        wineryId: wineryId || undefined,
      };
      savedUsers.push(newUser);
      localStorage.setItem('sommUsers', JSON.stringify(savedUsers));
      const { password: _, ...user } = newUser;
      onLogin(user);
    }
    reset();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-[#1a1a1a] px-8 pt-8 pb-10 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-[#6b1e2e] rounded-full blur-[60px] opacity-50 pointer-events-none" />
          <button onClick={onClose} className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-white/10 p-2 rounded-xl"><Wine className="w-5 h-5 text-[#a68d60]" /></div>
              <span className="font-serif font-bold text-white text-xl">Somm<span className="text-[#a68d60]">.</span></span>
            </div>
            <h2 className="text-2xl font-bold text-white font-serif mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-white/50 text-sm">
              {mode === 'login' ? 'Sign in to access your account.' : 'Join the Hunter Valley wine community.'}
            </p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-5">
          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAccountType('consumer')}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${accountType === 'consumer' ? 'border-[#6b1e2e] bg-[#6b1e2e]/5' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`p-2 rounded-xl ${accountType === 'consumer' ? 'bg-[#6b1e2e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#1a1a1a]">Wine Lover</div>
                <div className="text-[10px] text-gray-400">Explore & buy</div>
              </div>
            </button>
            <button
              onClick={() => setAccountType('estate_owner')}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${accountType === 'estate_owner' ? 'border-[#a68d60] bg-[#a68d60]/5' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`p-2 rounded-xl ${accountType === 'estate_owner' ? 'bg-[#a68d60] text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-[#1a1a1a]">Estate Owner</div>
                <div className="text-[10px] text-gray-400">Manage & sell</div>
              </div>
            </button>
          </div>

          {/* Estate selector */}
          {accountType === 'estate_owner' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Winery</label>
              <select
                className="w-full bg-[#f8f4f0] p-3.5 rounded-xl font-medium text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#a68d60]/30"
                value={wineryId || ''}
                onChange={e => setWineryId(Number(e.target.value))}
              >
                <option value="" disabled>Select your estate...</option>
                {WINERIES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          {/* Name (signup only) */}
          {mode === 'signup' && accountType === 'consumer' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-[#e5e1da] p-3.5 rounded-xl focus:outline-none focus:border-[#6b1e2e]"
                placeholder="Alex Sommelier"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-[#e5e1da] p-3.5 rounded-xl focus:outline-none focus:border-[#6b1e2e]"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-[#e5e1da] p-3.5 pr-12 rounded-xl focus:outline-none focus:border-[#6b1e2e]"
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl font-medium">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${accountType === 'estate_owner' ? 'bg-[#a68d60] hover:bg-[#8e7850] text-white' : 'bg-[#6b1e2e] hover:bg-[#852539] text-white'}`}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
              className="text-[#6b1e2e] font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
