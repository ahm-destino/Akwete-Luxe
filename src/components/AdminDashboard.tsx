import React, { useState, useMemo } from 'react';
import { ImageUploader } from './ImageUploader';
import {
  X, Plus, Trash2, Edit2, CheckCircle, Search, ExternalLink, UserCheck, Send,
  Truck, Eye, Store, DollarSign, Package, Users, TrendingUp,
  Hourglass, BadgeCheck, Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Producer, AkweteCloth, Order } from '../types';
import { toast } from '../lib/toast';

type Tab = 'overview' | 'orders' | 'weavers' | 'cloths' | 'customers' | 'commissions' | 'messages' | 'settings' | 'proxy';

const CATEGORIES: AkweteCloth['category'][] = ['Royal', 'Bridal', 'Ceremonial', 'Contemporary', 'Wall Tapestry'];

export const AdminDashboard: React.FC = () => {
  const {
    setIsAdminOpen,
    orders, updateOrderStatus, updateOrder,
    producers, addProducer, updateProducer, deleteProducer, approveProducer, suspendProducer,
    cloths, addNewCloth, updateCloth, deleteCloth,
    commissions, updateCommission, reassignCommission,
    messages, sendMessageOnBehalfOfProducer,
    adminActingAsProducerId, actOnBehalfOfProducer, exitProxyMode,
    setIsProducerConsoleOpen,
    formatPrice, usdFromNgn,
    settings, updateSettings,
    setActiveClothModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedWeaverId, setSelectedWeaverId] = useState<string>(adminActingAsProducerId || producers[0]?.id || '');

  // Add weaver form
  const [showAddWeaver, setShowAddWeaver] = useState(false);
  const [weaverName, setWeaverName] = useState('');
  const [weaverTitle, setWeaverTitle] = useState('Master Weaver & Elder');
  const [weaverVillage, setWeaverVillage] = useState('Akwete Town, Ukwa East, Abia State');
  const [weaverYears, setWeaverYears] = useState<number>(28);
  const [weaverMotif, setWeaverMotif] = useState('Ikaki (Royal Tortoise) & Ochi');
  const [weaverPhone, setWeaverPhone] = useState('+234 803 419 8820');
  const [weaverWhatsapp, setWeaverWhatsapp] = useState('2348034198820');
  const [weaverBio, setWeaverBio] = useState('');
  const [weaverAvatarUrl, setWeaverAvatarUrl] = useState('/images/akwaete_weaver_mama_grace_1790722126050.jpg');
  const [editingWeaver, setEditingWeaver] = useState<Producer | null>(null);

  // Cloth add (on behalf) + edit
  const [showAddCloth, setShowAddCloth] = useState(false);
  const [clothWeaverId, setClothWeaverId] = useState(selectedWeaverId || producers[0]?.id || '');
  const [clothDraft, setClothDraft] = useState<Partial<AkweteCloth>>({});
  const [editingCloth, setEditingCloth] = useState<AkweteCloth | null>(null);

  const [commissionNoteInput, setCommissionNoteInput] = useState<Record<string, string>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [searchOrders, setSearchOrders] = useState('');
  const [searchCloths, setSearchCloths] = useState('');

  // Settings draft
  const [rateDraft, setRateDraft] = useState<string>('');
  const [bankDraft, setBankDraft] = useState<string>('');

  const currentProxyWeaver = producers.find(p => p.id === (adminActingAsProducerId || selectedWeaverId)) || producers[0];

  const totalRevenueNGN = orders.reduce((sum, o) => sum + (o.totalNGN || 0), 0);
  const totalRevenueUSD = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
  const pendingApplications = producers.filter(p => p.status === 'pending');
  const activeWeavers = producers.filter(p => (p.status ?? 'active') === 'active');

  // ── Analytics ──────────────────────────────────────────────
  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const m = (o.createdAt || '').slice(0, 7);
      if (!m) continue;
      map.set(m, (map.get(m) || 0) + o.totalNGN);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([m, v]) => {
        const d = new Date(`${m}-01T00:00:00`);
        return { label: isNaN(d.getTime()) ? m : d.toLocaleString('en', { month: 'short' }), value: v };
      });
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const statuses: Order['status'][] = ['Pending Verification', 'Weaving / Preparing', 'Shipped', 'Delivered'];
    const tones: Record<Order['status'], string> = {
      'Pending Verification': '#78716c',
      'Weaving / Preparing': '#b45309',
      'Shipped': '#1d4ed8',
      'Delivered': '#047857',
    };
    return statuses.map(s => ({ label: s, value: orders.filter(o => o.status === s).length, color: tones[s] }));
  }, [orders]);

  const topWeavers = useMemo(() =>
    producers.map(p => ({
      name: p.name,
      rev: orders.reduce((s, o) => s + (o.producerNames.includes(p.name) ? o.totalNGN : 0), 0),
      pieces: cloths.filter(c => c.producerId === p.id).length,
    })).sort((a, b) => b.rev - a.rev).slice(0, 5),
  [producers, orders, cloths]);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; orders: number; totalNGN: number; totalUSD: number }>();
    for (const o of orders) {
      const key = o.buyerEmail || o.buyerId || o.buyerName;
      const ex = map.get(key) || { name: o.buyerName, email: o.buyerEmail, phone: o.buyerPhone, orders: 0, totalNGN: 0, totalUSD: 0 };
      ex.orders += 1; ex.totalNGN += o.totalNGN; ex.totalUSD += o.totalUSD;
      map.set(key, ex);
    }
    return Array.from(map.values()).sort((a, b) => b.totalNGN - a.totalNGN);
  }, [orders]);

  const lowStock = cloths.filter(c => !c.inStock || c.stockCount <= 1);

  // ── Handlers ───────────────────────────────────────────────
  const handleSelectProxyWeaver = (id: string) => { setSelectedWeaverId(id); actOnBehalfOfProducer(id); };
  const handleOpenWeaverConsole = (producerId: string) => { actOnBehalfOfProducer(producerId); setIsAdminOpen(false); setIsProducerConsoleOpen(true); };

  const handleCreateWeaver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weaverName) return;
    addProducer({
      name: weaverName, nativeTitle: weaverTitle, location: 'Akwete Town, Ukwa East, Abia State',
      village: weaverVillage, yearsOfExperience: weaverYears,
      avatarUrl: weaverAvatarUrl || '/images/akwaete_weaver_mama_grace_1790722126050.jpg',
      bio: weaverBio || `Master handloom artisan weaving in ${weaverVillage}.`,
      specialtyMotif: weaverMotif, loomType: 'Traditional Upright Vertical Loom',
      story: 'Trained in Akwete town by elder matriarchs.', quote: 'Authentic Akwete cloth carries the dignity of our ancestors.',
      phone: weaverPhone, whatsapp: weaverWhatsapp, totalClothsWoven: 120,
      generationalLineage: '3rd Generation Master Weaver', rating: 5.0, reviewCount: 14,
      isGuildCertified: true, status: 'active',
    });
    setShowAddWeaver(false); setWeaverName(''); setWeaverBio('');
  };

  const handleSaveWeaverEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeaver) return;
    updateProducer(editingWeaver.id, editingWeaver);
    setEditingWeaver(null);
  };

  const openAddCloth = () => {
    setClothWeaverId(adminActingAsProducerId || selectedWeaverId || producers[0]?.id || '');
    setClothDraft({
      title: '', igboName: '', motifName: 'Ikaki (Royal Tortoise)',
      motifSymbolism: 'Symbol of sacred royal authority, endurance, and matrilineal wisdom.',
      priceNGN: 185000, dimensions: '48 x 76 inches (Double Wrapper Set)',
      materials: 'Hand-spun combed cotton with golden silk weft threads', weaveTimeDays: 24,
      category: 'Royal', culturalOccasion: 'Chieftaincy Investiture & Royal Ceremonies',
      colors: ['Indigo', 'Raw Ochre', 'Ivory'], description: '',
      imageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg', secondaryImageUrl: '',
      inStock: true, stockCount: 1,
    });
    setShowAddCloth(true);
  };

  const handleCreateCloth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothDraft.title) return;
    const producer = producers.find(p => p.id === clothWeaverId) || currentProxyWeaver;
    const priceNGN = Number(clothDraft.priceNGN) || 0;
    addNewCloth({
      title: clothDraft.title!, igboName: clothDraft.igboName || clothDraft.title!,
      motifName: clothDraft.motifName || 'Ikaki (Royal Tortoise)', motifSymbolism: clothDraft.motifSymbolism || '',
      producerId: producer.id, producerName: producer.name, producerAvatar: producer.avatarUrl,
      priceNGN, priceUSD: usdFromNgn(priceNGN),
      imageUrl: clothDraft.imageUrl || '/images/akwaete_hero_cloth_1790722114411.jpg',
      secondaryImageUrl: clothDraft.secondaryImageUrl || undefined,
      dimensions: clothDraft.dimensions || '', materials: clothDraft.materials || '',
      weaveTimeDays: Number(clothDraft.weaveTimeDays) || 21, colors: clothDraft.colors || [],
      category: (clothDraft.category || 'Royal'), inStock: clothDraft.inStock ?? true, stockCount: Number(clothDraft.stockCount) || 1,
      description: clothDraft.description || `Authentic Akwete cloth handwoven by ${producer.name}.`,
      culturalOccasion: clothDraft.culturalOccasion || '', weightGrams: 1150, loomType: producer.loomType,
    });
    setShowAddCloth(false);
    setActiveTab('cloths');
  };

  const handleSaveClothEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCloth) return;
    updateCloth(editingCloth.id, { ...editingCloth, priceUSD: usdFromNgn(editingCloth.priceNGN) });
    setEditingCloth(null);
  };

  const handleReleasePayout = (orderId: string) => updateOrder(orderId, { payoutReleased: true, payoutDate: new Date().toISOString().split('T')[0] });

  const handleApprove = (p: Producer) => { approveProducer(p.id); toast.success(`${p.name} approved — their Weaver Studio is now live.`); };
  const handleSuspend = (p: Producer) => { suspendProducer(p.id); toast.info(`${p.name}'s account has been suspended.`); };

  const handleSendReply = (msg: (typeof messages)[0]) => {
    const text = replyText[msg.id];
    if (!text?.trim()) return;
    const targetProducer = producers.find(p => p.id === msg.receiverId) || currentProxyWeaver;
    sendMessageOnBehalfOfProducer(targetProducer.id, msg.senderId, msg.senderName, text, msg.clothId, msg.clothTitle);
    setReplyText(prev => ({ ...prev, [msg.id]: '' }));
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchOrders.toLowerCase()) ||
    (o.buyerPhone || '').toLowerCase().includes(searchOrders.toLowerCase())
  );
  const filteredCloths = cloths.filter(c =>
    c.title.toLowerCase().includes(searchCloths.toLowerCase()) ||
    c.producerName.toLowerCase().includes(searchCloths.toLowerCase()) ||
    c.motifName.toLowerCase().includes(searchCloths.toLowerCase())
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders', count: orders.length },
    { id: 'weavers', label: 'Weavers', count: producers.length },
    { id: 'cloths', label: 'Catalog', count: cloths.length },
    { id: 'customers', label: 'Customers', count: customers.length },
    { id: 'commissions', label: 'Commissions', count: commissions.length },
    { id: 'messages', label: 'Inquiries', count: messages.length },
    { id: 'settings', label: 'Settings' },
    { id: 'proxy', label: 'Proxy' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-serif-display text-xl font-bold tracking-tight text-stone-900">Akwete Luxe</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md">Atelier Suite</span>
            </div>

            <nav className="hidden md:flex items-center bg-stone-100/80 p-1 rounded-xl border border-stone-200/60 text-xs">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${activeTab === t.id ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'}`}>
                  <span>{t.label}</span>
                  {t.count !== undefined && <span className="text-[10px] font-mono px-1.5 rounded-full bg-stone-200 text-stone-700">{t.count}</span>}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <div className="hidden lg:flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-700">
                <UserCheck className="w-3.5 h-3.5 text-amber-900" />
                <span className="text-[11px] text-stone-500">Acting:</span>
                <select value={adminActingAsProducerId || selectedWeaverId} onChange={e => handleSelectProxyWeaver(e.target.value)}
                  className="bg-transparent text-stone-900 font-semibold text-xs focus:outline-none cursor-pointer">
                  {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {adminActingAsProducerId && <button onClick={exitProxyMode} className="text-[10px] text-amber-800 hover:underline font-bold ml-1">Reset</button>}
              </div>
              <button onClick={openAddCloth} className="hidden sm:inline-flex items-center gap-1 bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs">
                <Plus className="w-3.5 h-3.5" /> List Piece
              </button>
              <button onClick={() => setIsAdminOpen(false)} className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                <Store className="w-3.5 h-3.5" /> Storefront
              </button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-100 text-xs scrollbar-none">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === t.id ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}>
                {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiTile icon={<DollarSign className="w-4 h-4" />} label="Escrow Value" value={formatPrice({ priceNGN: totalRevenueNGN, priceUSD: totalRevenueUSD })} hint="Secured in escrow" tone="emerald" />
          <KpiTile icon={<Package className="w-4 h-4" />} label="Total Orders" value={`${orders.length}`} hint="Across Nigeria & diaspora" />
          <KpiTile icon={<Users className="w-4 h-4" />} label="Active Weavers" value={`${activeWeavers.length}`} hint={pendingApplications.length ? `${pendingApplications.length} pending review` : 'Ukwa East LGA certified'} />
          <KpiTile icon={<TrendingUp className="w-4 h-4" />} label="Cloth Inventory" value={`${cloths.length}`} hint={`${lowStock.length} low / out of stock`} />
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {pendingApplications.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Hourglass className="w-5 h-5 text-amber-700" />
                  <span className="text-sm text-amber-900 font-semibold">
                    {pendingApplications.length} weaver application{pendingApplications.length > 1 ? 's' : ''} awaiting review
                  </span>
                </div>
                <button onClick={() => setActiveTab('weavers')} className="text-xs font-bold text-amber-900 hover:underline">Review now →</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="Revenue by Month">
                {revenueByMonth.length === 0 ? <Empty /> : (
                  <div className="flex items-end gap-3 h-48 pt-6">
                    {revenueByMonth.map(d => {
                      const max = Math.max(1, ...revenueByMonth.map(x => x.value));
                      return (
                        <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-stone-700 tabular-nums">₦{Math.round(d.value / 1000)}k</span>
                          <div className="w-full bg-amber-900 rounded-t-[4px] transition-all" style={{ height: `${Math.max(4, (d.value / max) * 150)}px` }} title={formatPrice({ priceNGN: d.value, priceUSD: usdFromNgn(d.value) })} />
                          <span className="text-[10px] text-stone-500 truncate w-full text-center">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel title="Orders by Status">
                <div className="space-y-3 pt-2">
                  {ordersByStatus.map(s => {
                    const max = Math.max(1, ...ordersByStatus.map(x => x.value));
                    return (
                      <div key={s.label} className="flex items-center gap-3 text-xs">
                        <span className="w-40 shrink-0 text-stone-600">{s.label}</span>
                        <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s.value / max) * 100}%`, backgroundColor: s.color }} />
                        </div>
                        <span className="w-8 text-right font-bold text-stone-900 tabular-nums">{s.value}</span>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="Top Weavers by Revenue">
                {topWeavers.every(w => w.rev === 0) ? <Empty /> : (
                  <div className="space-y-3 pt-2">
                    {topWeavers.map(w => {
                      const max = Math.max(1, ...topWeavers.map(x => x.rev));
                      return (
                        <div key={w.name} className="flex items-center gap-3 text-xs">
                          <span className="w-36 shrink-0 text-stone-600 truncate">{w.name}</span>
                          <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-900 rounded-full" style={{ width: `${(w.rev / max) * 100}%` }} />
                          </div>
                          <span className="w-16 text-right font-bold text-stone-900 tabular-nums">₦{Math.round(w.rev / 1000)}k</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel title="Recent Orders">
                <div className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-stone-900">{o.id}</span>
                        <span className="text-stone-500 ml-2 truncate">{o.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-stone-900 tabular-nums">{formatPrice({ priceNGN: o.totalNGN, priceUSD: o.totalUSD })}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <Empty />}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Orders, Payments & Waybills</h1>
                <p className="mt-1 text-sm text-stone-600">Verify payments, dispatch couriers, and release weaver settlements.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="text" placeholder="Search order ID, buyer, phone..." value={searchOrders} onChange={e => setSearchOrders(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs" />
              </div>
            </div>

            <div className="space-y-6">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-base font-bold text-stone-900">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'Weaving / Preparing' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-800'}`}>{order.status}</span>
                        {order.paymentVerified
                          ? <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> Paid</span>
                          : <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-50 text-stone-500 border border-stone-200">Unverified</span>}
                        <span className="text-xs text-stone-400">{order.createdAt}</span>
                      </div>
                      <div className="text-xs text-stone-600">Buyer: <strong>{order.buyerName}</strong> ({order.buyerPhone}) · {order.buyerEmail}</div>
                      {order.paymentRef && <div className="text-[11px] text-stone-400">Payment ref: {order.paymentRef}</div>}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[11px] uppercase font-bold tracking-wider text-stone-400">Total Settlement</div>
                        <div className="text-xl font-bold text-stone-900 tabular-nums">{formatPrice({ priceNGN: order.totalNGN, priceUSD: order.totalUSD })}</div>
                      </div>
                      <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900">
                        <option>Pending Verification</option><option>Weaving / Preparing</option><option>Shipped</option><option>Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
                    <div className="lg:col-span-6 space-y-3">
                      <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px]">Ordered Wrappers</div>
                      {order.items.map(item => (
                        <div key={item.cloth.id} className="flex items-center gap-4 p-4 bg-stone-50/80 rounded-2xl border border-stone-200/60">
                          <img src={item.cloth.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover bg-stone-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif-display text-base font-bold text-stone-900 truncate">{item.cloth.title}</h4>
                            <p className="text-stone-500 text-xs">Woven by {item.cloth.producerName} · Qty: {item.quantity}</p>
                            {item.customNote && <p className="text-amber-900 italic mt-1 text-xs">Note: "{item.customNote}"</p>}
                          </div>
                          <span className="font-bold text-stone-900 text-sm tabular-nums">{formatPrice(item.cloth)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="lg:col-span-6 space-y-3">
                      <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px]">Payment, Courier & Payout</div>
                      <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/60 space-y-3">
                        <div><span className="text-stone-500 block text-[11px]">Destination:</span><span className="font-medium text-stone-900 text-xs sm:text-sm">{order.deliveryAddress}</span></div>
                        <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                          <Truck className="w-4 h-4 text-stone-500 shrink-0" />
                          <span className="text-stone-600 font-medium">Waybill:</span>
                          <input type="text" defaultValue={order.loomNote || ''} placeholder="e.g. GIG Logistics #8921"
                            onBlur={e => updateOrder(order.id, { loomNote: e.target.value })}
                            className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-stone-900" />
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-200">
                          <span className="text-stone-500">{order.paymentMethod}</span>
                          {!order.paymentVerified && (
                            <button onClick={() => updateOrder(order.id, { paymentVerified: true })} className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-3 py-1.5 rounded-lg">Mark Paid</button>
                          )}
                        </div>
                        <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                          <span className="text-stone-500">Weaver payout</span>
                          {order.payoutReleased
                            ? <span className="text-emerald-700 font-bold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Released</span>
                            : <button onClick={() => handleReleasePayout(order.id)} className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-xl shadow-2xs">Release Payout</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && <Empty />}
            </div>
          </div>
        )}

        {/* TAB: WEAVERS */}
        {activeTab === 'weavers' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Master Weavers & Applications</h1>
                <p className="mt-1 text-sm text-stone-600">Approve new applicants, manage artisan profiles, and act on their behalf.</p>
              </div>
              <button onClick={() => setShowAddWeaver(true)} className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Register Weaver
              </button>
            </div>

            {/* Pending applications */}
            {pendingApplications.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 space-y-4">
                <h3 className="font-serif-display text-lg font-bold text-amber-900 flex items-center gap-2"><Hourglass className="w-5 h-5" /> Pending Applications ({pendingApplications.length})</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingApplications.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-amber-200 p-4 flex items-center gap-4">
                      <img src={p.avatarUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 truncate">{p.name}</h4>
                        <p className="text-[11px] text-stone-500 truncate">{p.village.split(',')[0]} · {p.specialtyMotif}</p>
                        {p.email && <p className="text-[11px] text-stone-400 truncate">{p.email}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => handleApprove(p)} className="bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> Approve</button>
                        <button onClick={() => handleSuspend(p)} className="bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {producers.map(producer => {
                const weaverCloths = cloths.filter(c => c.producerId === producer.id);
                const isCurrentProxy = adminActingAsProducerId === producer.id;
                const st = producer.status ?? 'active';
                return (
                  <div key={producer.id} className={`bg-white rounded-3xl border p-7 flex flex-col justify-between transition-all ${isCurrentProxy ? 'border-amber-900 ring-2 ring-amber-900/20 shadow-md' : 'border-stone-200/80 shadow-xs hover:shadow-md'}`}>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <img src={producer.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-200 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif-display text-xl font-bold text-stone-900 truncate">{producer.name}</h3>
                          <p className="text-xs text-amber-950 font-semibold mt-0.5">{producer.nativeTitle}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${st === 'active' ? 'bg-emerald-50 text-emerald-700' : st === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-red-700'}`}>{st}</span>
                            {isCurrentProxy && <span className="bg-amber-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PROXY</span>}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-stone-600 bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                        <div><strong>Motif:</strong> {producer.specialtyMotif}</div>
                        <div><strong>Line:</strong> {producer.phone}</div>
                        <div><strong>Pieces:</strong> {weaverCloths.length} wrappers</div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-stone-100 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSelectProxyWeaver(producer.id)} className={`flex-1 py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 ${isCurrentProxy ? 'bg-amber-950 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'}`}>
                          <UserCheck className="w-4 h-4" /> {isCurrentProxy ? 'Proxy Active' : 'Act on Behalf'}
                        </button>
                        <button onClick={() => setEditingWeaver(producer)} className="p-2.5 hover:bg-stone-100 text-stone-600 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteProducer(producer.id)} className="p-2.5 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center gap-2">
                        {st !== 'active' && <button onClick={() => handleApprove(producer)} className="flex-1 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold">Approve</button>}
                        {st === 'active' && <button onClick={() => handleSuspend(producer)} className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 font-semibold">Suspend</button>}
                        <button onClick={() => handleOpenWeaverConsole(producer.id)} className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center justify-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Studio</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: CATALOG */}
        {activeTab === 'cloths' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Cloth Inventory & Catalog</h1>
                <p className="mt-1 text-sm text-stone-600">Manage inventory, pricing, motif symbolism, and publish finished wrappers.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type="text" placeholder="Search title, motif, weaver..." value={searchCloths} onChange={e => setSearchCloths(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 shadow-2xs" />
                </div>
                <button onClick={openAddCloth} className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs shrink-0">
                  <Plus className="w-4 h-4" /> List New
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCloths.map(cloth => (
                <div key={cloth.id} className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-4/3 bg-stone-100">
                      <img src={cloth.imageUrl} alt="" className="w-full h-full object-cover object-center" />
                      <div className="absolute top-3.5 left-3.5 bg-stone-900/80 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">{cloth.category}</div>
                      {!cloth.inStock && <div className="absolute top-3.5 right-3.5 bg-stone-700/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">Out</div>}
                    </div>
                    <div className="p-6 space-y-2.5">
                      <div className="text-xs text-stone-500 font-medium">Woven by <strong>{cloth.producerName}</strong></div>
                      <h3 className="font-serif-display text-xl font-bold text-stone-900 leading-snug">{cloth.title}</h3>
                      <div className="text-xs text-stone-600 line-clamp-2">{cloth.motifName} · {cloth.dimensions}</div>
                      <div className="text-lg font-bold text-stone-900 pt-2 tabular-nums">{formatPrice(cloth)} <span className="text-xs text-stone-400 font-normal">· {cloth.stockCount} in stock</span></div>
                    </div>
                  </div>
                  <div className="p-5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button onClick={() => setActiveClothModal(cloth)} className="font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Preview</button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingCloth(cloth)} className="p-2 hover:bg-stone-200 rounded-lg text-stone-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteCloth(cloth.id)} className="p-2 hover:bg-red-100 rounded-lg text-stone-400 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Customers & Patrons</h1>
              <p className="mt-1 text-sm text-stone-600">Buyers ranked by lifetime value across all orders.</p>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="text-left font-bold px-5 py-3">Customer</th>
                    <th className="text-left font-bold px-5 py-3 hidden sm:table-cell">Contact</th>
                    <th className="text-right font-bold px-5 py-3">Orders</th>
                    <th className="text-right font-bold px-5 py-3">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c, i) => (
                    <tr key={i} className="hover:bg-stone-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-900 text-white flex items-center justify-center font-bold text-xs shrink-0">{c.name.charAt(0)}</div>
                          <span className="font-semibold text-stone-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500 hidden sm:table-cell">{c.email}<br />{c.phone}</td>
                      <td className="px-5 py-3 text-right font-bold text-stone-900 tabular-nums">{c.orders}</td>
                      <td className="px-5 py-3 text-right font-bold text-stone-900 tabular-nums">{formatPrice({ priceNGN: c.totalNGN, priceUSD: c.totalUSD })}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-stone-400">No customers yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: COMMISSIONS */}
        {activeTab === 'commissions' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Custom Loom Commissions</h1>
              <p className="mt-1 text-sm text-stone-600">Oversee bridal & chieftaincy commissions, reassign weavers, update progress.</p>
            </div>
            <div className="space-y-6">
              {commissions.map(comm => (
                <div key={comm.id} className="bg-white rounded-3xl border border-stone-200/90 p-7 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-stone-900">{comm.id}</span>
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">{comm.status}</span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">Client: <strong>{comm.buyerName}</strong> ({comm.buyerContact}) · {comm.occasion} (Target: {comm.targetDate})</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-stone-500 font-medium">Weaver:</label>
                      <select value={comm.producerId} onChange={e => reassignCommission(comm.id, e.target.value)}
                        className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none">
                        {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs bg-stone-50/80 p-5 rounded-2xl border border-stone-100">
                    <div><span className="text-stone-500 block text-[11px]">Motif:</span><span className="font-semibold text-stone-900 text-sm">{comm.desiredMotif}</span></div>
                    <div><span className="text-stone-500 block text-[11px]">Palette:</span><span className="font-semibold text-stone-900 text-sm">{comm.colors}</span></div>
                    <div><span className="text-stone-500 block text-[11px]">Budget:</span><span className="font-bold text-stone-900 text-sm">₦{comm.estimatedBudgetNGN?.toLocaleString()}</span></div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-xs">
                    <span className="text-stone-500 font-medium whitespace-nowrap">Loom Note:</span>
                    <input type="text" placeholder="e.g. Warp threads stretched; dyeing ochre wefts today." value={commissionNoteInput[comm.id] || ''}
                      onChange={e => setCommissionNoteInput({ ...commissionNoteInput, [comm.id]: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 focus:outline-none" />
                    <button onClick={() => { const note = commissionNoteInput[comm.id]; if (note) { updateCommission(comm.id, { weaverProgressNote: note, status: 'Loom Warped' }); setCommissionNoteInput(prev => ({ ...prev, [comm.id]: '' })); } }}
                      className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl font-semibold shrink-0">Publish</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Buyer Inquiries & Proxy Messaging</h1>
              <p className="mt-1 text-sm text-stone-600">Reply to buyers on behalf of elder master weavers.</p>
            </div>
            <div className="space-y-6">
              {messages.map(msg => {
                const targetProducer = producers.find(p => p.id === msg.receiverId) || currentProxyWeaver;
                return (
                  <div key={msg.id} className="bg-white rounded-3xl border border-stone-200/90 p-7 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                      <div><span className="font-bold text-stone-900 text-sm">{msg.senderName}</span><span className="text-stone-400 ml-2">→ {targetProducer.name}</span></div>
                      <span className="text-stone-400">{msg.timestamp}</span>
                    </div>
                    <div className="p-4 bg-stone-50/80 rounded-2xl text-xs text-stone-800 leading-relaxed">{msg.text}</div>
                    <div className="flex items-center gap-3 pt-2">
                      <input type="text" placeholder={`Reply to ${msg.senderName} on behalf of ${targetProducer.name}...`} value={replyText[msg.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                        className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-stone-900" />
                      <button onClick={() => handleSendReply(msg)} className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0"><Send className="w-3.5 h-3.5" /> Send</button>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && <Empty />}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-2xl">
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Cooperative Settings</h1>
              <p className="mt-1 text-sm text-stone-600">Exchange rate and escrow bank details used across the storefront.</p>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Exchange Rate (₦ per $1)</label>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={settings.ngnPerUsd} onChange={e => setRateDraft(e.target.value)}
                    className="w-48 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:border-stone-900" />
                  <span className="text-xs text-stone-500">Used to compute USD prices on new listings.</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Escrow Bank Details</label>
                <textarea rows={3} defaultValue={settings.bankDetails} onChange={e => setBankDraft(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900" />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    const { error } = await updateSettings({
                      ...(rateDraft ? { ngnPerUsd: Number(rateDraft) } : {}),
                      ...(bankDraft ? { bankDetails: bankDraft } : {}),
                    });
                    if (!error) toast.success('Cooperative settings saved.');
                  }}
                  className="bg-amber-950 hover:bg-amber-900 text-white text-xs font-semibold px-6 py-2.5 rounded-xl">Save Settings</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROXY */}
        {activeTab === 'proxy' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-stone-200">
              <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">Artisan Proxy Operations</h1>
              <p className="mt-1 text-sm text-stone-600">Publish and represent elder weavers who do not use smartphones.</p>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center gap-8">
              <img src={currentProxyWeaver.avatarUrl} alt="" className="w-36 h-36 rounded-3xl object-cover border-2 border-stone-300 shadow-sm shrink-0" />
              <div className="space-y-3 flex-1 text-center md:text-left">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">Active Elder Representation</span>
                <h2 className="font-serif-display text-3xl font-bold text-stone-900">{currentProxyWeaver.name}</h2>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">{currentProxyWeaver.bio}</p>
                <div className="flex flex-wrap items-center gap-3 pt-4 justify-center md:justify-start">
                  <button onClick={() => handleOpenWeaverConsole(currentProxyWeaver.id)} className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs"><ExternalLink className="w-4 h-4" /> Open Weaver Studio</button>
                  <button onClick={openAddCloth} className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs"><Plus className="w-4 h-4" /> List a Piece for Them</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Submodal: Add Weaver */}
      {showAddWeaver && (
        <Modal title="Register Master Weaver" onClose={() => setShowAddWeaver(false)}>
          <form onSubmit={handleCreateWeaver} className="space-y-4 text-xs">
            <Field label="Full Name"><input required value={weaverName} onChange={e => setWeaverName(e.target.value)} placeholder="e.g. Mama Beatrice Nwosu" className={inputCls} /></Field>
            <Field label="Native Title"><input value={weaverTitle} onChange={e => setWeaverTitle(e.target.value)} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Village"><input value={weaverVillage} onChange={e => setWeaverVillage(e.target.value)} className={inputCls} /></Field>
              <Field label="Years"><input type="number" value={weaverYears} onChange={e => setWeaverYears(Number(e.target.value))} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input value={weaverPhone} onChange={e => setWeaverPhone(e.target.value)} className={inputCls} /></Field>
              <Field label="WhatsApp"><input value={weaverWhatsapp} onChange={e => setWeaverWhatsapp(e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="Signature Motif"><input value={weaverMotif} onChange={e => setWeaverMotif(e.target.value)} className={inputCls} /></Field>
            <Field label="Bio"><textarea rows={3} value={weaverBio} onChange={e => setWeaverBio(e.target.value)} className={inputCls} /></Field>
            <ImageUploader value={weaverAvatarUrl} onChange={setWeaverAvatarUrl} folder="weavers" label="Portrait Photo" />
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddWeaver(false)} className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold">Cancel</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold">Save Weaver</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submodal: Edit Weaver */}
      {editingWeaver && (
        <Modal title={`Edit ${editingWeaver.name}`} onClose={() => setEditingWeaver(null)}>
          <form onSubmit={handleSaveWeaverEdit} className="space-y-4 text-xs">
            <Field label="Full Name"><input required value={editingWeaver.name} onChange={e => setEditingWeaver({ ...editingWeaver, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Native Title"><input value={editingWeaver.nativeTitle} onChange={e => setEditingWeaver({ ...editingWeaver, nativeTitle: e.target.value })} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Village"><input value={editingWeaver.village} onChange={e => setEditingWeaver({ ...editingWeaver, village: e.target.value })} className={inputCls} /></Field>
              <Field label="Years"><input type="number" value={editingWeaver.yearsOfExperience} onChange={e => setEditingWeaver({ ...editingWeaver, yearsOfExperience: Number(e.target.value) })} className={inputCls} /></Field>
            </div>
            <Field label="Signature Motif"><input value={editingWeaver.specialtyMotif} onChange={e => setEditingWeaver({ ...editingWeaver, specialtyMotif: e.target.value })} className={inputCls} /></Field>
            <Field label="Bio"><textarea rows={3} value={editingWeaver.bio} onChange={e => setEditingWeaver({ ...editingWeaver, bio: e.target.value })} className={inputCls} /></Field>
            <ImageUploader value={editingWeaver.avatarUrl} onChange={url => setEditingWeaver({ ...editingWeaver, avatarUrl: url })} folder="weavers" label="Portrait Photo" compact />
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingWeaver(null)} className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold">Cancel</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submodal: Add Cloth (full) */}
      {showAddCloth && (
        <Modal title="List New Akwete Cloth" onClose={() => setShowAddCloth(false)} wide>
          <form onSubmit={handleCreateCloth} className="space-y-4 text-xs">
            <Field label="Weaver Author">
              <select value={clothWeaverId} onChange={e => setClothWeaverId(e.target.value)} className={`${inputCls} font-semibold`}>
                {producers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.village.split(',')[0]})</option>)}
              </select>
            </Field>
            <ClothFields draft={clothDraft} setDraft={setClothDraft} usdFromNgn={usdFromNgn} />
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddCloth(false)} className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold">Cancel</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold">Publish to Catalog</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submodal: Edit Cloth (full) */}
      {editingCloth && (
        <Modal title={`Edit ${editingCloth.title}`} onClose={() => setEditingCloth(null)} wide>
          <form onSubmit={handleSaveClothEdit} className="space-y-4 text-xs">
            <ClothFields
              draft={editingCloth}
              setDraft={(upd) => setEditingCloth(prev => prev ? { ...prev, ...(typeof upd === 'function' ? upd(prev) : upd) } : prev)}
              usdFromNgn={usdFromNgn}
            />
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingCloth(null)} className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold">Cancel</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ── Shared presentational helpers ────────────────────────────
const inputCls = 'w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900';

const KpiTile: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string; tone?: 'emerald' | 'default' }> = ({ icon, label, value, hint, tone }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
    <div className="flex items-center gap-1.5 text-stone-400 mb-1">{icon}<span className="text-[10px] uppercase font-bold tracking-wider">{label}</span></div>
    <div className={`font-bold text-lg sm:text-xl tabular-nums ${tone === 'emerald' ? 'text-emerald-800' : 'text-stone-900'}`}>{value}</div>
    {hint && <span className="text-[11px] text-stone-500">{hint}</span>}
  </div>
);

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs">
    <h3 className="font-serif-display text-lg font-bold text-stone-900 mb-2">{title}</h3>
    {children}
  </div>
);

const Empty: React.FC = () => <p className="text-xs text-stone-400 py-6 text-center">Nothing here yet.</p>;

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><label className="block font-semibold text-stone-700 mb-1">{label}</label>{children}</div>
);

const Modal: React.FC<{ title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }> = ({ title, onClose, wide, children }) => (
  <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div className={`bg-white rounded-3xl ${wide ? 'max-w-xl' : 'max-w-lg'} w-full p-8 space-y-6 shadow-2xl border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-150`}>
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="font-serif-display text-xl font-bold text-stone-900">{title}</h3>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-900"><X className="w-5 h-5" /></button>
      </div>
      {children}
    </div>
  </div>
);

// Full cloth field set shared by Add + Edit
const MOTIFS = ['Ikaki (Royal Tortoise)', 'Ochi (Bridal Joy & Diamonds)', 'Agwa Eze (King\'s Striped Python)', 'Ebe Nze (Sacred Stool of Authority)', 'Kpakpando (Morning Star)', 'Ahia (Market Prosperity)'];
const ClothFields: React.FC<{
  draft: Partial<AkweteCloth>;
  setDraft: (upd: Partial<AkweteCloth> | ((prev: Partial<AkweteCloth>) => Partial<AkweteCloth>)) => void;
  usdFromNgn: (n: number) => number;
}> = ({ draft, setDraft, usdFromNgn }) => {
  const set = (patch: Partial<AkweteCloth>) => setDraft(prev => ({ ...prev, ...patch }));
  return (
    <>
      <Field label="Cloth Title"><input required value={draft.title || ''} onChange={e => set({ title: e.target.value })} className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Igbo Name"><input value={draft.igboName || ''} onChange={e => set({ igboName: e.target.value })} className={inputCls} /></Field>
        <Field label="Motif">
          <select value={draft.motifName} onChange={e => set({ motifName: e.target.value })} className={inputCls}>{MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}</select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Category">
          <select value={draft.category} onChange={e => set({ category: e.target.value as AkweteCloth['category'] })} className={inputCls}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </Field>
        <Field label="Price (₦)"><input type="number" value={draft.priceNGN ?? 0} onChange={e => set({ priceNGN: Number(e.target.value) })} className={`${inputCls} font-bold`} /></Field>
        <Field label="Stock"><input type="number" value={draft.stockCount ?? 1} onChange={e => set({ stockCount: Number(e.target.value), inStock: Number(e.target.value) > 0 })} className={inputCls} /></Field>
      </div>
      <p className="text-[11px] text-stone-400 -mt-2">≈ ${usdFromNgn(Number(draft.priceNGN) || 0).toLocaleString()} at current rate</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Dimensions"><input value={draft.dimensions || ''} onChange={e => set({ dimensions: e.target.value })} className={inputCls} /></Field>
        <Field label="Days on Loom"><input type="number" value={draft.weaveTimeDays ?? 21} onChange={e => set({ weaveTimeDays: Number(e.target.value) })} className={inputCls} /></Field>
      </div>
      <Field label="Materials"><input value={draft.materials || ''} onChange={e => set({ materials: e.target.value })} className={inputCls} /></Field>
      <Field label="Colors (comma separated)"><input value={(draft.colors || []).join(', ')} onChange={e => set({ colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className={inputCls} /></Field>
      <Field label="Cultural Occasion"><input value={draft.culturalOccasion || ''} onChange={e => set({ culturalOccasion: e.target.value })} className={inputCls} /></Field>
      <Field label="Motif Symbolism"><textarea rows={2} value={draft.motifSymbolism || ''} onChange={e => set({ motifSymbolism: e.target.value })} className={inputCls} /></Field>
      <Field label="Description"><textarea rows={3} value={draft.description || ''} onChange={e => set({ description: e.target.value })} className={inputCls} /></Field>
      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
        <input type="checkbox" checked={draft.inStock ?? true} onChange={e => set({ inStock: e.target.checked })} className="accent-amber-900 w-4 h-4" /> Available in stock
      </label>
      <ImageUploader value={draft.imageUrl || ''} onChange={url => set({ imageUrl: url })} folder="cloths" label="Primary image" />
      <ImageUploader value={draft.secondaryImageUrl || ''} onChange={url => set({ secondaryImageUrl: url })} folder="cloths" label="Secondary image (optional)" compact />
    </>
  );
};
