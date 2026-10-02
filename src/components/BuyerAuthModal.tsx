import React, { useState } from 'react';
import { X, UserPlus, LogIn, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BuyerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    signupBuyer,
    loginAsBuyer,
    loginAsProducer,
    loginAsAdmin,
    producers
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    signupBuyer({
      name,
      email,
      phone: phone || '+234 800 000 0000',
      city: city || 'Lagos',
      country: country || 'Nigeria'
    });
  };

  const handleSignin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    loginAsBuyer({
      name: email.split('@')[0],
      email
    });
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              {authModalMode === 'signup' ? 'Buyer Sign Up' : 'Sign In'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {authModalMode === 'signup'
                ? 'Create an account to save favorite cloths, chat with weavers, and track your orders.'
                : 'Sign in to access your orders and messages with weavers.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-stone-100 rounded-lg mb-5 border border-stone-200/80">
            <button
              onClick={() => setAuthModalMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                authModalMode === 'signup'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              New Buyer Sign Up
            </button>
            <button
              onClick={() => setAuthModalMode('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                authModalMode === 'signin'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {authModalMode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name
                </label>
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
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
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0803 123 4567"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Delivery City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Lagos, Abuja, London..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Country
                </label>
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs mt-2"
              >
                Create Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs mt-2"
              >
                Sign In
              </button>
            </form>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="mt-5 pt-4 border-t border-stone-200">
            <span className="text-[11px] font-medium text-stone-400 block mb-2 text-center">
              Quick Test Accounts
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
                  loginAsProducer(producers[0].id);
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
          </div>

        </div>
      </div>
    </div>
  );
};
