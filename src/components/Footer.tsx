import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setIsAdminOpen, headingFont, setHeadingFont } = useApp();

  return (
    <footer className="bg-white border-t border-stone-200 py-12 text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-serif-display text-lg font-bold text-stone-900 block">
              Akwete Luxe
            </span>
            <span className="text-stone-500 text-xs">
              Handwoven in Ukwa East LGA, Abia State, Nigeria. Direct from master artisans.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium">
            <a href="#catalog" className="hover:text-stone-950 transition-colors">
              Collection
            </a>
            <a href="#weavers" className="hover:text-stone-950 transition-colors">
              Weavers
            </a>
            <a href="#heritage" className="hover:text-stone-950 transition-colors">
              Heritage
            </a>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-stone-950 transition-colors"
            >
              Admin Panel
            </button>
          </div>

          <div className="text-stone-400 text-[11px]">
            © {new Date().getFullYear()} Akwete Handwoven Cloths.
          </div>
        </div>

        {/* Discreet Typography Switcher in Footer */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
          <span>Curated Brand Typography:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHeadingFont('syne')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                headingFont === 'syne' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Syne (Sculptural Avant-Garde)
            </button>
            <button
              onClick={() => setHeadingFont('fraunces')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                headingFont === 'fraunces' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Fraunces (Warm Heritage Craft)
            </button>
            <button
              onClick={() => setHeadingFont('outfit')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                headingFont === 'outfit' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Outfit (Modern Architectural)
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
