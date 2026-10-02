import React, { createContext, useContext, useState, useEffect } from 'react';
import { Producer, AkweteCloth, User, Order, OrderItem, Message, CustomCommission } from '../types';
import { PRODUCERS, AKWETE_CLOTHS, DEMO_BUYER, INITIAL_MESSAGES } from '../data/mockData';

interface AppContextType {
  user: User | null;
  currency: 'NGN' | 'USD';
  setCurrency: (c: 'NGN' | 'USD') => void;
  headingFont: 'syne' | 'fraunces' | 'outfit';
  setHeadingFont: (f: 'syne' | 'fraunces' | 'outfit') => void;
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
  placeOrder: (deliveryDetails: { name: string; email: string; phone: string; address: string; paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD' }) => Order;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  updateOrder: (orderId: string, updated: Partial<Order>) => void;
  commissions: CustomCommission[];
  requestCommission: (data: Omit<CustomCommission, 'id' | 'createdAt' | 'status'>) => void;
  updateCommission: (commissionId: string, updated: Partial<CustomCommission>) => void;
  reassignCommission: (commissionId: string, newProducerId: string) => void;

  // Weavers & Cloths
  producers: Producer[];
  addProducer: (data: Omit<Producer, 'id'>) => void;
  updateProducer: (id: string, updated: Partial<Producer>) => void;
  deleteProducer: (id: string) => void;
  cloths: AkweteCloth[];
  addNewCloth: (cloth: Omit<AkweteCloth, 'id'>) => void;
  updateCloth: (clothId: string, updated: Partial<AkweteCloth>) => void;
  deleteCloth: (clothId: string) => void;
  messages: Message[];
  sendMessage: (receiverId: string, receiverName: string, text: string, clothId?: string, clothTitle?: string) => void;
  sendMessageOnBehalfOfProducer: (producerId: string, receiverId: string, receiverName: string, text: string, clothId?: string, clothTitle?: string) => void;
  
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
  isSellerDashboardOpen: boolean;
  setIsSellerDashboardOpen: (open: boolean) => void;
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
  
  // Auth methods
  loginAsBuyer: (buyerData?: Partial<User>) => void;
  loginAsProducer: (producerId: string) => void;
  loginAsAdmin: () => void;
  signupBuyer: (userData: { name: string; email: string; phone: string; city: string; country: string }) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [headingFont, setHeadingFontState] = useState<'syne' | 'fraunces' | 'outfit'>(() => {
    const saved = localStorage.getItem('akwete_font');
    return (saved === 'syne' || saved === 'outfit' || saved === 'fraunces') ? saved : 'fraunces';
  });

  const setHeadingFont = (f: 'syne' | 'fraunces' | 'outfit') => {
    setHeadingFontState(f);
    localStorage.setItem('akwete_font', f);
  };
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('akwete_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default logged in buyer demo
    return {
      id: DEMO_BUYER.id,
      name: DEMO_BUYER.name,
      email: DEMO_BUYER.email,
      role: 'buyer',
      phone: DEMO_BUYER.phone,
      address: {
        street: '14 Admiralty Way, Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
        postalCode: '105102'
      },
      joinedDate: '2025-08-14'
    };
  });

  const [producers, setProducers] = useState<Producer[]>(() => {
    const saved = localStorage.getItem('akwete_producers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return PRODUCERS;
  });

  const [cloths, setCloths] = useState<AkweteCloth[]>(() => {
    const saved = localStorage.getItem('akwete_cloths');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return AKWETE_CLOTHS;
  });

  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('akwete_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('akwete_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return ['cloth-ikaki-royal'];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('akwete_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'ORD-AKW-7821',
        buyerId: DEMO_BUYER.id,
        buyerName: DEMO_BUYER.name,
        buyerEmail: DEMO_BUYER.email,
        buyerPhone: DEMO_BUYER.phone,
        items: [
          {
            cloth: AKWETE_CLOTHS[0],
            quantity: 1,
            customNote: 'Please wrap with archival acid-free paper for international flight.'
          }
        ],
        totalNGN: 185000,
        totalUSD: 145,
        status: 'Weaving / Preparing',
        createdAt: '2026-09-22',
        deliveryAddress: '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
        paymentMethod: 'Escrow Bank Transfer',
        producerNames: ['Nneoma Grace Uchechi Nwosu']
      }
    ];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('akwete_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MESSAGES;
  });

  const [commissions, setCommissions] = useState<CustomCommission[]>(() => {
    const saved = localStorage.getItem('akwete_commissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'COMM-101',
        buyerId: DEMO_BUYER.id,
        buyerName: DEMO_BUYER.name,
        buyerContact: '+234 809 112 4433',
        producerId: 'producer-1',
        producerName: 'Nneoma Grace Uchechi Nwosu',
        desiredMotif: 'Sacred Ikaki & Royal Tortoise',
        occasion: 'Elder Brother Chieftaincy Ceremony',
        colors: 'Deep Indigo, Royal Emerald and Loom Gold',
        estimatedBudgetNGN: 195000,
        targetDate: '2026-11-15',
        notes: 'Needs matching chief shoulder sash with custom gold fringing.',
        status: 'In Discussion',
        createdAt: '2026-09-25'
      }
    ];
  });

