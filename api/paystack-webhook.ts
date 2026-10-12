// ============================================================
// Akwete Luxe — POST /api/paystack-webhook
// Receives payment success events from Paystack
// Verifies HMAC signature, marks order as payment_verified
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: 'success' | 'failed' | 'abandoned';
    amount: number; // kobo
    currency: string;
    customer: {
      email: string;
    };
    metadata?: {
      order_id?: string;
    };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Verify Paystack HMAC signature ─────────────────────
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return res.status(500).json({ error: 'Paystack not configured' });
  }

  const hash = crypto
    .createHmac('sha512', paystackSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  const paystackSignature = req.headers['x-paystack-signature'] as string;

  if (hash !== paystackSignature) {
    console.warn('[/api/paystack-webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body as PaystackEvent;

  // ── 2. Handle charge.success ───────────────────────────────
  if (event.event === 'charge.success' && event.data.status === 'success') {
    const reference = event.data.reference;
    const orderId = event.data.metadata?.order_id;

    // Find order by payment_ref
    const query = orderId
      ? supabase.from('orders').select('id').eq('id', orderId).single()
      : supabase.from('orders').select('id').eq('payment_ref', reference).single();

    const { data: order, error: findError } = await query;

    if (findError || !order) {
      console.error('[/api/paystack-webhook] Order not found for reference:', reference);
      return res.status(200).json({ received: true }); // Always 200 to Paystack
    }

    // Mark order as payment verified + update status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_verified: true,
        payment_ref: reference,
        status: 'Weaving / Preparing', // Move to next stage
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('[/api/paystack-webhook] Order update error:', updateError);
    } else {
      console.log(`[/api/paystack-webhook] Order ${order.id} payment verified`);

      // Send confirmation email if Resend configured
      if (process.env.RESEND_API_KEY && event.data.customer.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'orders@akweteluxe.com',
            to: [event.data.customer.email],
            subject: `Payment Confirmed — Akwete Luxe Order ${order.id}`,
            html: `
              <div style="font-family: Georgia, serif; padding: 24px; color: #1c1917;">
                <h1 style="color: #78350f; font-size: 20px;">Payment Received ✓</h1>
                <p>Your payment of ₦${(event.data.amount / 100).toLocaleString('en-NG')} has been confirmed.</p>
                <p>Order Reference: <strong>${order.id}</strong></p>
                <p>Your order has moved to <strong>Weaving / Preparing</strong> status. 
                   Our weavers will begin work on your cloth and you will receive shipping updates soon.</p>
                <p style="font-size: 12px; color: #78716c;">Akwete Luxe · Handwoven Heritage</p>
              </div>
            `,
          }),
        }).catch(err => console.error('Email error:', err));
      }
    }
  }

  // Always return 200 so Paystack doesn't retry
  return res.status(200).json({ received: true });
}
