import React, { useState } from 'react';
import {
  X, Store, Package, Plus, Edit2, Trash2, Eye, Send, Truck, CheckCircle, Clock,
  UserCheck, TrendingUp, DollarSign, AlertTriangle, ShieldCheck, Hourglass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageUploader } from './ImageUploader';
import { AkweteCloth, Order, CustomCommission, Producer } from '../types';

type Tab = 'overview' | 'catalog' | 'orders' | 'commissions' | 'messages' | 'profile';

const MOTIFS = [
  'Ikaki (Royal Tortoise)',
  'Ochi (Bridal Joy & Diamonds)',
  'Agwa Eze (King\'s Striped Python)',
  'Ebe Nze (Sacred Stool of Authority)',
  'Kpakpando (Morning Star)',
  'Ahia (Market Prosperity)',
];
const CATEGORIES: AkweteCloth['category'][] = ['Royal', 'Bridal', 'Ceremonial', 'Contemporary', 'Wall Tapestry'];

const emptyDraft = (): Partial<AkweteCloth> => ({
  title: '',
  igboName: '',
  motifName: 'Ikaki (Royal Tortoise)',
  motifSymbolism: 'Symbol of royal dignity, ancestral wisdom, and female strength.',
  priceNGN: 150000,
  dimensions: '48 x 76 inches (Double Wrapper Set)',
  materials: 'Hand-spun combed cotton with golden silk weft',
  weaveTimeDays: 21,
  category: 'Royal',
  culturalOccasion: 'Chieftaincy & Traditional Ceremonies',
  colors: ['Deep Indigo', 'Loom Gold', 'Ivory'],
  description: '',
  imageUrl: '/images/akwaete_hero_cloth_1790722114411.jpg',
  secondaryImageUrl: '',
  inStock: true,
  stockCount: 1,
});