  // Modals state
  const [activeClothModal, setActiveClothModal] = useState<AkweteCloth | null>(null);
  const [activeProducerModal, setActiveProducerModal] = useState<Producer | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isBuyerDashboardOpen, setIsBuyerDashboardOpen] = useState<boolean>(false);
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState<boolean>(false);
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

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('akwete_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('akwete_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('akwete_producers', JSON.stringify(producers));
  }, [producers]);

  useEffect(() => {
    localStorage.setItem('akwete_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('akwete_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('akwete_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('akwete_cloths', JSON.stringify(cloths));
  }, [cloths]);

  useEffect(() => {
    localStorage.setItem('akwete_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('akwete_commissions', JSON.stringify(commissions));
  }, [commissions]);

  const formatPrice = (cloth: AkweteCloth | { priceNGN: number; priceUSD: number }) => {
    if (currency === 'NGN') {
      return `₦${cloth.priceNGN.toLocaleString('en-NG')}`;
    }
    return `$${cloth.priceUSD.toLocaleString('en-US')}`;
  };

  const addToCart = (cloth: AkweteCloth, quantity: number = 1, note?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.cloth.id === cloth.id);
      if (existing) {
        return prev.map(item =>
          item.cloth.id === cloth.id
            ? { ...item, quantity: item.quantity + quantity, customNote: note || item.customNote }
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
        item.cloth.id === clothId ? { ...item, quantity } : item
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

  const placeOrder = (deliveryDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD';
  }): Order => {
    const totalNGN = cart.reduce((sum, item) => sum + item.cloth.priceNGN * item.quantity, 0);
    const totalUSD = cart.reduce((sum, item) => sum + item.cloth.priceUSD * item.quantity, 0);
    const uniqueProducers = Array.from(new Set(cart.map(i => i.cloth.producerName)));

    const newOrder: Order = {
      id: `ORD-AKW-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerId: user?.id || 'guest-buyer',
      buyerName: deliveryDetails.name,
      buyerEmail: deliveryDetails.email,
      buyerPhone: deliveryDetails.phone,
      items: [...cart],
      totalNGN,
      totalUSD,
      status: 'Pending Verification',
      createdAt: new Date().toISOString().split('T')[0],
      deliveryAddress: deliveryDetails.address,
      paymentMethod: deliveryDetails.paymentMethod,
      producerNames: uniqueProducers
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const addNewCloth = (clothData: Omit<AkweteCloth, 'id'>) => {
    const newCloth: AkweteCloth = {
      ...clothData,
      id: `cloth-${Date.now()}`
    };
    setCloths(prev => [newCloth, ...prev]);
  };

  const sendMessage = (
    receiverId: string,
    receiverName: string,
    text: string,
    clothId?: string,
    clothTitle?: string
  ) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'guest-buyer',
      senderName: user?.name || 'Inquiring Buyer',
      senderRole: user?.role || 'buyer',
      receiverId,
      receiverName,
      clothId,
      clothTitle,
      text,
      timestamp: 'Just now',
      read: false
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const requestCommission = (data: Omit<CustomCommission, 'id' | 'createdAt' | 'status'>) => {
    const newCommission: CustomCommission = {
      ...data,
      id: `COMM-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Requested',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCommissions(prev => [newCommission, ...prev]);
  };

  const loginAsBuyer = (buyerData?: Partial<User>) => {
    setUser({
      id: buyerData?.id || DEMO_BUYER.id,
      name: buyerData?.name || DEMO_BUYER.name,
      email: buyerData?.email || DEMO_BUYER.email,
      role: 'buyer',
      phone: buyerData?.phone || DEMO_BUYER.phone,
      address: {
        street: '14 Admiralty Way, Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria'
      },
      joinedDate: '2025-08-14'
    });
  };

  const loginAsProducer = (producerId: string) => {
    const producer = PRODUCERS.find(p => p.id === producerId) || PRODUCERS[0];
    setUser({
      id: producer.id,
      name: producer.name,
      email: `${producer.id}@akweteweavers.org`,
      role: 'producer',
      producerId: producer.id,
      phone: producer.phone,
      address: {
        street: producer.village,
        city: 'Akwete Town',
        state: 'Abia State',
        country: 'Nigeria'
      },
      joinedDate: '2024-01-10'
    });
  };

  const signupBuyer = (data: { name: string; email: string; phone: string; city: string; country: string }) => {
    const newUser: User = {
      id: `buyer-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'buyer',
      phone: data.phone,
      address: {
        street: 'Delivery Address Pending',
        city: data.city,
        state: data.city,
        country: data.country
      },
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  const updateOrder = (orderId: string, updated: Partial<Order>) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, ...updated } : ord))
    );
  };

  const updateCommission = (commissionId: string, updated: Partial<CustomCommission>) => {
    setCommissions(prev =>
      prev.map(comm => (comm.id === commissionId ? { ...comm, ...updated } : comm))
    );
  };

  const reassignCommission = (commissionId: string, newProducerId: string) => {
    const targetProducer = producers.find(p => p.id === newProducerId);
    if (!targetProducer) return;
    setCommissions(prev =>
      prev.map(comm =>
        comm.id === commissionId
          ? {
              ...comm,
              producerId: targetProducer.id,
              producerName: targetProducer.name
            }
          : comm
      )
    );
  };

  const sendMessageOnBehalfOfProducer = (
    producerId: string,
    receiverId: string,
    receiverName: string,
    text: string,
    clothId?: string,
    clothTitle?: string
  ) => {
    const producer = producers.find(p => p.id === producerId);
    const producerName = producer ? producer.name : 'Master Weaver';
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: producerId,
      senderName: `${producerName} (via Admin Secretariat)`,
      senderRole: 'producer',
      receiverId,
      receiverName,
      clothId,
      clothTitle,
      text,
      timestamp: 'Just now',
      read: false,
      actingOnBehalfOfProducerName: producerName
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const addProducer = (data: Omit<Producer, 'id'>) => {
    const newProducer: Producer = {
      ...data,
      id: `producer-${Date.now()}`
    };
    setProducers(prev => [...prev, newProducer]);
  };

  const updateProducer = (id: string, updated: Partial<Producer>) => {
    setProducers(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProducer = (id: string) => {
    setProducers(prev => prev.filter(p => p.id !== id));
  };

  const updateCloth = (clothId: string, updated: Partial<AkweteCloth>) => {
    setCloths(prev =>
      prev.map(c => (c.id === clothId ? { ...c, ...updated } : c))
    );
  };

  const deleteCloth = (clothId: string) => {
    setCloths(prev => prev.filter(c => c.id !== clothId));
  };

  const loginAsAdmin = () => {
    setUser({
      id: 'admin-1',
      name: 'Cooperative Admin',
      email: 'admin@akweteweavers.org',
      role: 'admin',
      phone: '+234 803 419 8820',
      address: {
        street: 'Akwete Weavers Cooperative Secretariat',
        city: 'Akwete Town',
        state: 'Abia State',
        country: 'Nigeria'
      },
      joinedDate: '2024-01-01'
    });
    setIsAdminOpen(true);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currency,
        setCurrency,
        headingFont,
        setHeadingFont,
        formatPrice,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        orders,
        placeOrder,
        updateOrderStatus,
        updateOrder,
        producers,
        addProducer,
        updateProducer,
        deleteProducer,
        cloths,
        addNewCloth,
        updateCloth,
        deleteCloth,
        messages,
        sendMessage,
        sendMessageOnBehalfOfProducer,
        commissions,
        requestCommission,
        updateCommission,
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
        isSellerDashboardOpen,
        setIsSellerDashboardOpen,
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
        logout
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
