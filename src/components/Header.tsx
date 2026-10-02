import React from 'react';
import { ShoppingBag, Heart, Shield, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    user,
    currency,
    setCurrency,
    headingFont,
    setHeadingFont,
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

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeProxyProducer = producers.find(p => p.id === adminActingAsProducerId);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200">
      
      {/* Discreet Admin Proxy Notice */}
      {activeProxyProducer && (
        <div className="bg-stone-900 text-stone-300 px-4 py-1.5 text-xs flex items-center justify-between">
          <span className="truncate">
            Admin Proxy: Acting for <strong>{activeProxyProducer.name}</strong>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-stone-300 hover:text-white underline text-[11px]"
            >
              Admin Panel
            </button>
            <button
              onClick={exitProxyMode}
              className="text-amber-400 hover:text-amber-300 underline text-[11px]"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Wordmark */}
        <a href="#" className="flex flex-col text-left">
          <span className="font-serif-display text-2xl font-bold tracking-tight text-stone-900">
            Akwete Luxe
          </span>
          <span className="text-[10px] tracking-widest uppercase text-stone-500 font-medium -mt-0.5">
            Abia State, Nigeria
          </span>
        </a>

        {/* Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <a href="#catalog" className="hover:text-stone-950 transition-colors">
            Collection
          </a>
          <a href="#weavers" className="hover:text-stone-950 transition-colors">
            Weavers
          </a>
          <a href="#heritage" className="hover:text-stone-950 transition-colors">
            Heritage
          </a>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          
          {/* Typography Theme Audition */}
          <div className="hidden sm:flex items-center bg-stone-100 rounded-lg p-0.5 text-[11px] font-medium text-stone-600">
            <span className="pl-2 pr-1 text-stone-400 text-[10px] uppercase font-bold tracking-wider">Font:</span>
            <button
              onClick={() => setHeadingFont('syne')}
              className={`px-2 py-0.5 rounded transition-all ${
                headingFont === 'syne' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Syne: Sculptural Contemporary African Luxury"
            >
              Syne
            </button>
            <button
              onClick={() => setHeadingFont('fraunces')}
              className={`px-2 py-0.5 rounded transition-all ${
                headingFont === 'fraunces' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Fraunces: Warm Tactile Heritage Craft"
            >
              Fraunces
            </button>
            <button
              onClick={() => setHeadingFont('outfit')}
              className={`px-2 py-0.5 rounded transition-all ${
                headingFont === 'outfit' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Outfit: Clean Architectural Minimal"
            >
              Outfit
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-2 py-1 rounded-md transition-colors ${
                currency === 'NGN' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500'
              }`}
            >
              ₦ NGN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded-md transition-colors ${
                currency === 'USD' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Messages */}
          <button
            onClick={() => {
              setMessageTargetProducer(producers[0]);
              setIsDirectMessageOpen(true);
            }}
            className="p-2 text-stone-600 hover:text-stone-950 rounded-lg transition-colors"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              if (user) {
                setIsBuyerDashboardOpen(true);
              } else {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }
            }}
            className="relative p-2 text-stone-600 hover:text-stone-950 rounded-lg transition-colors"
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
              <span className="ml-1 text-xs font-bold text-amber-950">
                ({totalCartCount})
              </span>
            )}
          </button>

          {/* Admin shortcut */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-xs text-stone-500 hover:text-stone-900 px-2 py-1 transition-colors"
            title="Admin Console"
          >
            Admin
          </button>

          {/* User Sign In / Profile */}
          {user ? (
            <button
              onClick={() => {
                if (user.role === 'admin') {
                  setIsAdminOpen(true);
                } else if (user.role === 'producer') {
                  setIsSellerDashboardOpen(true);
                } else {
                  setIsBuyerDashboardOpen(true);
                }
              }}
              className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
            >
              <span>{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setAuthModalMode('signin');
                  setIsAuthModalOpen(true);
                }}
                className="text-xs font-medium text-stone-700 hover:text-stone-950 px-2 py-1"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
