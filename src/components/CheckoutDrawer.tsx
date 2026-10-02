import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const CheckoutDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    formatPrice,
    placeOrder,
    user
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Delivery form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(
    user?.address ? `${user.address.street}, ${user.address.city}, ${user.address.country}` : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD'>('Escrow Bank Transfer');

  if (!isCartOpen) return null;

  const totalNGN = cart.reduce((sum, item) => sum + item.cloth.priceNGN * item.quantity, 0);
  const totalUSD = cart.reduce((sum, item) => sum + item.cloth.priceUSD * item.quantity, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address) return;

    const order = placeOrder({
      name,
      email,
      phone: phone || '+234 800 000 0000',
      address,
      paymentMethod
    });

    setCompletedOrder(order);
    setStep('success');
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setStep('cart');
    setCompletedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Top Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-900" />
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-stone-900">
              {step === 'cart' && `Your Bag (${cart.length} item${cart.length === 1 ? '' : 's'})`}
              {step === 'checkout' && 'Delivery & Payment'}
              {step === 'success' && 'Order Received'}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* STEP 1: Cart Items */}
          {step === 'cart' && (
            <div>
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif-display text-xl font-bold text-stone-800">
                    Your Acquisition Bag is Empty
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our handwoven Akwete cloth archive and support our master female weavers.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div
                      key={item.cloth.id}
                      className="flex gap-4 p-3 bg-stone-50 border border-stone-200 rounded-xl"
                    >
                      <img
                        src={item.cloth.imageUrl}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover border border-stone-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-stone-900 leading-snug">
                              {item.cloth.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.cloth.id)}
                              className="text-stone-400 hover:text-red-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Woven by {item.cloth.producerName}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {item.cloth.motifName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/80">
                          <div className="flex items-center gap-2 border border-stone-300 rounded bg-white px-2 py-0.5 text-xs">
                            <button
                              onClick={() => updateCartQuantity(item.cloth.id, item.quantity - 1)}
                              className="text-stone-500 hover:text-stone-900 font-bold px-1"
                            >
                              -
                            </button>
                            <span className="tabular-nums font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.cloth.id, item.quantity + 1)}
                              className="text-stone-500 hover:text-stone-900 font-bold px-1"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-bold text-stone-900 tabular-nums">
                            {formatPrice(item.cloth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Artisan Remuneration Notice */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
                    <span>
                      <strong>Fair Artisan Pricing:</strong> Your payment is deposited directly in the Akwete Weavers Cooperative Escrow Account and disbursed in full to the artisan upon dispatch.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Checkout Form */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                <span className="font-bold text-stone-900 block mb-0.5">Delivery Destination:</span>
                Direct courier from Akwete Town, Abia State via insured priority logistics.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full legal or ceremonial name"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Complete Delivery Street Address & City
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address, apartment/estate, city, state/province, postal code"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Payment Protection Method
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-900/60 bg-amber-50/50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Escrow Bank Transfer'}
                      onChange={() => setPaymentMethod('Escrow Bank Transfer')}
                      className="accent-amber-900"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">
                        Cooperative Escrow Bank Transfer
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Transfer to Akwete Guild Account (GTBank / Access Bank / Zenith)
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Card Payment'}
                      onChange={() => setPaymentMethod('Card Payment')}
                      className="accent-amber-900"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">
                        Credit / Debit Card (Mastercard, Visa, Verve)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Immediate secure processing with bank 3D-secure
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Artisan Direct COD'}
                      onChange={() => setPaymentMethod('Artisan Direct COD')}
                      className="accent-amber-900"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">
                        Pay on Verified Delivery / Cooperative Pickup
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Available in Lagos, Abuja, Port Harcourt & Aba
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Order Success */}
          {step === 'success' && completedOrder && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-amber-900 font-bold">
                  Order Successfully Placed
                </span>
                <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                  {completedOrder.id}
                </h3>
                <p className="text-xs text-stone-500">
                  A receipt and weaving verification slip have been routed to {completedOrder.buyerEmail}
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-500">Total Paid:</span>
                  <span className="font-bold text-stone-900">
                    ₦{completedOrder.totalNGN.toLocaleString('en-NG')} (${completedOrder.totalUSD})
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-500">Payment Mode:</span>
                  <span className="font-medium text-stone-800">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-500">Artisan Weavers:</span>
                  <span className="font-medium text-stone-800">{completedOrder.producerNames.join(', ')}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Dispatch Address:</span>
                  <span className="font-medium text-stone-800">{completedOrder.deliveryAddress}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close & Return to Archive
              </button>
            </div>
          )}

        </div>

        {/* Bottom Total & Action Bar */}
        {step !== 'success' && cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Subtotal:</span>
              <span className="font-serif-display text-2xl font-bold text-stone-900 tabular-nums">
                ₦{totalNGN.toLocaleString('en-NG')}{' '}
                <span className="text-xs font-sans text-stone-400 font-normal">(${totalUSD})</span>
              </span>
            </div>

            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 py-3 bg-amber-950 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs"
                >
                  Confirm & Place Order
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
