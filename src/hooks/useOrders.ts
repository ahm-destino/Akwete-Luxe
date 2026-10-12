// ============================================================
// Akwete Luxe — useOrders Hook
// Supabase CRUD for orders + order_items tables
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { OrderRow, OrderItemRow, OrderInsert, OrderItemInsert } from '../lib/database.types';
import { Order, OrderItem, User } from '../types';
import { toast } from '../lib/toast';

// Map DB rows → app Order type (with items joined)
function mapRowToOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    buyerId: row.buyer_id ?? '',
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerPhone: row.buyer_phone ?? '',
    items,
    totalNGN: row.total_ngn,
    totalUSD: row.total_usd,
    status: row.status,
    createdAt: row.created_at.split('T')[0],
    deliveryAddress: row.delivery_address ?? '',
    paymentMethod: row.payment_method ?? 'Escrow Bank Transfer',
    paymentRef: row.payment_ref ?? undefined,
    paymentVerified: row.payment_verified,
    producerNames: row.producer_names ?? [],
    loomNote: row.loom_note ?? undefined,
    payoutReleased: row.payout_released,
    payoutDate: row.payout_date ?? undefined,
  };
}

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

// Initial demo order for non-connected state
const DEMO_ORDER: Order = {
  id: 'ORD-AKW-7821',
  buyerId: 'buyer-demo-1',
  buyerName: 'Chidinma Okafor',
  buyerEmail: 'chidinma.okafor@gmail.com',
  buyerPhone: '+234 809 112 4433',
  items: [],
  totalNGN: 185000,
  totalUSD: 145,
  status: 'Weaving / Preparing',
  createdAt: '2026-09-22',
  deliveryAddress: '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  paymentMethod: 'Escrow Bank Transfer',
  producerNames: ['Mama Grace Nwosu'],
};

