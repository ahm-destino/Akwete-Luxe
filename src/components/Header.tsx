import React, { useState } from 'react';
import { ShoppingBag, Heart, Shield, MessageSquare, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    user,
    currency,
    setCurrency,
    cart,
    favorites,
    setIsCartOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsBuyerDashboardOpen,
    setIsSellerDashboardOpen,
    isAdminOpen,
    setIsAdminOpen,
    setIsDirectMessageOpen,
    setMessageTargetProducer,
    producers,
    adminActingAsProducerId,
    exitProxyMode
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeProxyProducer = producers.find(p => p.id === adminActingAsProducerId);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200">

      {/* Admin Proxy Notice */}
      {activeProxyProducer && (
        <div className="bg-stone-900 text-stone-300 px-4 py-1.5 text-xs flex items-center justify-between gap-2">
          <span className="truncate">
            Proxy: <strong>{activeProxyProducer.name}</strong>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setIsAdminOpen(true)} className="hover:text-white underline text-[11px]">
              Admin
            </button>
            <button onClick={exitProxyMode} className="text-amber-400 hover:text-amber-300 underline text-[11px]">
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Wordmark */}
        <a href="#" className="flex flex-col text-left shrink-0">
          <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-stone-900 leading-tight">
            Akwete Luxe
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-stone-500 font-medium -mt-0.5 hidden sm:block">
            Abia State, Nigeria
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
          <a href="#catalog" className="hover:text-stone-950 transition-colors">Collection</a>
          <a href="#weavers" className="hover:text-stone-950 transition-colors">Weavers</a>
          <a href="#heritage" className="hover:text-stone-950 transition-colors">Heritage</a>
        </nav>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Currency */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-2 py-1 rounded-md transition-colors ${currency === 'NGN' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-900'}`}
            >₦ NGN</button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded-md transition-colors ${currency === 'USD' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-900'}`}
            >$ USD</button>
          </div>

          {/* Messages */}
          <button
            onClick={() => { setMessageTargetProducer(producers[0]); setIsDirectMessageOpen(true); }}
            className="p-2 text-stone-500 hover:text-stone-950 rounded-lg transition-colors"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Favorites */}
          <button
            onClick={() => user ? setIsBuyerDashboardOpen(true) : (setAuthModalMode('signup'), setIsAuthModalOpen(true))}
            className="relative p-2 text-stone-500 hover:text-stone-950 rounded-lg transition-colors"
            title="Saved"
          >
            <Heart className="w-4 h-4" />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-900 rounded-full" />
            )}
          </button>

          {/* Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-stone-800 hover:text-stone-950 rounded-lg transition-colors flex items-center"
            title="Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="ml-1 text-xs font-bold text-amber-950">({totalCartCount})</span>
            )}
          </button>

          {/* Admin */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-xs text-stone-400 hover:text-stone-900 px-2 py-1 transition-colors"
            title="Admin Console"
          >
            Admin
          </button>

          {/* User */}
          {user ? (
            <button
              onClick={() => {
                if (user.role === 'admin') setIsAdminOpen(true);
                else if (user.role === 'producer') setIsSellerDashboardOpen(true);
                else setIsBuyerDashboardOpen(true);
              }}
              className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
            >
              {user.name.split(' ')[0]}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); }}
                className="text-xs font-medium text-stone-700 hover:text-stone-950 px-2 py-1"
              >Sign In</button>
              <button
                onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >Sign Up</button>
            </div>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-1">
          {/* Bag (always visible on mobile) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-stone-800 flex items-center"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-0.5 min-w-[16px] h-4 bg-amber-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-2 text-stone-700"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-t border-stone-200 px-4 py-5 space-y-5">

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {[['#catalog', 'Collection'], ['#weavers', 'Weavers'], ['#heritage', 'Heritage']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={closeMobile}
                className="text-base font-semibold text-stone-800 hover:text-stone-950 py-2.5 border-b border-stone-100 last:border-0 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Currency */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Currency:</span>
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => { setCurrency('NGN'); }}
                className={`px-3 py-1.5 rounded-md transition-colors ${currency === 'NGN' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500'}`}
              >₦ NGN</button>
              <button
                onClick={() => { setCurrency('USD'); }}
                className={`px-3 py-1.5 rounded-md transition-colors ${currency === 'USD' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500'}`}
              >$ USD</button>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => { setMessageTargetProducer(producers[0]); setIsDirectMessageOpen(true); closeMobile(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
            >
              <MessageSquare className="w-4 h-4" /> Messages
            </button>

            <button
              onClick={() => { user ? setIsBuyerDashboardOpen(true) : (setAuthModalMode('signup'), setIsAuthModalOpen(true)); closeMobile(); }}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
            >
              <Heart className="w-4 h-4" />
              Saved
              {favorites.length > 0 && <span className="ml-0.5 text-amber-900">({favorites.length})</span>}
            </button>

            <button
              onClick={() => { setIsAdminOpen(true); closeMobile(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 text-stone-500 text-xs font-semibold"
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
          </div>

          {/* Auth */}
          <div className="pt-2 border-t border-stone-100">
            {user ? (
              <button
                onClick={() => {
                  if (user.role === 'admin') setIsAdminOpen(true);
                  else if (user.role === 'producer') setIsSellerDashboardOpen(true);
                  else setIsBuyerDashboardOpen(true);
                  closeMobile();
                }}
                className="w-full py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl"
              >
                My Account ({user.name.split(' ')[0]})
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setAuthModalMode('signin'); setIsAuthModalOpen(true); closeMobile(); }}
                  className="flex-1 py-2.5 border border-stone-300 text-stone-800 text-sm font-semibold rounded-xl"
                >Sign In</button>
                <button
                  onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); closeMobile(); }}
                  className="flex-1 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl"
                >Sign Up</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
