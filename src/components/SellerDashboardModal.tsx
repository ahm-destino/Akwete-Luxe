import React, { useState } from 'react';
import { X, Plus, Package, MessageSquare, Check, Image as ImageIcon, Sparkles, LogOut, UserCheck, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SellerDashboardModal: React.FC = () => {
  const {
    isSellerDashboardOpen,
    setIsSellerDashboardOpen,
    user,
    producers,
    cloths,
    addNewCloth,
    orders,
    messages,
    logout,
    loginAsBuyer,
    formatPrice,
    adminActingAsProducerId,
    actOnBehalfOfProducer,
    setIsAdminOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'orders'>('inventory');

  // Form state for adding new cloth
  const [title, setTitle] = useState('');
  const [igboName, setIgboName] = useState('');
  const [motifName, setMotifName] = useState('Ikaki (Royal Tortoise)');
  const [motifSymbolism, setMotifSymbolism] = useState('');
  const [priceNGN, setPriceNGN] = useState<number>(175000);
  const [dimensions, setDimensions] = useState('48 x 76 inches (Double Wrapper Set)');
  const [materials, setMaterials] = useState('Hand-spun combed cotton with golden silk weft');
  const [weaveTimeDays, setWeaveTimeDays] = useState<number>(24);
  const [category, setCategory] = useState<'Bridal' | 'Royal' | 'Ceremonial' | 'Contemporary' | 'Wall Tapestry'>('Royal');
  const [culturalOccasion, setCulturalOccasion] = useState('Chieftaincy Investiture & Royal Ceremonies');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/akwaete_hero_cloth_1790722114411.jpg');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isSellerDashboardOpen) return null;

  const currentProducer = producers.find(
    p => p.id === (adminActingAsProducerId || user?.producerId)
  ) || producers[0];

  const myCloths = cloths.filter(c => c.producerId === currentProducer.id);
  const incomingOrders = orders.filter(o => o.producerNames.includes(currentProducer.name));

  const handleCreateCloth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addNewCloth({
      title,
      igboName: igboName || title,
      motifName,
      motifSymbolism: motifSymbolism || 'Symbolizes royal dignity, ancestral wisdom, and female strength.',
      producerId: currentProducer.id,
      producerName: currentProducer.name,
      producerAvatar: currentProducer.avatarUrl,
      priceNGN,
      priceUSD: Math.round(priceNGN / 1280),
      imageUrl,
      dimensions,
      materials,
      weaveTimeDays,
      colors: ['Deep Indigo', 'Raw Cream', 'Loom Gold'],
      category,
      inStock: true,
      stockCount: 1,
      description,
      culturalOccasion,
      weightGrams: 1100,
      loomType: currentProducer.loomType
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab('inventory');
      setTitle('');
      setIgboName('');
      setDescription('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsSellerDashboardOpen(false)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Admin Proxy Banner if applicable */}
        <div className="bg-amber-950 text-white px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-semibold text-stone-200">Admin Acting on Behalf of Weaver:</span>
            <select
              value={currentProducer.id}
              onChange={e => actOnBehalfOfProducer(e.target.value)}
              className="bg-stone-800 border border-stone-600 rounded px-2 py-0.5 text-xs text-white font-bold"
            >
              {producers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setIsAdminOpen(true);
              setIsSellerDashboardOpen(false);
            }}
            className="text-stone-300 hover:text-white underline text-[11px]"
          >
            Return to Admin Panel
          </button>
        </div>

        {/* Producer Banner */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentProducer.avatarUrl}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-2 border-stone-300"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-2xl font-bold text-stone-900 leading-tight">
                  {currentProducer.name}
                </h3>
                <span className="text-[11px] bg-amber-900 text-white font-semibold px-2 py-0.5 rounded">
                  Seller Studio
                </span>
              </div>
              <p className="text-xs text-stone-500">{currentProducer.village}, Abia State</p>
              <p className="text-xs text-amber-900 font-medium">{currentProducer.nativeTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loginAsBuyer();
                setIsSellerDashboardOpen(false);
              }}
              className="text-xs bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Switch to Buyer View
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'inventory'
                ? 'border-amber-950 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Her Catalog ({myCloths.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'add'
                ? 'border-amber-950 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Akwete Cloth</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'orders'
                ? 'border-amber-950 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Incoming Orders ({incomingOrders.length})</span>
          </button>
        </div>

        {/* Body View */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500">
                  Cloths cataloged under {currentProducer.name} in Akwete Town
                </span>
                <button
                  onClick={() => setActiveTab('add')}
                  className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cloth</span>
                </button>
              </div>

              {myCloths.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  No cloths published for this weaver yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myCloths.map(cloth => (
                    <div key={cloth.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex gap-3">
                      <img
                        src={cloth.imageUrl}
                        alt=""
                        className="w-16 h-16 rounded object-cover border border-stone-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{cloth.title}</h4>
                        <p className="text-[11px] text-stone-500">{cloth.motifName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-stone-900 tabular-nums">
                            {formatPrice(cloth)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cloth.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {cloth.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Add New Cloth */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateCloth} className="space-y-4">
              {isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Akwete Cloth successfully listed on behalf of {currentProducer.name}!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cloth Title (English Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Sovereign Adaobi Double Wrapper"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Igbo Traditional Name
                  </label>
                  <input
                    type="text"
                    value={igboName}
                    onChange={e => setIgboName(e.target.value)}
                    placeholder="e.g. Akwa Eze Nwanyị"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Traditional Motif
                  </label>
                  <select
                    value={motifName}
                    onChange={e => setMotifName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Ikaki (Royal Tortoise)">Ikaki (Royal Tortoise)</option>
                    <option value="Ochi (Bridal Joy & Diamonds)">Ochi (Bridal Joy)</option>
                    <option value="Agwa Eze (King's Striped Python)">Agwa Eze (Python Stripe)</option>
                    <option value="Ebe Nze (Sacred Stool of Authority)">Ebe Nze (Sacred Stool)</option>
                    <option value="Kpakpando (Morning Star)">Kpakpando (Morning Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Royal">Royal</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Ceremonial">Ceremonial</option>
                    <option value="Contemporary">Contemporary</option>
                    <option value="Wall Tapestry">Wall Tapestry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price in Naira (₦)
                  </label>
                  <input
                    type="number"
                    value={priceNGN}
                    onChange={e => setPriceNGN(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dimensions & Cut
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Days Woven on Loom
                  </label>
                  <input
                    type="number"
                    value={weaveTimeDays}
                    onChange={e => setWeaveTimeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Textile Photography
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { url: '/images/akwaete_hero_cloth_1790722114411.jpg', label: 'Classic Indigo & Ochre' },
                    { url: '/images/akwaete_cloth_royal_ikaki_1790722137276.jpg', label: 'Royal Ikaki Emerald' },
                    { url: '/images/akwaete_cloth_ochi_wedding_1790722147629.jpg', label: 'Bridal Crimson Ochi' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(item.url)}
                      className={`relative rounded-lg overflow-hidden border-2 text-left transition-all ${
                        imageUrl === item.url ? 'border-amber-900 ring-2 ring-amber-900/30' : 'border-stone-200'
                      }`}
                    >
                      <img src={item.url} alt="" className="w-full h-14 object-cover" />
                      <span className="block p-1 text-[10px] font-semibold text-stone-700 truncate">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Story & Cultural Meaning of this Weave
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailing the yarn tension, ceremonial significance, and loom setup..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Publish to Akwete Marketplace for {currentProducer.name}
              </button>
            </form>
          )}

          {/* TAB 3: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {incomingOrders.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  No orders currently awaiting fulfillment for {currentProducer.name}.
                </div>
              ) : (
                incomingOrders.map(order => (
                  <div key={order.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                      <div>
                        <span className="font-bold text-stone-900">{order.id}</span>
                        <span className="text-stone-400 ml-2">Buyer: {order.buyerName}</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-950">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      <p>
                        <span className="text-stone-400">Delivery Address:</span> {order.deliveryAddress}
                      </p>
                      <p>
                        <span className="text-stone-400">Buyer Phone:</span> {order.buyerPhone}
                      </p>
                      {order.loomNote && (
                        <p className="mt-1 text-amber-950 font-medium">
                          <span className="text-stone-400">Loom Status Note:</span> {order.loomNote}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-xs">
                      <span className="font-bold text-stone-900">
                        Total Payout: ₦{order.totalNGN.toLocaleString('en-NG')}
                      </span>
                      <span className="text-stone-400 text-[11px]">Direct Escrow Secured</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
