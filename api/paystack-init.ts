// ============================================================
// Akwete Luxe — POST /api/paystack-init
// Initializes a Paystack transaction for NGN card payments
// Returns authorization_url to redirect/popup the buyer
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InitPaystackBody {
  email: string;
  amountNGN: number; // in kobo (multiply by 100)
  orderId: string;
  metadata?: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amountNGN, orderId, metadata } = req.body as InitPaystackBody;

  if (!email || !amountNGN || !orderId) {
    return res.status(400).json({ error: 'email, amountNGN, and orderId are required' });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Paystack not configured on server' });
  }

  // Convert to kobo (Paystack expects amounts in kobo)
  const amountKobo = Math.round(amountNGN * 100);

  // Generate a unique reference
  const reference = `AKW-${orderId}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  try {
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        reference,
        currency: 'NGN',
        callback_url: `${process.env.VITE_APP_URL || 'https://akwete-luxe.vercel.app'}/payment/callback`,
        metadata: {
          order_id: orderId,
          custom_fields: [
            { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          ],
          ...metadata,
        },
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      }),
    });

    const paystackData = await paystackRes.json() as {
      status: boolean;
      message: string;
      data?: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    };

    if (!paystackData.status || !paystackData.data) {
      return res.status(400).json({ error: paystackData.message });
    }

    // Store payment reference on the order
    await supabase
      .from('orders')
      .update({ payment_ref: reference })
      .eq('id', orderId);

    return res.status(200).json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference,
    });
  } catch (err) {
    console.error('[/api/paystack-init] error:', err);
    return res.status(500).json({ error: 'Failed to initialize payment' });
  }
}
