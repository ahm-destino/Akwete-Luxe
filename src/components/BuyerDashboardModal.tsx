import React, { useState } from 'react';
import { X, Package, Heart, Sparkles, MessageSquare, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BuyerDashboardModal: React.FC = () => {
  const {
    isBuyerDashboardOpen,
    setIsBuyerDashboardOpen,
    user,
    orders,
    commissions,
    favorites,
    cloths,
    setActiveClothModal,
    producers,
    setMessageTargetProducer,
    setIsDirectMessageOpen,
    logout,
    formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'commissions' | 'saved'>('orders');

  if (!isBuyerDashboardOpen || !user) return null;

  const favoritedCloths = cloths.filter(c => favorites.includes(c.id));
  const userOrders = orders.filter(o => o.buyerId === user.id || o.buyerId === 'buyer-demo-1');
  const userCommissions = commissions.filter(c => c.buyerId === user.id || c.buyerId === 'buyer-demo-1');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsBuyerDashboardOpen(false)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Bar */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-amber-900 text-white flex items-center justify-center font-serif text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-2xl font-bold text-stone-900 leading-tight">
                  {user.name}
                </h3>
                <span className="text-[11px] bg-amber-100 text-amber-950 font-semibold px-2 py-0.5 rounded">
                  Patron of Akwete
                </span>
              </div>
              <p className="text-xs text-stone-500">{user.email} · {user.phone}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Delivery: {user.address?.city}, {user.address?.country}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setIsBuyerDashboardOpen(false);
            }}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-red-200 bg-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'orders'
                ? 'border-amber-950 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Acquisitions & Orders ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'commissions'
                ? 'border-amber-950 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Custom Commissions ({userCommissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'saved'
                ? 'border-amber-950 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Favorites ({favoritedCloths.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  No previous loom acquisitions recorded.
                </div>
              ) : (
                userOrders.map(order => (
                  <div key={order.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-b border-stone-200/80 pb-2">
                      <div>
                        <span className="font-bold text-stone-900">{order.id}</span>
                        <span className="text-stone-400 ml-2">Placed on {order.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-950">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.cloth.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded object-cover border border-stone-300"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-stone-900">{item.cloth.title}</h4>
                          <p className="text-[11px] text-stone-500">
                            Woven by {item.cloth.producerName} · Qty: {item.quantity}
                          </p>
                          {item.customNote && (
                            <p className="text-[10px] text-amber-900 italic mt-0.5">
                              Note: {item.customNote}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-stone-900 tabular-nums">
                          {formatPrice(item.cloth)}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 text-xs">
                      <span className="text-stone-500">Payment: {order.paymentMethod}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const p = producers.find(prod => prod.name === order.producerNames[0]) || producers[0];
                            setMessageTargetProducer(p);
                            setIsDirectMessageOpen(true);
                          }}
                          className="text-amber-900 hover:text-amber-950 font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message Weaver</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Commissions */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              {userCommissions.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  No active bespoke commissions. Request a custom weave using the "Commission" button!
                </div>
              ) : (
                userCommissions.map(comm => (
                  <div key={comm.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                      <span className="font-bold text-stone-900">{comm.desiredMotif}</span>
                      <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {comm.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 space-y-1">
                      <p>
                        <span className="text-stone-400">Master Weaver:</span>{' '}
                        <span className="font-semibold text-stone-800">{comm.producerName}</span>
                      </p>
                      <p>
                        <span className="text-stone-400">Colors:</span> {comm.colors}
                      </p>
                      <p>
                        <span className="text-stone-400">Occasion:</span> {comm.occasion}
                      </p>
                      <p>
                        <span className="text-stone-400">Target Delivery:</span> {comm.targetDate}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          const p = producers.find(prod => prod.id === comm.producerId) || producers[0];
                          setMessageTargetProducer(p);
                          setIsDirectMessageOpen(true);
                        }}
                        className="text-xs text-amber-900 hover:text-amber-950 font-semibold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discuss Loom Specs</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Saved Favorites */}
          {activeTab === 'saved' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoritedCloths.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-stone-400 text-xs">
                  No saved cloths yet. Tap the heart icon on any piece to save it.
                </div>
              ) : (
                favoritedCloths.map(cloth => (
                  <div
                    key={cloth.id}
                    onClick={() => {
                      setIsBuyerDashboardOpen(false);
                      setActiveClothModal(cloth);
                    }}
                    className="flex gap-3 p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={cloth.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded object-cover border border-stone-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{cloth.title}</h4>
                      <p className="text-[11px] text-stone-500 truncate">{cloth.motifName}</p>
                      <p className="text-xs font-bold text-stone-900 tabular-nums mt-1">
                        {formatPrice(cloth)}
                      </p>
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
