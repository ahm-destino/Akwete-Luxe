// ============================================================
// Akwete Luxe — POST /api/commissions
// Creates a custom commission in Supabase + sends email alert
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateCommissionBody {
  id: string;
  buyerId: string | null;
  buyerName: string;
  buyerContact: string;
  producerId: string;
  producerName: string;
  desiredMotif: string;
  occasion: string;
  colors: string;
  estimatedBudgetNGN: number;
  targetDate: string;
  notes: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as CreateCommissionBody;

  // ── Insert commission ────────────────────────────────────
  const { error } = await supabase.from('commissions').insert({
    id: body.id,
    buyer_id: body.buyerId,
    buyer_name: body.buyerName,
    buyer_contact: body.buyerContact || null,
    producer_id: body.producerId || null,
    producer_name: body.producerName || null,
    desired_motif: body.desiredMotif || null,
    occasion: body.occasion || null,
    colors: body.colors || null,
    estimated_budget_ngn: body.estimatedBudgetNGN || null,
    target_date: body.targetDate || null,
    notes: body.notes || null,
    status: 'Requested',
    weaver_progress_note: null,
  });

  if (error) {
    console.error('[/api/commissions] insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  // ── Send email notification ──────────────────────────────
  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    const emailBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917;">
        <h1 style="font-size: 20px; color: #78350f;">New Commission Request — ${body.id}</h1>
        <p><strong>Buyer:</strong> ${body.buyerName} (${body.buyerContact})</p>
        <p><strong>Assigned Weaver:</strong> ${body.producerName}</p>
        <p><strong>Desired Motif:</strong> ${body.desiredMotif}</p>
        <p><strong>Occasion:</strong> ${body.occasion}</p>
        <p><strong>Colors:</strong> ${body.colors}</p>
        <p><strong>Budget:</strong> ₦${body.estimatedBudgetNGN?.toLocaleString('en-NG')}</p>
        <p><strong>Target Date:</strong> ${body.targetDate}</p>
        <p><strong>Notes:</strong> ${body.notes}</p>
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
          to: [process.env.ADMIN_EMAIL],
          subject: `New Commission Request: ${body.desiredMotif} — ${body.buyerName}`,
          html: emailBody,
        }),
      });
    } catch (err) {
      console.error('[/api/commissions] email error:', err);
    }
  }

  return res.status(200).json({ success: true, id: body.id });
}
