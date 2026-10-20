import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
type RequestedItem = { clothId: string; quantity: number; customNote?: string | null };
type CreateOrderBody = { orderId: string; buyerId: string | null; buyerName: string; buyerEmail: string; buyerPhone: string; deliveryAddress: string; paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD'; items: RequestedItem[] };
const validPaymentMethods = new Set(['Escrow Bank Transfer', 'Card Payment', 'Artisan Direct COD']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body as CreateOrderBody;
  if (!body?.orderId || !body.buyerName?.trim() || !body.buyerEmail?.trim() || !body.deliveryAddress?.trim() || !Array.isArray(body.items) || !body.items.length) return res.status(400).json({ error: 'Missing required order details.' });
  if (!validPaymentMethods.has(body.paymentMethod) || body.items.length > 20) return res.status(400).json({ error: 'Invalid order request.' });

  const requested = new Map<string, { quantity: number; customNote?: string | null }>();
  for (const item of body.items) {
    if (!item?.clothId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) return res.status(400).json({ error: 'Each item needs a valid quantity.' });
    const previous = requested.get(item.clothId);
    requested.set(item.clothId, { quantity: (previous?.quantity ?? 0) + item.quantity, customNote: item.customNote });
  }

  const ids = [...requested.keys()];
  const { data: cloths, error: clothError } = await supabase.from('cloths').select('id,title,producer_id,producer_name,price_ngn,price_usd,in_stock,stock_count').in('id', ids);
  if (clothError || !cloths || cloths.length !== ids.length) return res.status(409).json({ error: 'One or more selected pieces are no longer available.' });
  const reservedCloths: typeof cloths = [];
  for (const cloth of cloths) {
    const quantity = requested.get(cloth.id)!.quantity;
    if (!cloth.in_stock || cloth.stock_count < quantity) return res.status(409).json({ error: `${cloth.title} is no longer available in that quantity.` });
  }

  // Prices, titles, producers and totals are derived from the catalog here.
  const totalNGN = cloths.reduce((sum, cloth) => sum + cloth.price_ngn * requested.get(cloth.id)!.quantity, 0);
  const totalUSD = cloths.reduce((sum, cloth) => sum + cloth.price_usd * requested.get(cloth.id)!.quantity, 0);
  const producerNames = [...new Set(cloths.map(c => c.producer_name).filter((name): name is string => !!name))];
  const { error: orderError } = await supabase.from('orders').insert({
    id: body.orderId, buyer_id: body.buyerId, buyer_name: body.buyerName.trim(), buyer_email: body.buyerEmail.trim(), buyer_phone: body.buyerPhone?.trim() || null,
    total_ngn: totalNGN, total_usd: totalUSD, status: 'Pending Verification', delivery_address: body.deliveryAddress.trim(), payment_method: body.paymentMethod,
    payment_ref: null, payment_verified: false, loom_note: null, payout_released: false, payout_date: null, producer_names: producerNames,
  });
  if (orderError) return res.status(500).json({ error: 'Could not create the order.' });
  const { error: itemsError } = await supabase.from('order_items').insert(cloths.map(cloth => ({
    order_id: body.orderId, cloth_id: cloth.id, producer_id: cloth.producer_id, cloth_title: cloth.title, quantity: requested.get(cloth.id)!.quantity,
    price_ngn: cloth.price_ngn, price_usd: cloth.price_usd, custom_note: requested.get(cloth.id)!.customNote || null,
  })));
  if (itemsError) { await supabase.from('orders').delete().eq('id', body.orderId); return res.status(500).json({ error: 'Could not save order items.' }); }

  // Compare-and-set stock reservations prevent two checkouts from selling the same piece.
  for (const cloth of cloths) {
    const quantity = requested.get(cloth.id)!.quantity;
    const { data: reserved, error } = await supabase.from('cloths').update({ stock_count: cloth.stock_count - quantity, in_stock: cloth.stock_count - quantity > 0 }).eq('id', cloth.id).eq('stock_count', cloth.stock_count).eq('in_stock', true).select('id');
    if (error || !reserved?.length) {
      await Promise.all(reservedCloths.map(previous => supabase.from('cloths').update({ stock_count: previous.stock_count, in_stock: previous.in_stock }).eq('id', previous.id)));
      await supabase.from('orders').delete().eq('id', body.orderId);
      return res.status(409).json({ error: `${cloth.title} just sold out. Please refresh your bag and try again.` });
    }
    reservedCloths.push(cloth);
  }

  if (process.env.RESEND_API_KEY) {
    const { data: settings } = await supabase.from('app_settings').select('bank_details').eq('id', 1).single();
    const transferInstructions = settings?.bank_details || 'The cooperative will send verified transfer instructions before payment is due.';
    const paymentMessage = body.paymentMethod === 'Escrow Bank Transfer'
      ? `<p><strong>Payment pending:</strong> please make a verified bank transfer using these instructions:</p><p style="white-space:pre-wrap">${transferInstructions}</p>`
      : body.paymentMethod === 'Card Payment'
        ? '<p>Your card payment is awaiting confirmation from Paystack.</p>'
        : '<p>Payment will be arranged for verified delivery or cooperative pickup.</p>';
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'orders@akweteluxe.com', to: [body.buyerEmail.trim()],
        subject: `Akwete Luxe order received — ${body.orderId}`,
        html: `<div style="font-family:Arial,sans-serif;color:#1c1917"><h1>Order received</h1><p>Reference: <strong>${body.orderId}</strong></p><p>Order total: <strong>₦${totalNGN.toLocaleString('en-NG')}</strong></p>${paymentMessage}</div>`,
      }),
    }).catch(error => console.error('[/api/orders] confirmation email error:', error));
  }

  return res.status(200).json({ success: true, order: { id: body.orderId, totalNGN, totalUSD, producerNames, paymentMethod: body.paymentMethod, status: 'Pending Verification', paymentVerified: false } });
}
