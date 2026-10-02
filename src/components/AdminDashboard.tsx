import React, { useState } from 'react';
import {
  X,
  Package,
  Users,
  Layers,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Phone,
  ShieldCheck,
  Search,
  ExternalLink,
  UserCheck,
  Send,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Truck,
  Eye,
  Store,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Producer, AkweteCloth, Order, CustomCommission } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    setIsAdminOpen,
    orders,
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
    commissions,
    updateCommission,
    reassignCommission,
    messages,
    sendMessageOnBehalfOfProducer,
    adminActingAsProducerId,
    actOnBehalfOfProducer,
    exitProxyMode,
    setIsSellerDashboardOpen,
    formatPrice,
    loginAsBuyer,
    setActiveClothModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'weavers' | 'cloths' | 'commissions' | 'messages' | 'proxy'>('orders');
  const [selectedWeaverId, setSelectedWeaverId] = useState<string>(
    adminActingAsProducerId || producers[0]?.id || ''
  );

  // New Weaver Form State
  const [showAddWeaver, setShowAddWeaver] = useState(false);
  const [weaverName, setWeaverName] = useState('');
  const [weaverTitle, setWeaverTitle] = useState('Master Weaver & Elder');
  const [weaverVillage, setWeaverVillage] = useState('Akwete Town, Ukwa East, Abia State');
  const [weaverYears, setWeaverYears] = useState<number>(28);
  const [weaverMotif, setWeaverMotif] = useState('Ikaki (Royal Tortoise) & Ochi');
  const [weaverPhone, setWeaverPhone] = useState('+234 803 419 8820');
  const [weaverWhatsapp, setWeaverWhatsapp] = useState('2348034198820');
  const [weaverBio, setWeaverBio] = useState('');

  // Editing Weaver State
  const [editingWeaver, setEditingWeaver] = useState<Producer | null>(null);

  // Add Cloth on behalf of weaver state
  const [showAddClothModal, setShowAddClothModal] = useState(false);
  const [clothWeaverId, setClothWeaverId] = useState(selectedWeaverId || producers[0]?.id || '');
  const [clothTitle, setClothTitle] = useState('');
  const [clothIgboName, setClothIgboName] = useState('');
  const [clothMotifName, setClothMotifName] = useState('Ikaki (Royal Tortoise)');
  const [clothMotifSymbolism, setClothMotifSymbolism] = useState('Symbol of sacred royal authority, endurance, and matrilineal wisdom.');
  const [clothPriceNGN, setClothPriceNGN] = useState<number>(185000);
  const [clothDimensions, setClothDimensions] = useState('48 x 76 inches (Double Wrapper Set)');
  const [clothMaterials, setMaterials] = useState('Hand-spun combed cotton with golden silk weft threads');
  const [clothWeaveTimeDays, setClothWeaveTimeDays] = useState<number>(24);
  const [clothCategory, setClothCategory] = useState<'Bridal' | 'Royal' | 'Ceremonial' | 'Contemporary' | 'Wall Tapestry'>('Royal');
  const [clothOccasion, setClothOccasion] = useState('Chieftaincy Investiture & Royal Ceremonies');
  const [clothDescription, setClothDescription] = useState('');
  const [clothImageUrl, setClothImageUrl] = useState('/images/akwaete_hero_cloth_1790722114411.jpg');

  // Editing cloth state
  const [editingCloth, setEditingCloth] = useState<AkweteCloth | null>(null);

  // Order Fulfillment on behalf of weaver
  const [orderLoomNoteInput, setOrderLoomNoteInput] = useState<{ [orderId: string]: string }>({});

  // Commission Progress Note on behalf of weaver
  const [commissionNoteInput, setCommissionNoteInput] = useState<{ [commId: string]: string }>({});

  // Direct Reply State
  const [replyText, setReplyText] = useState<{ [msgId: string]: string }>({});

  // Search & Filters
  const [searchOrders, setSearchOrders] = useState('');
  const [searchCloths, setSearchCloths] = useState('');

  const currentProxyWeaver = producers.find(p => p.id === (adminActingAsProducerId || selectedWeaverId)) || producers[0];

  const totalRevenueNGN = orders.reduce((sum, o) => sum + (o.totalNGN || 0), 0);
  const totalRevenueUSD = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);

  const handleSelectProxyWeaver = (id: string) => {
    setSelectedWeaverId(id);
    actOnBehalfOfProducer(id);
  };

  const handleOpenWeaverLoomStudio = (producerId: string) => {
    actOnBehalfOfProducer(producerId);
    setIsAdminOpen(false);
    setIsSellerDashboardOpen(true);
  };

  const handleCreateWeaver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weaverName) return;

    addProducer({
      name: weaverName,
      nativeTitle: weaverTitle,
      location: 'Akwete Town, Ukwa East, Abia State',
      village: weaverVillage,
      yearsOfExperience: weaverYears,
      avatarUrl: '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
      bio: weaverBio || `Master handloom artisan weaving in ${weaverVillage}. Specializes in authentic traditional Akwete wrappers.`,
      specialtyMotif: weaverMotif,
      loomType: 'Traditional Upright Vertical Loom',
      story: `I was trained in Akwete town by our elder matriarchs. Every cloth I weave is crafted on the vertical upright frame with patience and pure combed cotton.`,
      quote: 'Authentic Akwete cloth carries the dignity of our ancestors.',
      phone: weaverPhone,
      whatsapp: weaverWhatsapp,
      totalClothsWoven: 120,
      generationalLineage: '3rd Generation Master Weaver',
      rating: 5.0,
      reviewCount: 14,
      isGuildCertified: true
    });

    setShowAddWeaver(false);
    setWeaverName('');
    setWeaverBio('');
  };

  const handleSaveWeaverEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeaver) return;
    updateProducer(editingWeaver.id, editingWeaver);
    setEditingWeaver(null);
  };

  const handleCreateClothOnBehalf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothTitle) return;

    const producer = producers.find(p => p.id === clothWeaverId) || currentProxyWeaver;

    addNewCloth({
      title: clothTitle,
      igboName: clothIgboName || clothTitle,
      motifName: clothMotifName,
      motifSymbolism: clothMotifSymbolism,
      producerId: producer.id,
      producerName: producer.name,
      producerAvatar: producer.avatarUrl,
      priceNGN: clothPriceNGN,
      priceUSD: Math.round(clothPriceNGN / 1280),
      imageUrl: clothImageUrl,
      dimensions: clothDimensions,
      materials: clothMaterials,
      weaveTimeDays: clothWeaveTimeDays,
      colors: ['Indigo', 'Raw Ochre', 'Ivory'],
      category: clothCategory,
      inStock: true,
      stockCount: 1,
      description: clothDescription || `Authentic Akwete cloth handwoven by ${producer.name} on a vertical upright loom in ${producer.village}. Features authentic ${clothMotifName} motifs.`,
      culturalOccasion: clothOccasion,
      weightGrams: 1150,
      loomType: producer.loomType
    });

    setShowAddClothModal(false);
    setClothTitle('');
    setClothIgboName('');
    setClothDescription('');
    setActiveTab('cloths');
  };

  const handleSaveClothEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCloth) return;
    updateCloth(editingCloth.id, {
      ...editingCloth,
      priceUSD: Math.round(editingCloth.priceNGN / 1280)
    });
    setEditingCloth(null);
  };

  const handleSaveLoomNote = (orderId: string) => {
    const note = orderLoomNoteInput[orderId];
    if (note) {
      updateOrder(orderId, { loomNote: note });
      setOrderLoomNoteInput(prev => ({ ...prev, [orderId]: '' }));
    }
  };

  const handleReleaseWeaverPayout = (orderId: string) => {
    updateOrder(orderId, {
      payoutReleased: true,
      status: 'Delivered'
    });
  };

  const handleSendReplyOnBehalf = (msg: (typeof messages)[0]) => {
    const text = replyText[msg.id];
    if (!text?.trim()) return;

    const targetProducer = producers.find(p => p.id === msg.receiverId) || currentProxyWeaver;

    sendMessageOnBehalfOfProducer(
      targetProducer.id,
      msg.senderId,
      msg.senderName,
      text,
      msg.clothId,
      msg.clothTitle
    );
    setReplyText(prev => ({ ...prev, [msg.id]: '' }));
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.buyerPhone.toLowerCase().includes(searchOrders.toLowerCase())
  );

  const filteredCloths = cloths.filter(c =>
    c.title.toLowerCase().includes(searchCloths.toLowerCase()) ||
    c.producerName.toLowerCase().includes(searchCloths.toLowerCase()) ||
    c.motifName.toLowerCase().includes(searchCloths.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col">
      
      {/* Sleek, Luxury Atelier Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            
            {/* Brand + Admin Tag */}
            <div className="flex items-center gap-3">
              <span className="font-serif-display text-xl font-bold tracking-tight text-stone-900">
                Akwete Luxe
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md">
                Atelier Suite
              </span>
            </div>

            {/* Clean Segmented Navigation Tabs */}
            <nav className="hidden md:flex items-center bg-stone-100/80 p-1 rounded-xl border border-stone-200/60 text-xs">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Orders</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('weavers')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'weavers'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Weavers</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                  {producers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cloths')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'cloths'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Catalog</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                  {cloths.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'commissions'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Commissions</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                  {commissions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'messages'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Inquiries</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                  {messages.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('proxy')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'proxy'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <span>Proxy Hub</span>
              </button>
            </nav>

            {/* Right Tools: Proxy Switcher + Quick Action + Return */}
            <div className="flex items-center gap-2.5">
              
              {/* Compact Proxy Selector */}
              <div className="hidden lg:flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-700">
                <UserCheck className="w-3.5 h-3.5 text-amber-900" />
                <span className="text-[11px] text-stone-500">Acting:</span>
                <select
                  value={adminActingAsProducerId || selectedWeaverId}
                  onChange={e => handleSelectProxyWeaver(e.target.value)}
                  className="bg-transparent text-stone-900 font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  {producers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {adminActingAsProducerId && (
                  <button
                    onClick={exitProxyMode}
                    className="text-[10px] text-amber-800 hover:underline font-bold ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setClothWeaverId(adminActingAsProducerId || selectedWeaverId);
                  setShowAddClothModal(true);
                }}
                className="hidden sm:inline-flex items-center gap-1 bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List Piece</span>
              </button>

              {/* Return to Storefront */}
              <button
                onClick={() => setIsAdminOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                title="Return to the storefront"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </button>
            </div>

          </div>

          {/* Mobile Tab Scroll for small screens */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-100 text-xs scrollbar-none">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('weavers')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === 'weavers' ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}
            >
              Weavers ({producers.length})
            </button>
            <button
              onClick={() => setActiveTab('cloths')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === 'cloths' ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}
            >
              Catalog ({cloths.length})
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === 'commissions' ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}
            >
              Commissions ({commissions.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === 'messages' ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}
            >
              Inquiries ({messages.length})
            </button>
          </div>

        </div>
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Executive Atelier KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
              Escrow Value
            </span>
            <div className="font-bold text-stone-900 text-lg sm:text-xl tabular-nums">
              {formatPrice({ priceNGN: totalRevenueNGN, priceUSD: totalRevenueUSD })}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Secured in escrow</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
              Total Orders
            </span>
            <div className="font-bold text-stone-900 text-lg sm:text-xl tabular-nums">
              {orders.length} Orders
            </div>
            <span className="text-[11px] text-stone-500">Across Nigeria & diaspora</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
              Registered Weavers
            </span>
            <div className="font-bold text-stone-900 text-lg sm:text-xl tabular-nums">
              {producers.length} Artisans
            </div>
            <span className="text-[11px] text-stone-500">Ukwa East LGA certified</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
              Cloth Inventory
            </span>
            <div className="font-bold text-stone-900 text-lg sm:text-xl tabular-nums">
              {cloths.length} Wrappers
            </div>
            <span className="text-[11px] text-stone-500">Ready on vertical looms</span>
          </div>
        </div>

        {/* TAB 1: ORDERS & WAYBILLS */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
                  Orders & Interstate Waybill Management
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Verify buyer payments, dispatch interstate couriers to Lagos/Abuja, and release weaver settlements.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search order ID, buyer, phone..."
                  value={searchOrders}
                  onChange={e => setSearchOrders(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
                />
              </div>
            </div>

            {/* Orders Stack */}
            <div className="space-y-6">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow space-y-6"
                >
                  {/* Top Row: Identification, Status & Amount */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-stone-900">
                          {order.id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Weaving / Preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-stone-400">
                          {order.createdAt}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600">
                        Buyer: <strong>{order.buyerName}</strong> ({order.buyerPhone}) · {order.buyerEmail}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[11px] uppercase font-bold tracking-wider text-stone-400">Total Settlement</div>
                        <div className="text-xl font-bold text-stone-900 tabular-nums">
                          {formatPrice({ priceNGN: order.totalNGN, priceUSD: order.totalUSD })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-stone-500 font-medium">Status:</label>
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
                        >
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Weaving / Preparing">Weaving / Preparing</option>
                          <option value="Shipped">Shipped (Waybill)</option>
                          <option value="Delivered">Delivered & Fulfilled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
                    
                    {/* Ordered Items (6 cols) */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px]">
                        Ordered Wrappers
                      </div>
                      {order.items.map(item => (
                        <div
                          key={item.cloth.id}
                          className="flex items-center gap-4 p-4 bg-stone-50/80 rounded-2xl border border-stone-200/60"
                        >
                          <img
                            src={item.cloth.imageUrl}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover bg-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif-display text-base font-bold text-stone-900 truncate">
                              {item.cloth.title}
                            </h4>
                            <p className="text-stone-500 text-xs">
                              Woven by {item.cloth.producerName} · Qty: {item.quantity}
                            </p>
                            {item.customNote && (
                              <p className="text-amber-900 italic mt-1 text-xs">
                                Note: "{item.customNote}"
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-stone-900 text-sm tabular-nums">
                            {formatPrice(item.cloth)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Waybill (6 cols) */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px]">
                        Courier & Waybill Logistics
                      </div>
                      <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/60 space-y-3">
                        <div>
                          <span className="text-stone-500 block text-[11px]">Destination Address:</span>
                          <span className="font-medium text-stone-900 text-xs sm:text-sm">
                            {order.deliveryAddress}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                          <Truck className="w-4 h-4 text-stone-500 shrink-0" />
                          <span className="text-stone-600 font-medium">Waybill / Courier Note:</span>
                          <input
                            type="text"
                            defaultValue={order.loomNote || ''}
                            placeholder="e.g. Dispatched via GIG Logistics (Waybill #8921)"
                            onBlur={e => updateOrder(order.id, { loomNote: e.target.value })}
                            className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-stone-500">Method: <strong>{order.paymentMethod}</strong></span>
                          {order.payoutReleased ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                              <CheckCircle className="w-4 h-4" />
                              <span>Weaver Payout Released</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReleaseWeaverPayout(order.id)}
                              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-xl transition-all shadow-2xs"
                            >
                              Release Weaver Payout
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Loom Note on behalf of weaver */}
                  <div className="pt-4 border-t border-stone-100 flex items-center gap-3 text-xs">
                    <span className="text-stone-500 font-medium whitespace-nowrap">Loom Progress Note:</span>
                    <input
                      type="text"
                      placeholder="e.g. Raised weft threads 70% complete on the upright loom. Fringe trimming starts tomorrow."
                      value={orderLoomNoteInput[order.id] || ''}
                      onChange={e => setOrderLoomNoteInput({ ...orderLoomNoteInput, [order.id]: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                    <button
                      onClick={() => handleSaveLoomNote(order.id)}
                      className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl font-semibold transition-colors shrink-0"
                    >
                      Update Buyer
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: MASTER WEAVERS ROSTER */}
        {activeTab === 'weavers' && (
          <div className="space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
                  Master Weavers Roster & Proxy Management
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Manage artisan biographies, specialized motifs, contact details, and act on their behalf.
                </p>
              </div>

              <button
                onClick={() => setShowAddWeaver(true)}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Master Weaver</span>
              </button>
            </div>

            {/* Weavers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {producers.map(producer => {
                const weaverCloths = cloths.filter(c => c.producerId === producer.id);
                const isCurrentProxy = adminActingAsProducerId === producer.id;

                return (
                  <div
                    key={producer.id}
                    className={`bg-white rounded-3xl border p-7 flex flex-col justify-between transition-all duration-200 ${
                      isCurrentProxy ? 'border-amber-900 ring-2 ring-amber-900/20 shadow-md' : 'border-stone-200/80 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <img
                          src={producer.avatarUrl}
                          alt=""
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif-display text-xl font-bold text-stone-900 truncate">
                              {producer.name}
                            </h3>
                          </div>
                          <p className="text-xs text-amber-950 font-semibold mt-0.5">{producer.nativeTitle}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{producer.village.split(',')[0]} · {producer.yearsOfExperience} yrs at loom</p>
                          {isCurrentProxy && (
                            <span className="inline-block mt-1.5 bg-amber-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              PROXY ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-stone-600 bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                        <div><strong>Signature Motif:</strong> {producer.specialtyMotif}</div>
                        <div><strong>Direct Line:</strong> {producer.phone}</div>
                        <div><strong>Pieces in Catalog:</strong> {weaverCloths.length} wrappers</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleSelectProxyWeaver(producer.id)}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          isCurrentProxy
                            ? 'bg-amber-950 text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{isCurrentProxy ? 'Proxy Session Active' : 'Act on Her Behalf'}</span>
                      </button>

                      <button
                        onClick={() => setEditingWeaver(producer)}
                        className="p-2.5 hover:bg-stone-100 text-stone-600 rounded-xl transition-colors"
                        title="Edit Weaver Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteProducer(producer.id)}
                        className="p-2.5 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-xl transition-colors"
                        title="Remove Weaver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: CLOTH CATALOG */}
        {activeTab === 'cloths' && (
          <div className="space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
                  Cloth Inventory & Handloom Catalog
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  Manage inventory, pricing, motif symbolism, and publish newly finished wrappers on the public atelier.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search title, motif, weaver..."
                    value={searchCloths}
                    onChange={e => setSearchCloths(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
                  />
                </div>

                <button
                  onClick={() => {
                    setClothWeaverId(adminActingAsProducerId || selectedWeaverId);
                    setShowAddClothModal(true);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>List New Cloth</span>
                </button>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCloths.map(cloth => (
                <div
                  key={cloth.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-4/3 bg-stone-100">
                      <img
                        src={cloth.imageUrl}
                        alt=""
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute top-3.5 left-3.5 bg-stone-900/80 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
                        {cloth.category}
                      </div>
                    </div>

                    <div className="p-6 space-y-2.5">
                      <div className="text-xs text-stone-500 font-medium">
                        Woven by <strong>{cloth.producerName}</strong>
                      </div>

                      <h3 className="font-serif-display text-xl font-bold text-stone-900 leading-snug">
                        {cloth.title}
                      </h3>

                      <div className="text-xs text-stone-600 line-clamp-2">
                        {cloth.motifName} · {cloth.dimensions}
                      </div>

                      <div className="text-lg font-bold text-stone-900 pt-2 tabular-nums">
                        {formatPrice(cloth)}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveClothModal(cloth)}
                      className="font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview Atelier Card</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCloth(cloth)}
                        className="p-2 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors"
                        title="Edit Piece"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCloth(cloth.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-stone-400 hover:text-red-700 transition-colors"
                        title="Remove Piece"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: CUSTOM COMMISSIONS */}
        {activeTab === 'commissions' && (
          <div className="space-y-8">
            
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
                Custom Loom Commissions (Weddings & Royalty)
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Oversee tailored bridal and chieftaincy commissions, reassign between master weavers, and update progress notes.
              </p>
            </div>

            <div className="space-y-6">
              {commissions.map(comm => (
                <div
                  key={comm.id}
                  className="bg-white rounded-3xl border border-stone-200/90 p-7 shadow-xs hover:shadow-md transition-shadow space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-stone-900">
                          {comm.id}
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {comm.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">
                        Client: <strong>{comm.buyerName}</strong> ({comm.buyerContact}) · Occasion: {comm.occasion} (Target: {comm.targetDate})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs text-stone-500 font-medium">Assigned Weaver:</label>
                      <select
                        value={comm.producerId}
                        onChange={e => reassignCommission(comm.id, e.target.value)}
                        className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none"
                      >
                        {producers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs bg-stone-50/80 p-5 rounded-2xl border border-stone-100">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Requested Motif:</span>
                      <span className="font-semibold text-stone-900 text-sm">{comm.desiredMotif}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Color Palette:</span>
                      <span className="font-semibold text-stone-900 text-sm">{comm.colors}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Estimated Budget:</span>
                      <span className="font-bold text-stone-900 text-sm">₦{comm.estimatedBudgetNGN?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-xs">
                    <span className="text-stone-500 font-medium whitespace-nowrap">Weaver Loom Note:</span>
                    <input
                      type="text"
                      placeholder="e.g. Warp threads stretched on vertical frame. Dyeing ochre wefts today."
                      value={commissionNoteInput[comm.id] || ''}
                      onChange={e => setCommissionNoteInput({ ...commissionNoteInput, [comm.id]: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const note = commissionNoteInput[comm.id];
                        if (note) {
                          updateCommission(comm.id, { weaverProgressNote: note, status: 'Loom Warped' });
                          setCommissionNoteInput(prev => ({ ...prev, [comm.id]: '' }));
                        }
                      }}
                      className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl font-semibold transition-colors shrink-0"
                    >
                      Publish Note
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: DIRECT INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
                Buyer Inquiries & Proxy Messaging
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Reply directly to prospective buyers on behalf of elder master weavers who may not use smartphones.
              </p>
            </div>

            <div className="space-y-6">
              {messages.map(msg => {
                const targetProducer = producers.find(p => p.id === msg.receiverId) || currentProxyWeaver;

                return (
                  <div
                    key={msg.id}
                    className="bg-white rounded-3xl border border-stone-200/90 p-7 shadow-xs hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                      <div>
                        <span className="font-bold text-stone-900 text-sm">{msg.senderName}</span>
                        <span className="text-stone-400 ml-2">→ Addressed to: <strong>{targetProducer.name}</strong></span>
                      </div>
                      <span className="text-stone-400">{msg.timestamp}</span>
                    </div>

                    <div className="p-4 bg-stone-50/80 rounded-2xl text-xs text-stone-800 leading-relaxed">
                      {msg.text}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="text"
                        placeholder={`Reply to ${msg.senderName} on behalf of ${targetProducer.name}...`}
                        value={replyText[msg.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                        className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                      <button
                        onClick={() => handleSendReplyOnBehalf(msg)}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 6: PROXY CONTROL HUB */}
        {activeTab === 'proxy' && (
          <div className="space-y-8">
            
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
                Artisan Proxy Operations Command
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                You are currently empowered to publish, edit, and represent: <strong>{currentProxyWeaver.name}</strong>.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center gap-8">
              <img
                src={currentProxyWeaver.avatarUrl}
                alt=""
                className="w-36 h-36 rounded-3xl object-cover border-2 border-stone-300 shadow-sm shrink-0"
              />

              <div className="space-y-3 flex-1 text-center md:text-left">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                  Active Elder Representation
                </span>
                <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                  {currentProxyWeaver.name}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
                  {currentProxyWeaver.bio}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 justify-center md:justify-start">
                  <button
                    onClick={() => handleOpenWeaverLoomStudio(currentProxyWeaver.id)}
                    className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Her Loom Studio Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setClothWeaverId(currentProxyWeaver.id);
                      setShowAddClothModal(true);
                    }}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>List a Finished Piece for Her</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Submodal: Add New Weaver */}
      {showAddWeaver && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Register Master Weaver
              </h3>
              <button onClick={() => setShowAddWeaver(false)} className="text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWeaver} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={weaverName}
                  onChange={e => setWeaverName(e.target.value)}
                  placeholder="e.g. Mama Beatrice Nwosu"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Native Title:</label>
                <input
                  type="text"
                  value={weaverTitle}
                  onChange={e => setWeaverTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Village:</label>
                  <input
                    type="text"
                    value={weaverVillage}
                    onChange={e => setWeaverVillage(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Years of Experience:</label>
                  <input
                    type="number"
                    value={weaverYears}
                    onChange={e => setWeaverYears(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Phone:</label>
                  <input
                    type="text"
                    value={weaverPhone}
                    onChange={e => setWeaverPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">WhatsApp (Digits):</label>
                  <input
                    type="text"
                    value={weaverWhatsapp}
                    onChange={e => setWeaverWhatsapp(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Bio / Artisan History:</label>
                <textarea
                  rows={3}
                  value={weaverBio}
                  onChange={e => setWeaverBio(e.target.value)}
                  placeholder="Master weaver who learned on vertical frame in Akwete..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddWeaver(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                >
                  Save Weaver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Edit Weaver */}
      {editingWeaver && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Edit {editingWeaver.name}
              </h3>
              <button onClick={() => setEditingWeaver(null)} className="text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeaverEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={editingWeaver.name}
                  onChange={e => setEditingWeaver({ ...editingWeaver, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Native Title:</label>
                <input
                  type="text"
                  value={editingWeaver.nativeTitle}
                  onChange={e => setEditingWeaver({ ...editingWeaver, nativeTitle: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Village:</label>
                  <input
                    type="text"
                    value={editingWeaver.village}
                    onChange={e => setEditingWeaver({ ...editingWeaver, village: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Years Experience:</label>
                  <input
                    type="number"
                    value={editingWeaver.yearsOfExperience}
                    onChange={e => setEditingWeaver({ ...editingWeaver, yearsOfExperience: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Bio:</label>
                <textarea
                  rows={3}
                  value={editingWeaver.bio}
                  onChange={e => setEditingWeaver({ ...editingWeaver, bio: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingWeaver(null)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Add Cloth on behalf */}
      {showAddClothModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-stone-900">
                  List New Akwete Cloth
                </h3>
                <p className="text-xs text-stone-500">Publishing on behalf of master weaver</p>
              </div>
              <button onClick={() => setShowAddClothModal(false)} className="text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClothOnBehalf} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Select Weaver Author:</label>
                <select
                  value={clothWeaverId}
                  onChange={e => setClothWeaverId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 font-semibold focus:outline-none focus:border-stone-900"
                >
                  {producers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.village.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Cloth Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Emerald Ikaki Double Wrapper"
                  value={clothTitle}
                  onChange={e => setClothTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Motif:</label>
                  <input
                    type="text"
                    value={clothMotifName}
                    onChange={e => setClothMotifName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Price (₦ NGN):</label>
                  <input
                    type="number"
                    value={clothPriceNGN}
                    onChange={e => setClothPriceNGN(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Dimensions:</label>
                  <input
                    type="text"
                    value={clothDimensions}
                    onChange={e => setClothDimensions(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Days on Loom:</label>
                  <input
                    type="number"
                    value={clothWeaveTimeDays}
                    onChange={e => setClothWeaveTimeDays(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description:</label>
                <textarea
                  rows={3}
                  value={clothDescription}
                  onChange={e => setClothDescription(e.target.value)}
                  placeholder="Authentic double wrapper set handloomed in Akwete..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddClothModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                >
                  Publish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal: Edit Cloth */}
      {editingCloth && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Edit {editingCloth.title}
              </h3>
              <button onClick={() => setEditingCloth(null)} className="text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClothEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Title:</label>
                <input
                  type="text"
                  required
                  value={editingCloth.title}
                  onChange={e => setEditingCloth({ ...editingCloth, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Price (₦ NGN):</label>
                  <input
                    type="number"
                    value={editingCloth.priceNGN}
                    onChange={e => setEditingCloth({ ...editingCloth, priceNGN: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category:</label>
                  <select
                    value={editingCloth.category}
                    onChange={e => setEditingCloth({ ...editingCloth, category: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Royal">Royal</option>
                    <option value="Ceremonial">Ceremonial</option>
                    <option value="Contemporary">Contemporary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description:</label>
                <textarea
                  rows={3}
                  value={editingCloth.description}
                  onChange={e => setEditingCloth({ ...editingCloth, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCloth(null)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
