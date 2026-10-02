import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ClothCatalog } from './components/ClothCatalog';
import { ProducerSection } from './components/ProducerSection';
import { HeritageSection } from './components/HeritageSection';
import { Footer } from './components/Footer';
import { ClothModal } from './components/ClothModal';
import { ProducerDetailModal } from './components/ProducerDetailModal';
import { DirectMessageModal } from './components/DirectMessageModal';
import { CommissionModal } from './components/CommissionModal';
import { BuyerAuthModal } from './components/BuyerAuthModal';
import { BuyerDashboardModal } from './components/BuyerDashboardModal';
import { SellerDashboardModal } from './components/SellerDashboardModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckoutDrawer } from './components/CheckoutDrawer';

function AppContent() {
  const { headingFont, isAdminOpen } = useApp();

  // If Admin Workspace is open, render as a dedicated full-screen application
  if (isAdminOpen) {
    return (
      <div className={`min-h-screen bg-[#FAF9F5] flex flex-col text-stone-900 selection:bg-amber-900 selection:text-white font-theme-${headingFont}`}>
        <AdminDashboard />
        <ClothModal />
        <ProducerDetailModal />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF9F5] flex flex-col text-stone-900 selection:bg-amber-900 selection:text-white font-theme-${headingFont}`}>
      {/* Navigation Top Bar Contract */}
      <Header />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero />
        <ClothCatalog />
        <ProducerSection />
        <HeritageSection />
      </main>

      {/* Quiet Cultural Footer */}
      <Footer />

      {/* Interactive Modals & Drawers */}
      <ClothModal />
      <ProducerDetailModal />
      <DirectMessageModal />
      <CommissionModal />
      <BuyerAuthModal />
      <BuyerDashboardModal />
      <SellerDashboardModal />
      <CheckoutDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
