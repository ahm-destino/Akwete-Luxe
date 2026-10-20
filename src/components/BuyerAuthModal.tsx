import React, { useState } from 'react';
import { X, UserPlus, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

export const BuyerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginAsBuyer,
    loginAsProducer,
    loginAsAdmin,
    producers,
    authLoading,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLocalError(null);
    setSubmitting(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'buyer' },
          // Use the deployed origin in production instead of relying solely
          // on Supabase's dashboard default (which is often localhost).
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setLocalError(error.message);
        setSubmitting(false);
        return;
      }

      // Update profile with extra fields
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ phone: phone || null, city: city || null, country: country || 'Nigeria' })
          .eq('id', user.id);
      }

      setSuccessMsg('Account created! Please check your email to verify, then sign in.');
      setSubmitting(false);
      return;
    }

    setLocalError('Account sign-up is temporarily unavailable. Please try again shortly.');
    setSubmitting(false);
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLocalError(null);
    setSubmitting(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLocalError(error.message);
        setSubmitting(false);
        return;
      }
      setIsAuthModalOpen(false);
      setSubmitting(false);
      return;
    }

    setLocalError('Sign-in is temporarily unavailable. Please try again shortly.');
    setSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLocalError('Enter your email address first, then click Forgot Password.');
      return;
    }
    if (!isSupabaseConfigured) {
      setLocalError('Password reset is only available when Supabase is connected.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setLocalError(error.message);
    } else {
      setSuccessMsg('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => { setIsAuthModalOpen(false); setLocalError(null); setSuccessMsg(null); }}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              {authModalMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {authModalMode === 'signup'
                ? 'Sign up to save favourite cloths, chat with weavers, and track your orders.'
                : 'Sign in to access your orders and messages with weavers.'}
            </p>
            {!isSupabaseConfigured && (
              <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <strong>Demo Mode:</strong> Supabase not connected — accounts are session-only.
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-stone-100 rounded-lg mb-5 border border-stone-200/80">
            <button
              onClick={() => { setAuthModalMode('signup'); setLocalError(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                authModalMode === 'signup'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              New Account
            </button>
            <button
              onClick={() => { setAuthModalMode('signin'); setLocalError(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                authModalMode === 'signin'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error / Success banners */}
          {localError && (
            <div className="flex items-center gap-2 mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
              {successMsg}
            </div>
          )}

          {authModalMode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chidinma Okafor"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. chidinma@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0803 123 4567"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Delivery City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Lagos, Abuja, London..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Other">Other International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 disabled:opacity-60 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. buyer@example.com"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-amber-900 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || authLoading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {submitting ? 'Signing In…' : 'Sign In'}
              </button>
            </form>
          )}

          {false && <div className="mt-5 pt-4 border-t border-stone-200">
            <span className="text-[11px] font-medium text-stone-400 block mb-2 text-center">
              Quick Test Accounts (Demo Mode)
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  loginAsBuyer();
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 flex items-center justify-between transition-colors"
              >
                <span>Sign in as Buyer (Chidinma Okafor)</span>
                <span className="text-amber-900 font-semibold">Test Buyer →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginAsProducer(producers[0]?.id || 'producer-1');
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 flex items-center justify-between transition-colors"
              >
                <span>Sign in as Weaver (Mama Grace)</span>
                <span className="text-amber-900 font-semibold">Weaver Studio →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2 px-3 bg-amber-950 text-white hover:bg-amber-900 rounded-lg text-xs font-medium flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>Sign in as Cooperative Admin</span>
                <span className="text-amber-200 font-semibold">Admin Panel →</span>
              </button>
            </div>
          </div>}

        </div>
      </div>
    </div>
  );
};