export function useOrders(user: User | null) {
  const [orders, setOrders] = useState<Order[]>([DEMO_ORDER]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch orders (admin gets all, buyer gets own) ──────────
  const fetchOrders = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;

    setLoading(true);

    // Admin fetches all; buyer fetches only their own (RLS enforces this)
    const query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('[useOrders] fetch error:', error);
      setError(error.message);
    } else if (data) {
      // Fetch order items for each order
      const orderIds = (data as OrderRow[]).map(o => o.id);
      
      let itemsByOrderId: Record<string, OrderItem[]> = {};
      if (orderIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        
        if (itemsData) {
          // Group items by order_id (cloths are embedded as title/price since items reference cloth_id)
          for (const item of itemsData as OrderItemRow[]) {
            if (!item.order_id) continue;
            if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
            // Build a minimal OrderItem without full cloth object for display
            // Full cloth data is in cloths state
            itemsByOrderId[item.order_id].push({
              cloth: {
                id: item.cloth_id ?? '',
                title: item.cloth_title ?? '',
                igboName: '',
                motifName: '',
                motifSymbolism: '',
                producerId: item.producer_id ?? '',
                producerName: '',
                producerAvatar: '',
                priceNGN: item.price_ngn,
                priceUSD: item.price_usd,
                imageUrl: '',
                dimensions: '',
                materials: '',
                weaveTimeDays: 0,
                colors: [],
                category: 'Ceremonial',
                inStock: true,
                stockCount: 0,
                description: '',
                culturalOccasion: '',
                weightGrams: 0,
                loomType: '',
              },
              quantity: item.quantity,
              customNote: item.custom_note ?? undefined,
            });
          }
        }
      }

      setOrders((data as OrderRow[]).map(row =>
        mapRowToOrder(row, itemsByOrderId[row.id] ?? [])
      ));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchOrders();
    else setOrders([DEMO_ORDER]);
  }, [user, fetchOrders]);

  // ── Place order ────────────────────────────────────────────
  const placeOrder = useCallback(async (
    cart: OrderItem[],
    deliveryDetails: {
      name: string;
      email: string;
      phone: string;
      address: string;
      paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD';
    },
    userId: string | undefined
  ): Promise<Order> => {
    const totalNGN = cart.reduce((sum, item) => sum + item.cloth.priceNGN * item.quantity, 0);
    const totalUSD = cart.reduce((sum, item) => sum + item.cloth.priceUSD * item.quantity, 0);
    const uniqueProducers = Array.from(new Set(cart.map(i => i.cloth.producerName)));
    const orderId = `ORD-AKW-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      buyerId: userId || 'guest-buyer',
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
      producerNames: uniqueProducers,
    };

    // Optimistic update
    setOrders(prev => [newOrder, ...prev]);

    if (isSupabaseConfigured) {
      // Use API route for order creation (handles email notification too)
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            buyerId: userId || null,
            buyerName: deliveryDetails.name,
            buyerEmail: deliveryDetails.email,
            buyerPhone: deliveryDetails.phone,
            totalNGN,
            totalUSD,
            deliveryAddress: deliveryDetails.address,
            paymentMethod: deliveryDetails.paymentMethod,
            producerNames: uniqueProducers,
            items: cart.map(item => ({
              clothId: item.cloth.id,
              clothTitle: item.cloth.title,
              producerId: item.cloth.producerId,
              quantity: item.quantity,
              priceNGN: item.cloth.priceNGN,
              priceUSD: item.cloth.priceUSD,
              customNote: item.customNote ?? null,
            })),
          }),
        });

        if (!res.ok) {
          console.error('[useOrders] API order creation failed');
        }
      } catch (err) {
        console.error('[useOrders] API error:', err);
        // Fall back to direct Supabase insert
        const orderInsert: OrderInsert = {
          id: orderId,
          buyer_id: userId || null,
          buyer_name: deliveryDetails.name,
          buyer_email: deliveryDetails.email,
          buyer_phone: deliveryDetails.phone || null,
          total_ngn: totalNGN,
          total_usd: totalUSD,
          status: 'Pending Verification',
          delivery_address: deliveryDetails.address,
          payment_method: deliveryDetails.paymentMethod,
          payment_ref: null,
          payment_verified: false,
          loom_note: null,
          payout_released: false,
          payout_date: null,
          producer_names: uniqueProducers,
        };

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert(orderInsert)
          .select()
          .single();

        if (!orderError && orderData) {
          // Insert order items
          const itemInserts: OrderItemInsert[] = cart.map(item => ({
            order_id: orderId,
            cloth_id: item.cloth.id || null,
            producer_id: item.cloth.producerId || null,
            cloth_title: item.cloth.title,
            quantity: item.quantity,
            price_ngn: item.cloth.priceNGN,
            price_usd: item.cloth.priceUSD,
            custom_note: item.customNote || null,
          }));

          await supabase.from('order_items').insert(itemInserts);
        }
      }
    }

    return newOrder;
  }, []);

  // ── Update order status ────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('[useOrders] status update error:', error);
      toast.error(`Could not update order status. ${error.message}`);
      fetchOrders();
    }
  }, [fetchOrders]);

  // ── Update order (generic partial) ────────────────────────
  const updateOrder = useCallback(async (orderId: string, updated: Partial<Order>) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, ...updated } : ord))
    );

    if (!isSupabaseConfigured) return;

    const dbUpdate: Record<string, unknown> = {};
    if (updated.status !== undefined) dbUpdate.status = updated.status;
    if (updated.loomNote !== undefined) dbUpdate.loom_note = updated.loomNote;
    if (updated.payoutReleased !== undefined) dbUpdate.payout_released = updated.payoutReleased;
    if (updated.payoutDate !== undefined) dbUpdate.payout_date = updated.payoutDate;
    if (updated.paymentVerified !== undefined) dbUpdate.payment_verified = updated.paymentVerified;

    if (Object.keys(dbUpdate).length === 0) return;

    const { error } = await supabase
      .from('orders')
      .update(dbUpdate)
      .eq('id', orderId);

    if (error) {
      console.error('[useOrders] update error:', error);
      toast.error(`Could not update the order. ${error.message}`);
      fetchOrders();
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    placeOrder,
    updateOrderStatus,
    updateOrder,
  };
}