export const ProducerConsole: React.FC = () => {
  const {
    setIsProducerConsoleOpen,
    user,
    producers,
    cloths, addNewCloth, updateCloth, deleteCloth,
    orders, updateOrder, updateOrderStatus,
    commissions, updateCommission,
    messages, sendMessage, sendMessageOnBehalfOfProducer,
    updateProducer,
    formatPrice, usdFromNgn,
    adminActingAsProducerId, actOnBehalfOfProducer, exitProxyMode,
    setIsAdminOpen,
    loginAsBuyer,
    setActiveClothModal,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [draft, setDraft] = useState<Partial<AkweteCloth>>(emptyDraft());
  const [showClothForm, setShowClothForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState<Record<string, string>>({});
  const [commNote, setCommNote] = useState<Record<string, string>>({});
  const [reply, setReply] = useState<Record<string, string>>({});
  const [profileDraft, setProfileDraft] = useState<Partial<Producer>>({});

  const isProxy = !!adminActingAsProducerId;
  const currentProducer = producers.find(
    p => p.id === (adminActingAsProducerId || user?.producerId)
  ) || producers[0];

  if (!currentProducer) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <h1 className="font-serif-display text-2xl font-bold text-stone-900">No weaver profile found</h1>
          <button onClick={() => setIsProducerConsoleOpen(false)} className="text-sm text-amber-900 underline">Return to storefront</button>
        </div>
      </div>
    );
  }

  const status = currentProducer.status ?? 'active';
  const isPending = status === 'pending';
  const isSuspended = status === 'suspended';
  const canPublish = status === 'active';

  const myCloths = cloths.filter(c => c.producerId === currentProducer.id);
  const myOrders = orders.filter(o =>
    o.producerNames.includes(currentProducer.name) ||
    o.items.some(i => i.cloth.producerId === currentProducer.id)
  );
  const myCommissions = commissions.filter(c => c.producerId === currentProducer.id);
  const myMessages = messages.filter(m =>
    m.receiverId === currentProducer.id ||
    m.senderId === currentProducer.id ||
    m.receiverName.includes(currentProducer.name)
  );

  // KPIs — revenue counts only this weaver's line-items where possible
  const myRevenueNGN = myOrders.reduce((sum, o) => {
    const mine = o.items.filter(i => i.cloth.producerId === currentProducer.id);
    if (mine.length) return sum + mine.reduce((s, i) => s + i.cloth.priceNGN * i.quantity, 0);
    return sum + o.totalNGN; // fallback when items aren't itemized
  }, 0);
  const pendingPayoutNGN = myOrders.filter(o => !o.payoutReleased).reduce((s, o) => s + o.totalNGN, 0);
  const openOrders = myOrders.filter(o => o.status !== 'Delivered').length;
  const lowStock = myCloths.filter(c => !c.inStock || c.stockCount <= 1);

  // ── Handlers ───────────────────────────────────────────────
  const openAdd = () => { setDraft(emptyDraft()); setEditingId(null); setShowClothForm(true); };
  const openEdit = (c: AkweteCloth) => { setDraft({ ...c }); setEditingId(c.id); setShowClothForm(true); };

  const submitCloth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title) return;
    const priceNGN = Number(draft.priceNGN) || 0;
    const payload = {
      title: draft.title!,
      igboName: draft.igboName || draft.title!,
      motifName: draft.motifName || 'Ikaki (Royal Tortoise)',
      motifSymbolism: draft.motifSymbolism || '',
      producerId: currentProducer.id,
      producerName: currentProducer.name,
      producerAvatar: currentProducer.avatarUrl,
      priceNGN,
      priceUSD: usdFromNgn(priceNGN),
      imageUrl: draft.imageUrl || '/images/akwaete_hero_cloth_1790722114411.jpg',
      secondaryImageUrl: draft.secondaryImageUrl || undefined,
      dimensions: draft.dimensions || '',
      materials: draft.materials || '',
      weaveTimeDays: Number(draft.weaveTimeDays) || 21,
      colors: draft.colors || [],
      category: (draft.category || 'Royal') as AkweteCloth['category'],
      inStock: draft.inStock ?? true,
      stockCount: Number(draft.stockCount) || 1,
      description: draft.description || `Authentic Akwete cloth handwoven by ${currentProducer.name}.`,
      culturalOccasion: draft.culturalOccasion || '',
      weightGrams: 1100,
      loomType: currentProducer.loomType,
    };
    if (editingId) updateCloth(editingId, payload);
    else addNewCloth(payload);
    setShowClothForm(false);
    setActiveTab('catalog');
  };

  const sendReply = (buyerId: string, buyerName: string, msgId: string, clothId?: string, clothTitle?: string) => {
    const text = reply[msgId]?.trim();
    if (!text) return;
    if (isProxy) sendMessageOnBehalfOfProducer(currentProducer.id, buyerId, buyerName, text, clothId, clothTitle);
    else sendMessage(buyerId, buyerName, text, clothId, clothTitle);
    setReply(prev => ({ ...prev, [msgId]: '' }));
  };

  const saveProfile = () => {
    if (Object.keys(profileDraft).length) updateProducer(currentProducer.id, profileDraft);
    setProfileDraft({});
  };
  const pf = (field: keyof Producer) =>
    (profileDraft[field] ?? currentProducer[field] ?? '') as string | number;

  const statusBadge = (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
      canPublish ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : isPending ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {canPublish ? 'Approved' : isPending ? 'Pending review' : 'Suspended'}
    </span>
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'catalog', label: 'My Catalog', count: myCloths.length },
    { id: 'orders', label: 'Orders', count: myOrders.length },
    { id: 'commissions', label: 'Commissions', count: myCommissions.length },
    { id: 'messages', label: 'Inquiries', count: myMessages.length },
    { id: 'profile', label: 'My Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col">

      {/* Proxy banner (admin acting on behalf) */}
      {isProxy && (
        <div className="bg-amber-950 text-white px-4 sm:px-8 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-semibold text-stone-200">Admin acting as weaver:</span>
            <select
              value={currentProducer.id}
              onChange={e => actOnBehalfOfProducer(e.target.value)}
              className="bg-stone-800 border border-stone-600 rounded px-2 py-0.5 text-xs text-white font-bold"
            >
              {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setIsProducerConsoleOpen(false); setIsAdminOpen(true); }}
            className="text-stone-300 hover:text-white underline text-[11px]"
          >
            Return to Admin Panel
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-serif-display text-xl font-bold tracking-tight text-stone-900 truncate">Akwete Luxe</span>
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                Weaver Studio
              </span>
            </div>

            <nav className="hidden md:flex items-center bg-stone-100/80 p-1 rounded-xl border border-stone-200/60 text-xs">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === t.id ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 rounded-full bg-stone-200 text-stone-700">{t.count}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {canPublish && (
                <button
                  onClick={openAdd}
                  className="hidden sm:inline-flex items-center gap-1 bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> List Piece
                </button>
              )}
              <button
                onClick={() => { loginAsBuyer(); setIsProducerConsoleOpen(false); }}
                className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Buyer View
              </button>
              <button
                onClick={() => setIsProducerConsoleOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Store className="w-3.5 h-3.5" /> Storefront
              </button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-100 text-xs scrollbar-none">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium ${activeTab === t.id ? 'bg-stone-900 text-white' : 'text-stone-600 bg-stone-100'}`}
              >
                {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Identity + status strip */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4 min-w-0">
            <img src={currentProducer.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif-display text-2xl font-bold text-stone-900 truncate">{currentProducer.name}</h1>
                {statusBadge}
              </div>
              <p className="text-xs text-stone-500">{currentProducer.nativeTitle} · {currentProducer.village.split(',')[0]}</p>
            </div>
          </div>
          {currentProducer.isGuildCertified && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shrink-0">
              <ShieldCheck className="w-4 h-4" /> Guild Certified
            </div>
          )}
        </div>

        {/* Pending / suspended gate banner */}
        {!canPublish && (
          <div className={`rounded-3xl border p-6 flex items-start gap-4 ${isPending ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            {isPending ? <Hourglass className="w-6 h-6 text-amber-700 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />}
            <div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                {isPending ? 'Your weaver application is under review' : 'Your weaver account is suspended'}
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl">
                {isPending
                  ? 'The Akwete Weavers Cooperative is reviewing your application. You can prepare your profile now, but listing cloths unlocks once an admin approves you.'
                  : 'Publishing is paused. Please contact the cooperative secretariat to restore your account.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatTile icon={<DollarSign className="w-4 h-4" />} label="My Revenue" value={formatPrice({ priceNGN: myRevenueNGN, priceUSD: usdFromNgn(myRevenueNGN) })} hint="From matched orders" tone="emerald" />
              <StatTile icon={<Clock className="w-4 h-4" />} label="Pending Payout" value={formatPrice({ priceNGN: pendingPayoutNGN, priceUSD: usdFromNgn(pendingPayoutNGN) })} hint="Awaiting release" />
              <StatTile icon={<Package className="w-4 h-4" />} label="Pieces Listed" value={`${myCloths.length}`} hint={`${lowStock.length} low / out of stock`} />
              <StatTile icon={<TrendingUp className="w-4 h-4" />} label="Open Orders" value={`${openOrders}`} hint={`${myOrders.length} total`} />
            </div>

            {/* Order status breakdown */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs">
              <h3 className="font-serif-display text-lg font-bold text-stone-900 mb-4">Order Pipeline</h3>
              <div className="space-y-3">
                {(['Pending Verification', 'Weaving / Preparing', 'Shipped', 'Delivered'] as Order['status'][]).map(s => {
                  const n = myOrders.filter(o => o.status === s).length;
                  const pct = myOrders.length ? Math.round((n / myOrders.length) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-3 text-xs">
                      <span className="w-40 shrink-0 text-stone-600">{s}</span>
                      <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-900 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right font-bold text-stone-900 tabular-nums">{n}</span>
                    </div>
                  );
                })}
                {myOrders.length === 0 && <p className="text-xs text-stone-400">No orders yet.</p>}
              </div>
            </div>

            {lowStock.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs">
                <h3 className="font-serif-display text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" /> Low / Out of Stock
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {lowStock.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <img src={c.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-stone-500">{c.inStock ? `${c.stockCount} left` : 'Out of stock'}</p>
                      </div>
                      <button onClick={() => openEdit(c)} className="text-[11px] text-amber-900 font-semibold hover:underline">Restock</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-display text-2xl font-bold text-stone-900">My Catalog</h2>
                <p className="text-sm text-stone-600">Publish, edit, and manage stock for your handwoven pieces.</p>
              </div>
              {canPublish && (
                <button onClick={openAdd} className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                  <Plus className="w-4 h-4" /> List New Cloth
                </button>
              )}
            </div>

            {myCloths.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-sm bg-white rounded-3xl border border-stone-200/80">
                No cloths listed yet. {canPublish ? 'Click “List New Cloth” to publish your first piece.' : 'Your catalog unlocks after approval.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCloths.map(c => (
                  <div key={c.id} className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                    <div className="relative aspect-4/3 bg-stone-100">
                      <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-stone-900/80 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">{c.category}</div>
                      <button
                        onClick={() => updateCloth(c.id, { inStock: !c.inStock })}
                        className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}
                      >
                        {c.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>
                    <div className="p-5 space-y-2 flex-1">
                      <h3 className="font-serif-display text-lg font-bold text-stone-900 leading-snug">{c.title}</h3>
                      <p className="text-xs text-stone-500">{c.motifName}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="text-[11px] text-stone-500">₦</label>
                        <input
                          type="number" defaultValue={c.priceNGN}
                          onBlur={e => { const v = Number(e.target.value); if (v && v !== c.priceNGN) updateCloth(c.id, { priceNGN: v, priceUSD: usdFromNgn(v) }); }}
                          className="w-28 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                        />
                        <label className="text-[11px] text-stone-500 ml-auto">Qty</label>
                        <input
                          type="number" defaultValue={c.stockCount}
                          onBlur={e => { const v = Number(e.target.value); if (v !== c.stockCount) updateCloth(c.id, { stockCount: v, inStock: v > 0 }); }}
                          className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
                      <button onClick={() => setActiveClothModal(c)} className="font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-2 hover:bg-stone-200 rounded-lg text-stone-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteCloth(c.id)} className="p-2 hover:bg-red-100 rounded-lg text-stone-400 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">Incoming Orders</h2>
              <p className="text-sm text-stone-600">Update progress and dispatch status for orders containing your pieces.</p>
            </div>
            {myOrders.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-sm bg-white rounded-3xl border border-stone-200/80">No orders awaiting fulfilment.</div>
            ) : myOrders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">{order.id}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800'
                        : order.status === 'Weaving / Preparing' ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-700'}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">Buyer: {order.buyerName} · {order.buyerPhone}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option>Pending Verification</option>
                    <option>Weaving / Preparing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <p><span className="text-stone-400">Deliver to:</span> {order.deliveryAddress}</p>
                  {order.loomNote && <p className="text-amber-900"><span className="text-stone-400">Loom note:</span> {order.loomNote}</p>}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <Truck className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    placeholder="Add a loom/progress note for the buyer…"
                    value={orderNote[order.id] || ''}
                    onChange={e => setOrderNote(p => ({ ...p, [order.id]: e.target.value }))}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                  />
                  <button
                    onClick={() => { const n = orderNote[order.id]; if (n) { updateOrder(order.id, { loomNote: n }); setOrderNote(p => ({ ...p, [order.id]: '' })); } }}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shrink-0"
                  >Update</button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                  <span className="font-bold text-stone-900">Order total: {formatPrice({ priceNGN: order.totalNGN, priceUSD: order.totalUSD })}</span>
                  {order.payoutReleased
                    ? <span className="text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Payout released</span>
                    : <span className="text-stone-400">Payout pending (released by cooperative)</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: COMMISSIONS */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">Custom Commissions</h2>
              <p className="text-sm text-stone-600">Bespoke bridal & chieftaincy weaves assigned to you.</p>
            </div>
            {myCommissions.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-sm bg-white rounded-3xl border border-stone-200/80">No commissions assigned to you yet.</div>
            ) : myCommissions.map((comm: CustomCommission) => (
              <div key={comm.id} className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="font-mono font-bold text-stone-900">{comm.id}</span>
                    <p className="text-xs text-stone-500 mt-0.5">{comm.buyerName} · {comm.occasion} · Target {comm.targetDate}</p>
                  </div>
                  <select
                    value={comm.status}
                    onChange={e => updateCommission(comm.id, { status: e.target.value as CustomCommission['status'] })}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option>Requested</option><option>In Discussion</option><option>Loom Warped</option><option>Completed</option>
                  </select>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 text-xs bg-stone-50/80 p-4 rounded-2xl">
                  <div><span className="text-stone-400 block">Motif</span><span className="font-semibold text-stone-900">{comm.desiredMotif}</span></div>
                  <div><span className="text-stone-400 block">Colors</span><span className="font-semibold text-stone-900">{comm.colors}</span></div>
                  <div><span className="text-stone-400 block">Budget</span><span className="font-bold text-stone-900">₦{comm.estimatedBudgetNGN?.toLocaleString()}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Progress note for the buyer…"
                    value={commNote[comm.id] || ''}
                    onChange={e => setCommNote(p => ({ ...p, [comm.id]: e.target.value }))}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                  />
                  <button
                    onClick={() => { const n = commNote[comm.id]; if (n) { updateCommission(comm.id, { weaverProgressNote: n }); setCommNote(p => ({ ...p, [comm.id]: '' })); } }}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shrink-0"
                  >Publish Note</button>
                </div>
                {comm.weaverProgressNote && <p className="text-xs text-amber-900">Latest: {comm.weaverProgressNote}</p>}
              </div>
            ))}
          </div>
        )}

        {/* TAB: INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">Buyer Inquiries</h2>
              <p className="text-sm text-stone-600">Reply to prospective buyers about your pieces.</p>
            </div>
            {myMessages.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-sm bg-white rounded-3xl border border-stone-200/80">No inquiries yet.</div>
            ) : myMessages.map(msg => {
              const fromMe = msg.senderId === currentProducer.id;
              return (
                <div key={msg.id} className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100">
                    <span className="font-bold text-stone-900">{fromMe ? `You → ${msg.receiverName}` : msg.senderName}</span>
                    <span className="text-stone-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-stone-800 bg-stone-50/80 rounded-2xl p-3 leading-relaxed">{msg.text}</p>
                  {!fromMe && (
                    <div className="flex items-center gap-2">
                      <input
                        placeholder={`Reply to ${msg.senderName}…`}
                        value={reply[msg.id] || ''}
                        onChange={e => setReply(p => ({ ...p, [msg.id]: e.target.value }))}
                        className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                      />
                      <button
                        onClick={() => sendReply(msg.senderId, msg.senderName, msg.id, msg.clothId, msg.clothTitle)}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
                      ><Send className="w-3.5 h-3.5" /> Reply</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">My Weaver Profile</h2>
              <p className="text-sm text-stone-600">This is what buyers see on your storefront page.</p>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-5">
              <ImageUploader
                value={(profileDraft.avatarUrl as string) ?? currentProducer.avatarUrl}
                onChange={url => setProfileDraft(p => ({ ...p, avatarUrl: url }))}
                folder="weavers" label="Portrait photo" compact
              />
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <Field label="Full Name"><input value={pf('name')} onChange={e => setProfileDraft(p => ({ ...p, name: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Native Title"><input value={pf('nativeTitle')} onChange={e => setProfileDraft(p => ({ ...p, nativeTitle: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Village"><input value={pf('village')} onChange={e => setProfileDraft(p => ({ ...p, village: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Years of Experience"><input type="number" value={pf('yearsOfExperience')} onChange={e => setProfileDraft(p => ({ ...p, yearsOfExperience: Number(e.target.value) }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Signature Motif"><input value={pf('specialtyMotif')} onChange={e => setProfileDraft(p => ({ ...p, specialtyMotif: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Loom Type"><input value={pf('loomType')} onChange={e => setProfileDraft(p => ({ ...p, loomType: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Phone"><input value={pf('phone')} onChange={e => setProfileDraft(p => ({ ...p, phone: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="WhatsApp"><input value={pf('whatsapp')} onChange={e => setProfileDraft(p => ({ ...p, whatsapp: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-900" /></Field>
              </div>
              <Field label="Bio"><textarea rows={3} value={pf('bio')} onChange={e => setProfileDraft(p => ({ ...p, bio: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900" /></Field>
              <Field label="Loom Quote"><input value={pf('quote')} onChange={e => setProfileDraft(p => ({ ...p, quote: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900" /></Field>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => { logout(); }} className="text-xs text-stone-500 hover:text-red-700">Sign out</button>
                <button
                  onClick={saveProfile}
                  disabled={Object.keys(profileDraft).length === 0}
                  className="bg-amber-950 hover:bg-amber-900 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl"
                >Save Profile</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cloth add/edit submodal */}
      {showClothForm && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-5 shadow-2xl border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-display text-xl font-bold text-stone-900">{editingId ? 'Edit Cloth' : 'List New Akwete Cloth'}</h3>
              <button onClick={() => setShowClothForm(false)} className="text-stone-400 hover:text-stone-900"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitCloth} className="space-y-4 text-xs">
              <Field label="Cloth Title">
                <input required value={draft.title || ''} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Royal Emerald Ikaki Double Wrapper" className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Igbo Name"><input value={draft.igboName || ''} onChange={e => setDraft(d => ({ ...d, igboName: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Motif">
                  <select value={draft.motifName} onChange={e => setDraft(d => ({ ...d, motifName: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900">
                    {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Category">
                  <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value as AkweteCloth['category'] }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Price (₦)"><input type="number" value={draft.priceNGN} onChange={e => setDraft(d => ({ ...d, priceNGN: Number(e.target.value) }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Stock"><input type="number" value={draft.stockCount} onChange={e => setDraft(d => ({ ...d, stockCount: Number(e.target.value) }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
              </div>
              <p className="text-[11px] text-stone-400 -mt-2">≈ ${usdFromNgn(Number(draft.priceNGN) || 0).toLocaleString()} at current cooperative rate</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dimensions"><input value={draft.dimensions || ''} onChange={e => setDraft(d => ({ ...d, dimensions: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
                <Field label="Days on Loom"><input type="number" value={draft.weaveTimeDays} onChange={e => setDraft(d => ({ ...d, weaveTimeDays: Number(e.target.value) }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
              </div>
              <Field label="Materials"><input value={draft.materials || ''} onChange={e => setDraft(d => ({ ...d, materials: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
              <Field label="Colors (comma separated)">
                <input value={(draft.colors || []).join(', ')} onChange={e => setDraft(d => ({ ...d, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" />
              </Field>
              <Field label="Cultural Occasion"><input value={draft.culturalOccasion || ''} onChange={e => setDraft(d => ({ ...d, culturalOccasion: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
              <Field label="Motif Symbolism"><textarea rows={2} value={draft.motifSymbolism || ''} onChange={e => setDraft(d => ({ ...d, motifSymbolism: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
              <Field label="Description"><textarea rows={3} value={draft.description || ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-stone-900" /></Field>
              <ImageUploader value={draft.imageUrl || ''} onChange={url => setDraft(d => ({ ...d, imageUrl: url }))} folder="cloths" label="Primary cloth image" />
              <ImageUploader value={draft.secondaryImageUrl || ''} onChange={url => setDraft(d => ({ ...d, secondaryImageUrl: url }))} folder="cloths" label="Secondary image (optional)" compact />
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowClothForm(false)} className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-white font-semibold">{editingId ? 'Save Changes' : 'Publish to Storefront'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small presentational helpers ─────────────────────────────
const StatTile: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string; tone?: 'emerald' | 'default' }> = ({ icon, label, value, hint, tone }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
    <div className="flex items-center gap-1.5 text-stone-400 mb-1">
      {icon}
      <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
    </div>
    <div className={`font-bold text-lg sm:text-xl tabular-nums ${tone === 'emerald' ? 'text-emerald-800' : 'text-stone-900'}`}>{value}</div>
    {hint && <span className="text-[11px] text-stone-500">{hint}</span>}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block font-semibold text-stone-700 mb-1">{label}</label>
    {children}
  </div>
);
