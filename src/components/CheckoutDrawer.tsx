import React, { useState, useCallback, useEffect } from 'react';
import { X, Trash2, ShieldCheck, CheckCircle2, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
const isPaystackConfigured = !!(PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY.startsWith('pk_'));

export const CheckoutDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    formatPrice,
    placeOrder,
    user,
    settings,
    currency
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Delivery form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(
    user?.address ? `${user.address.street}, ${user.address.city}, ${user.address.country}` : ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD'>('Escrow Bank Transfer');

  const totalNGN = cart.reduce((sum, item) => sum + item.cloth.priceNGN * item.quantity, 0);
  const totalUSD = cart.reduce((sum, item) => sum + item.cloth.priceUSD * item.quantity, 0);

  useEffect(() => {
    if (!user) return;
    setName(current => current || user.name || '');
    setEmail(current => current || user.email || '');
    setPhone(current => current || user.phone || '');
    setAddress(current => current || (user.address ? `${user.address.street}, ${user.address.city}, ${user.address.country}` : ''));
  }, [user]);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [isCartOpen]);

  // Paystack inline popup handler
  const initiatePaystackPayment = useCallback(async (orderId: string) => {
    if (!isPaystackConfigured) {
      setPaymentError('Card payment is not yet configured. Please use Escrow Bank Transfer.');
      setProcessingPayment(false);
      return;
    }

    try {
      // Initialize via server to get access code securely
      const res = await fetch('/api/paystack-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orderId }),
      });

      if (!res.ok) {
        throw new Error('Failed to initialize payment');
      }

      const { access_code } = await res.json() as { access_code: string; authorization_url: string };

      // Load Paystack inline script dynamically
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        const handler = (window as unknown as Record<string, unknown>).PaystackPop as {
          setup: (config: Record<string, unknown>) => { openIframe: () => void };
        };
        if (!handler) {
          setPaymentError('Failed to load payment processor.');
          setProcessingPayment(false);
          return;
        }
        const popup = handler.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email,
          access_code,
          ref: orderId,
          onClose: () => {
            setPaymentError('Payment was not completed. Please try again.');
            setProcessingPayment(false);
          },
          callback: (response: { reference: string }) => {
            console.log('[Paystack] Payment successful, ref:', response.reference);
            setProcessingPayment(false);
            setStep('success');
          },
        });
        popup.openIframe();
      };
      script.onerror = () => {
        setPaymentError('Payment processor could not be loaded. Please try again or choose bank transfer.');
        setProcessingPayment(false);
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('[CheckoutDrawer] Paystack init error:', err);
      setPaymentError('Payment initialization failed. Please try Escrow Bank Transfer.');
      setProcessingPayment(false);
    }
  }, [email]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address) return;
    setPaymentError(null);

    // For Card Payment, create order first then open Paystack
    if (paymentMethod === 'Card Payment' && isPaystackConfigured) {
      setProcessingPayment(true);
      try {
        // A closed/failed Paystack popup must be retryable without creating a
        // duplicate order or relying on a cart that was already reserved.
        if (completedOrder) {
          await initiatePaystackPayment(completedOrder.id);
          return;
        }
        const order = await placeOrder({ name, email, phone, address, paymentMethod });
        setCompletedOrder(order);
        await initiatePaystackPayment(order.id);
      } catch (err) {
        setPaymentError(err instanceof Error ? err.message : 'Could not place your order. Please try again.');
        setProcessingPayment(false);
      }
      return;
    }

    // For Escrow or COD — create order directly
    try {
      setProcessingPayment(true);
      const order = await placeOrder({ name, email, phone, address, paymentMethod });
      setCompletedOrder(order);
      setStep('success');
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Could not place your order. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setStep('cart');
    setCompletedOrder(null);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end" onMouseDown={handleClose}>
      <div role="dialog" aria-modal="true" aria-label="Shopping bag and checkout" onMouseDown={event => event.stopPropagation()} className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
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
            aria-label="Close bag"
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

                  {paymentMethod === 'Escrow Bank Transfer' && (
                    <div className="ml-8 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-stone-700">
                      <strong className="block text-stone-900 mb-1">Transfer instructions</strong>
                      {settings.bankDetails || 'Bank-transfer details are being confirmed by the cooperative. Do not transfer funds until the order confirmation email provides verified account details.'}
                    </div>
                  )}

                  {isPaystackConfigured && <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
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
                  </label>}

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
                  <span className="text-stone-500">{completedOrder.paymentVerified ? 'Total Paid:' : 'Order total:'}</span>
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

              {completedOrder.paymentMethod === 'Escrow Bank Transfer' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-stone-700">
                  <strong className="block text-stone-900 mb-1">Payment pending — verified bank transfer required</strong>
                  {settings.bankDetails || 'Verified transfer instructions will be sent by the cooperative before payment is due.'}
                </div>
              )}

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
                {currency === 'NGN' ? `₦${totalNGN.toLocaleString('en-NG')}` : `$${totalUSD.toLocaleString('en-US')}`}
              </span>
            </div>

            {paymentError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {paymentError}
              </div>
            )}

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
                  disabled={processingPayment}
                  className="px-4 py-3 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={processingPayment}
                  className="flex-1 py-3 bg-amber-950 hover:bg-amber-900 disabled:opacity-60 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment…</>
                  ) : paymentMethod === 'Card Payment' && isPaystackConfigured ? (
                    'Pay with Card (Paystack)'
                  ) : (
                    'Confirm & Place Order'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
