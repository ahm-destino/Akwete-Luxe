import React, { Suspense, lazy } from 'react';
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
import { ProducerApplyModal } from './components/ProducerApplyModal';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { Toaster } from './components/Toaster';

// The two full-screen consoles are only ever opened by admins / weavers, so
// they're code-split out of the main bundle that every buyer downloads.
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const ProducerConsole = lazy(() =>
  import('./components/ProducerConsole').then(m => ({ default: m.ProducerConsole }))
);

const ConsoleLoader: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-4 text-stone-500">
    <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-amber-900 animate-spin" />
    <span className="font-serif-display text-sm font-semibold tracking-tight">{label}</span>
  </div>
);

function AppContent() {
  const { isAdminOpen, isProducerConsoleOpen } = useApp();

  // Full-screen admin console
  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col text-stone-900">
        <Suspense fallback={<ConsoleLoader label="Loading Atelier Suite…" />}>
          <AdminDashboard />
        </Suspense>
        <ClothModal />
        <ProducerDetailModal />
        <Toaster />
      </div>
    );
  }

  // Full-screen weaver (producer) console
  if (isProducerConsoleOpen) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col text-stone-900">
        <Suspense fallback={<ConsoleLoader label="Loading Weaver Studio…" />}>
          <ProducerConsole />
        </Suspense>
        <ClothModal />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col text-stone-900">
      <Header />
      <main className="flex-1">
        <Hero />
        <ClothCatalog />
        <ProducerSection />
        <HeritageSection />
      </main>
      <Footer />
      <ClothModal />
      <ProducerDetailModal />
      <DirectMessageModal />
      <CommissionModal />
      <BuyerAuthModal />
      <BuyerDashboardModal />
      <ProducerApplyModal />
      <CheckoutDrawer />
      <Toaster />
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
