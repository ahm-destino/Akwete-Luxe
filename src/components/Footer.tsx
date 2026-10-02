import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setIsAdminOpen } = useApp();

  return (
    <footer className="bg-white border-t border-stone-200 py-10 text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

          {/* Brand */}
          <div className="shrink-0">
            <span className="font-serif-display text-lg font-bold text-stone-900 block leading-tight">
              Akwete Luxe
            </span>
            <span className="text-stone-400 text-[11px] mt-0.5 block">
              Handwoven in Ukwa East LGA, Abia State, Nigeria
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-5 text-xs font-medium flex-wrap">
            <a href="#catalog" className="hover:text-stone-950 transition-colors">Collection</a>
            <a href="#weavers" className="hover:text-stone-950 transition-colors">Weavers</a>
            <a href="#heritage" className="hover:text-stone-950 transition-colors">Heritage</a>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-stone-950 transition-colors text-stone-400"
            >
              Admin
            </button>
          </nav>

          {/* Copyright */}
          <div className="text-stone-400 text-[11px] shrink-0">
            © {new Date().getFullYear()} Akwete Luxe. Direct from the loom.
          </div>
        </div>

      </div>
    </footer>
  );
};
