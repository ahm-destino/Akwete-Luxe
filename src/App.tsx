import React, { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
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
import { ResetPasswordPage } from './components/ResetPasswordPage';

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
  const { isAdminOpen, isProducerConsoleOpen, user, cloths, publicProducers, activeClothModal, activeProducerModal, setActiveClothModal, setActiveProducerModal } = useApp();
  const syncingHistory = useRef(false);

  const openFromLocation = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const cloth = cloths.find(item => item.id === params.get('cloth'));
    const producer = publicProducers.find(item => item.id === params.get('weaver'));
    if (cloth || producer || (!params.has('cloth') && !params.has('weaver'))) {
      syncingHistory.current = true;
      setActiveClothModal(cloth || null);
      setActiveProducerModal(producer || null);
    }
  }, [cloths, publicProducers, setActiveClothModal, setActiveProducerModal]);

  useEffect(() => {
    openFromLocation();
    window.addEventListener('popstate', openFromLocation);
    return () => window.removeEventListener('popstate', openFromLocation);
  }, [openFromLocation]);

  useEffect(() => {
    if (syncingHistory.current) { syncingHistory.current = false; return; }
    const url = new URL(window.location.href);
    url.searchParams.delete('cloth'); url.searchParams.delete('weaver');
    if (activeClothModal) url.searchParams.set('cloth', activeClothModal.id);
    if (activeProducerModal) url.searchParams.set('weaver', activeProducerModal.id);
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [activeClothModal, activeProducerModal]);

  // Full-screen admin console
  if (isAdminOpen && user?.role === 'admin') {
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
  if (isProducerConsoleOpen && user?.role === 'producer') {
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
  if (window.location.pathname === '/reset-password') return <ResetPasswordPage />;
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
