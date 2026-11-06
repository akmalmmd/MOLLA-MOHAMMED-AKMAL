import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Lock, Mail, User, Phone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await register(name, email, password, phone);
        if (!res.success) {
          setError(res.message);
          return;
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message);
          return;
        }
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (userType: 'alice' | 'bob' | 'admin') => {
    setError(null);
    if (userType === 'alice') {
      setMode('login');
      setEmail('alice@example.com');
      setPassword('password123');
    } else if (userType === 'bob') {
      setMode('login');
      setEmail('bob@example.com');
      setPassword('password123');
    } else if (userType === 'admin') {
      setMode('admin');
      setEmail('admin@grandpalace.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setMode('admin');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'admin'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Admin Portal
          </button>
        </div>

        {/* Quick Demo Pre-fill Pills */}
        <div className="mb-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>1-Click Test Credentials</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => quickFill('alice')}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Alice (Customer)
            </button>
            <button
              type="button"
              onClick={() => quickFill('bob')}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Bob (Customer)
            </button>
            <button
              type="button"
              onClick={() => quickFill('admin')}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900 text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Admin (admin@grandpalace.com)
            </button>
          </div>
        </div>

        {/* Form Header */}
        <div className="mb-4">
          <h3 className="text-xl font-serif font-bold text-slate-900">
            {mode === 'register'
              ? 'Create Customer Account'
              : mode === 'admin'
              ? 'Hotel Administrator Login'
              : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'register'
              ? 'Sign up to book rooms, manage reservations, and access concierge benefits.'
              : mode === 'admin'
              ? 'Authorized staff login to manage room inventory and hotel reservations.'
              : 'Enter your credentials to manage your stays and book available rooms.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-slate-900/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              'Authenticating...'
            ) : mode === 'register' ? (
              'Create My Account'
            ) : mode === 'admin' ? (
              <span className="flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-4 h-4" /> Admin Login
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
