// ============================================================
// Akwete Luxe — POST /api/orders
// Creates order + items in Supabase, sends Resend email
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Service role key has full DB access (bypasses RLS for server-side writes)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OrderItem {
  clothId: string;
  clothTitle: string;
  producerId?: string | null;
  quantity: number;
  priceNGN: number;
  priceUSD: number;
  customNote: string | null;
}

interface CreateOrderBody {
  orderId: string;
  buyerId: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  totalNGN: number;
  totalUSD: number;
  deliveryAddress: string;
  paymentMethod: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD';
  producerNames: string[];
  items: OrderItem[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as CreateOrderBody;
  const {
    orderId,
    buyerId,
    buyerName,
    buyerEmail,
    buyerPhone,
    totalNGN,
    totalUSD,
    deliveryAddress,
    paymentMethod,
    producerNames,
    items,
  } = body;

  // Validate required fields
  if (!orderId || !buyerName || !buyerEmail || !items?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // ── 1. Insert order ──────────────────────────────────────
  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    buyer_id: buyerId,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone || null,
    total_ngn: totalNGN,
    total_usd: totalUSD,
    status: 'Pending Verification',
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
    payment_ref: null,
    payment_verified: false,
    loom_note: null,
    payout_released: false,
    payout_date: null,
    producer_names: producerNames,
  });

  if (orderError) {
    console.error('[/api/orders] order insert error:', orderError);
    return res.status(500).json({ error: orderError.message });
  }

  // ── 2. Insert order items ────────────────────────────────
  const itemInserts = items.map(item => ({
    order_id: orderId,
    cloth_id: item.clothId || null,
    producer_id: item.producerId || null,
    cloth_title: item.clothTitle,
    quantity: item.quantity,
    price_ngn: item.priceNGN,
    price_usd: item.priceUSD,
    custom_note: item.customNote || null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemInserts);

  if (itemsError) {
    console.error('[/api/orders] order items insert error:', itemsError);
    // Don't fail — order is created, items can be re-added
  }

  // ── 3. Send email via Resend ─────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const itemsList = items
      .map(i => `• ${i.clothTitle} × ${i.quantity} — ₦${i.priceNGN.toLocaleString('en-NG')}`)
      .join('\n');

    const emailBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917;">
        <h1 style="font-size: 24px; color: #78350f; margin-bottom: 8px;">Your Akwete Luxe Order</h1>
        <p style="color: #57534e; font-size: 14px;">Dear ${buyerName},</p>
        <p style="color: #57534e; font-size: 14px;">
          Your order has been received and is now in the Akwete Weavers Cooperative queue for verification.
        </p>
        
        <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="font-size: 12px; font-weight: bold; color: #292524; margin: 0 0 8px;">Order Reference: ${orderId}</p>
          <pre style="font-size: 12px; color: #57534e; white-space: pre-wrap;">${itemsList}</pre>
          <hr style="border-color: #e7e5e4; margin: 12px 0;" />
          <p style="font-size: 13px; font-weight: bold; color: #292524; margin: 0;">
            Total: ₦${totalNGN.toLocaleString('en-NG')} ($${totalUSD})
          </p>
        </div>

        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="font-size: 12px; color: #713f12; margin: 0;">
            <strong>Artisan Weavers:</strong> ${producerNames.join(', ')}<br/>
            <strong>Payment Mode:</strong> ${paymentMethod}<br/>
            <strong>Delivery Address:</strong> ${deliveryAddress}
          </p>
        </div>

        <p style="font-size: 12px; color: #78716c;">
          You will receive updates as your order progresses through our weaving and dispatch process.
          Questions? Reply to this email or WhatsApp our secretariat.
        </p>

        <p style="font-size: 11px; color: #a8a29e; margin-top: 24px; border-top: 1px solid #e7e5e4; padding-top: 16px;">
          Akwete Luxe · Handwoven Heritage from Akwete Town, Abia State, Nigeria
        </p>
      </div>
    `;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'orders@akweteluxe.com',
          to: [buyerEmail],
          subject: `Akwete Luxe — Order Confirmation ${orderId}`,
          html: emailBody,
        }),
      });

      // Also notify admin
      if (process.env.ADMIN_EMAIL) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'orders@akweteluxe.com',
            to: [process.env.ADMIN_EMAIL],
            subject: `New Order: ${orderId} — ${buyerName} (₦${totalNGN.toLocaleString('en-NG')})`,
            html: `<p>New order received from ${buyerName} (${buyerEmail}) for ₦${totalNGN.toLocaleString('en-NG')}. Order ID: ${orderId}</p>`,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[/api/orders] email error:', emailErr);
      // Non-fatal — order is still created
    }
  }

  return res.status(200).json({ success: true, orderId });
}
