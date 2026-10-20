import React, { createContext, useContext, useState, useCallback } from 'react';
import { Producer, AkweteCloth, User, Order, OrderItem, Message, CustomCommission, ProducerApplication, AppSettings } from '../types';
import { PRODUCERS } from '../data/mockData';

// ── Supabase hooks ─────────────────────────────────────────────
import { useAuth } from '../hooks/useAuth';
import { useProducers } from '../hooks/useProducers';
import { useCloths } from '../hooks/useCloths';
import { useOrders } from '../hooks/useOrders';
import { useCommissions } from '../hooks/useCommissions';
import { useMessages } from '../hooks/useMessages';
import { useSettings } from '../hooks/useSettings';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  currency: 'NGN' | 'USD';
  setCurrency: (c: 'NGN' | 'USD') => void;
  formatPrice: (cloth: AkweteCloth | { priceNGN: number; priceUSD: number }) => string;
  cart: OrderItem[];
  addToCart: (cloth: AkweteCloth, quantity?: number, note?: string) => void;
  removeFromCart: (clothId: string) => void;
  updateCartQuantity: (clothId: string, quantity: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (clothId: string) => void;
  // Orders & Commissions
  orders: Order[];
  placeOrder: (deliveryDetails: { name: string; email: string; phone: string; address: string; paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD' }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  updateOrder: (orderId: string, updated: Partial<Order>) => void;
  commissions: CustomCommission[];
  requestCommission: (data: Omit<CustomCommission, 'id' | 'createdAt' | 'status'>) => void;
  updateCommission: (commissionId: string, updated: Partial<CustomCommission>) => void;
  reassignCommission: (commissionId: string, newProducerId: string) => void;

  // Weavers & Cloths
  producers: Producer[];
  publicProducers: Producer[]; // active-only, for public storefront + pickers
  addProducer: (data: Omit<Producer, 'id'>) => void;
  updateProducer: (id: string, updated: Partial<Producer>) => void;
  deleteProducer: (id: string) => void;
  applyAsProducer: (application: ProducerApplication) => Promise<{ error: string | null }>;
  approveProducer: (id: string) => void;
  suspendProducer: (id: string) => void;
  cloths: AkweteCloth[];
  addNewCloth: (cloth: Omit<AkweteCloth, 'id'>) => void;
  updateCloth: (clothId: string, updated: Partial<AkweteCloth>) => void;
  deleteCloth: (clothId: string) => void;
  messages: Message[];
  sendMessage: (receiverId: string, receiverName: string, text: string, clothId?: string, clothTitle?: string) => void;
  sendMessageOnBehalfOfProducer: (producerId: string, receiverId: string, receiverName: string, text: string, clothId?: string, clothTitle?: string) => void;

  // Cooperative settings (exchange rate, bank details)
  settings: AppSettings;
  updateSettings: (updated: Partial<AppSettings>) => Promise<{ error: string | null }>;
  usdFromNgn: (ngn: number) => number;
  
  // Admin Proxy Controls
  adminActingAsProducerId: string | null;
  actOnBehalfOfProducer: (producerId: string) => void;
  exitProxyMode: () => void;
  
  // Modals & Navigation
  activeClothModal: AkweteCloth | null;
  setActiveClothModal: (cloth: AkweteCloth | null) => void;
  activeProducerModal: Producer | null;
  setActiveProducerModal: (producer: Producer | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signup' | 'signin';
  setAuthModalMode: (mode: 'signup' | 'signin') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isBuyerDashboardOpen: boolean;
  setIsBuyerDashboardOpen: (open: boolean) => void;
  isProducerConsoleOpen: boolean;
  setIsProducerConsoleOpen: (open: boolean) => void;
  isProducerApplyOpen: boolean;
  setIsProducerApplyOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isDirectMessageOpen: boolean;
  setIsDirectMessageOpen: (open: boolean) => void;
  messageTargetProducer: Producer | null;
  setMessageTargetProducer: (producer: Producer | null) => void;
  messageTargetCloth: AkweteCloth | null;
  setMessageTargetCloth: (cloth: AkweteCloth | null) => void;
  isCommissionModalOpen: boolean;
  setIsCommissionModalOpen: (open: boolean) => void;
  commissionTargetProducer: Producer | null;
  setCommissionTargetProducer: (producer: Producer | null) => void;
  
  // Auth methods (Supabase-powered)
  loginAsBuyer: (buyerData?: Partial<User>) => void;
  loginAsProducer: (producerId: string) => void;
  loginAsAdmin: () => void;
  signupBuyer: (userData: { name: string; email: string; phone: string; city: string; country: string; password?: string }) => void;
  logout: () => void;
  authError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Supabase hooks ─────────────────────────────────────────
  const auth = useAuth();
  const producersHook = useProducers();
  const clothsHook = useCloths();
  const ordersHook = useOrders(auth.user);
  const commissionsHook = useCommissions(auth.user);
  const messagesHook = useMessages(auth.user);
  const settingsHook = useSettings();

  // ── Local UI state ─────────────────────────────────────────
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('akwete_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('akwete_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  // Persist cart + favorites to localStorage
  React.useEffect(() => {
    localStorage.setItem('akwete_cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    localStorage.setItem('akwete_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ── Modal state ────────────────────────────────────────────
  const [activeClothModal, setActiveClothModal] = useState<AkweteCloth | null>(null);
  const [activeProducerModal, setActiveProducerModal] = useState<Producer | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isBuyerDashboardOpen, setIsBuyerDashboardOpen] = useState<boolean>(false);
  const [isProducerConsoleOpen, setIsProducerConsoleOpen] = useState<boolean>(false);
  const [isProducerApplyOpen, setIsProducerApplyOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState<boolean>(false);
  const [messageTargetProducer, setMessageTargetProducer] = useState<Producer | null>(null);
  const [messageTargetCloth, setMessageTargetCloth] = useState<AkweteCloth | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState<boolean>(false);
  const [commissionTargetProducer, setCommissionTargetProducer] = useState<Producer | null>(null);
  
  // Admin Proxy Weaver State
  const [adminActingAsProducerId, setAdminActingAsProducerId] = useState<string | null>(() => {
    return localStorage.getItem('akwete_proxy_producer_id');
  });

  const actOnBehalfOfProducer = (producerId: string) => {
    setAdminActingAsProducerId(producerId);
    localStorage.setItem('akwete_proxy_producer_id', producerId);
  };

  const exitProxyMode = () => {
    setAdminActingAsProducerId(null);
    localStorage.removeItem('akwete_proxy_producer_id');
  };

  // ── Price formatting ───────────────────────────────────────
  const formatPrice = (cloth: AkweteCloth | { priceNGN: number; priceUSD: number }) => {
    if (currency === 'NGN') {
      return `₦${cloth.priceNGN.toLocaleString('en-NG')}`;
    }
    return `$${cloth.priceUSD.toLocaleString('en-US')}`;
  };

  // ── Cart operations ────────────────────────────────────────
  const addToCart = (cloth: AkweteCloth, quantity: number = 1, note?: string) => {
    if (!cloth.inStock || cloth.stockCount < 1) return;
    setCart(prev => {
      const existing = prev.find(item => item.cloth.id === cloth.id);
      const nextQuantity = Math.min(cloth.stockCount, (existing?.quantity ?? 0) + quantity);
      if (existing) {
        return prev.map(item =>
          item.cloth.id === cloth.id
            ? { ...item, quantity: nextQuantity, customNote: note || item.customNote }
            : item
        );
      }
      return [...prev, { cloth, quantity, customNote: note }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (clothId: string) => {
    setCart(prev => prev.filter(item => item.cloth.id !== clothId));
  };

  const updateCartQuantity = (clothId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(clothId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.cloth.id === clothId
          ? { ...item, quantity: Math.min(Math.max(1, quantity), item.cloth.stockCount) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (clothId: string) => {
    setFavorites(prev =>
      prev.includes(clothId) ? prev.filter(id => id !== clothId) : [...prev, clothId]
    );
  };

  // ── Order placement (delegates to hook which calls API) ────
  const placeOrder = useCallback(async (deliveryDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD';
  }): Promise<Order> => {
    const order = await ordersHook.placeOrder(cart, deliveryDetails, auth.user?.id);
    clearCart();
    return order;
  }, [cart, auth.user, ordersHook]);

  // ── Commission request (delegates to hook) ─────────────────
  const requestCommission = useCallback((data: Omit<CustomCommission, 'id' | 'createdAt' | 'status'>) => {
    commissionsHook.requestCommission(data, auth.user?.id);
  }, [auth.user, commissionsHook]);

  // ── Reassign commission ────────────────────────────────────
  const reassignCommission = useCallback((commissionId: string, newProducerId: string) => {
    commissionsHook.reassignCommission(commissionId, newProducerId, producersHook.producers);
  }, [commissionsHook, producersHook.producers]);

  // ── Message sending ────────────────────────────────────────
  const sendMessage = useCallback((
    receiverId: string,
    receiverName: string,
    text: string,
    clothId?: string,
    clothTitle?: string
  ) => {
    messagesHook.sendMessage(
      auth.user?.id || 'guest-buyer',
      auth.user?.name || 'Inquiring Buyer',
      auth.user?.role || 'buyer',
      receiverId,
      receiverName,
      text,
      clothId,
      clothTitle
    );
  }, [auth.user, messagesHook]);

  const sendMessageOnBehalfOfProducer = useCallback((
    producerId: string,
    receiverId: string,
    receiverName: string,
    text: string,
    clothId?: string,
    clothTitle?: string
  ) => {
    const producer = producersHook.producers.find(p => p.id === producerId);
    const producerName = producer ? producer.name : 'Master Weaver';
    messagesHook.sendMessage(
      producerId,
      `${producerName} (via Admin Secretariat)`,
      'producer',
      receiverId,
      receiverName,
      text,
      clothId,
      clothTitle,
      producerName
    );
  }, [producersHook.producers, messagesHook]);

  // ── Auth methods ───────────────────────────────────────────

  // Demo login — sets user state directly without Supabase session
  const loginAsBuyer = useCallback((buyerData?: Partial<User>) => {
    auth.loginAsDemoUser({
      id: buyerData?.id || 'buyer-demo-1',
      name: buyerData?.name || 'Chidinma Okafor',
      email: buyerData?.email || 'chidinma.okafor@gmail.com',
      role: 'buyer',
      phone: buyerData?.phone || '+234 809 112 4433',
      address: {
        street: '14 Admiralty Way, Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
      },
      joinedDate: '2025-08-14',
    });
  }, [auth]);

  const loginAsProducer = useCallback((producerId: string) => {
    const producer = PRODUCERS.find(p => p.id === producerId) || PRODUCERS[0];
    auth.loginAsDemoUser({
      id: producer.id,
      name: producer.name,
      email: `${producer.id}@akweteweavers.org`,
      role: 'producer',
      producerId: producer.id,
      producerStatus: 'active',
      phone: producer.phone,
      address: {
        street: producer.village,
        city: 'Akwete Town',
        state: 'Abia State',
        country: 'Nigeria',
      },
      joinedDate: '2024-01-10',
    });
  }, [auth]);

  const loginAsAdmin = useCallback(() => {
    auth.loginAsDemoUser({
      id: 'admin-1',
      name: 'Cooperative Admin',
      email: 'admin@akweteweavers.org',
      role: 'admin',
      phone: '+234 803 419 8820',
      address: {
        street: 'Akwete Weavers Cooperative Secretariat',
        city: 'Akwete Town',
        state: 'Abia State',
        country: 'Nigeria',
      },
      joinedDate: '2024-01-01',
    });
    setIsAdminOpen(true);
  }, [auth]);

  // Real Supabase signup
  const signupBuyer = useCallback(async (userData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    password?: string;
  }) => {
    const password = userData.password || Math.random().toString(36).slice(-10) + 'Ak1!';
    const { error } = await auth.signupBuyer({
      name: userData.name,
      email: userData.email,
      password,
      phone: userData.phone,
      city: userData.city,
      country: userData.country,
    });

    if (error) {
      // Fallback: create local user (offline mode)
      auth.loginAsDemoUser({
        id: `buyer-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: 'buyer',
        phone: userData.phone,
        address: {
          street: 'Delivery Address Pending',
          city: userData.city,
          state: userData.city,
          country: userData.country,
        },
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsAuthModalOpen(false);
  }, [auth]);

  // ── Become a seller (buyer → pending weaver) ───────────────
  const applyAsProducer = useCallback(async (application: ProducerApplication) => {
    const { error, producerId } = await producersHook.applyAsProducer(
      application,
      auth.session?.access_token,
    );
    if (!error && producerId && auth.user) {
      // Reflect the pending weaver identity on the current session immediately
      auth.loginAsDemoUser({
        ...auth.user,
        role: 'producer',
        producerId,
        producerStatus: 'pending',
      });
    }
    return { error };
  }, [producersHook, auth]);

  const approveProducer = useCallback((id: string) => { producersHook.approveProducer(id); }, [producersHook]);
  const suspendProducer = useCallback((id: string) => { producersHook.suspendProducer(id); }, [producersHook]);

  // Active weavers only — for the public storefront + weaver pickers
  const publicProducers = producersHook.producers.filter(
    p => p.status === undefined || p.status === 'active'
  );

  // Convert NGN → USD using the cooperative's live exchange rate
  const usdFromNgn = useCallback((ngn: number) => {
    const rate = settingsHook.settings.ngnPerUsd || 1600;
    return Math.max(1, Math.round(ngn / rate));
  }, [settingsHook.settings.ngnPerUsd]);

  const logout = useCallback(async () => {
    await auth.logout();
    setIsAdminOpen(false);
    setIsBuyerDashboardOpen(false);
    setIsProducerConsoleOpen(false);
    exitProxyMode();
  }, [auth]);

  return (
    <AppContext.Provider
      value={{
        user: auth.user,
        authLoading: auth.loading,
        currency,
        setCurrency,
        formatPrice,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        orders: ordersHook.orders,
        placeOrder,
        updateOrderStatus: ordersHook.updateOrderStatus,
        updateOrder: ordersHook.updateOrder,
        producers: producersHook.producers,
        publicProducers,
        addProducer: producersHook.addProducer,
        updateProducer: producersHook.updateProducer,
        deleteProducer: producersHook.deleteProducer,
        applyAsProducer,
        approveProducer,
        suspendProducer,
        cloths: clothsHook.cloths,
        addNewCloth: clothsHook.addNewCloth,
        updateCloth: clothsHook.updateCloth,
        deleteCloth: clothsHook.deleteCloth,
        messages: messagesHook.messages,
        sendMessage,
        sendMessageOnBehalfOfProducer,
        settings: settingsHook.settings,
        updateSettings: settingsHook.updateSettings,
        usdFromNgn,
        commissions: commissionsHook.commissions,
        requestCommission,
        updateCommission: commissionsHook.updateCommission,
        reassignCommission,
        adminActingAsProducerId,
        actOnBehalfOfProducer,
        exitProxyMode,
        activeClothModal,
        setActiveClothModal,
        activeProducerModal,
        setActiveProducerModal,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isCartOpen,
        setIsCartOpen,
        isBuyerDashboardOpen,
        setIsBuyerDashboardOpen,
        isProducerConsoleOpen,
        setIsProducerConsoleOpen,
        isProducerApplyOpen,
        setIsProducerApplyOpen,
        isAdminOpen,
        setIsAdminOpen,
        isDirectMessageOpen,
        setIsDirectMessageOpen,
        messageTargetProducer,
        setMessageTargetProducer,
        messageTargetCloth,
        setMessageTargetCloth,
        isCommissionModalOpen,
        setIsCommissionModalOpen,
        commissionTargetProducer,
        setCommissionTargetProducer,
        loginAsBuyer,
        loginAsProducer,
        loginAsAdmin,
        signupBuyer,
        logout,
        authError: auth.error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
