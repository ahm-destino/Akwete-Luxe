// ============================================================
// Akwete Luxe — POST /api/producer-apply
// A signed-in buyer applies to become a selling weaver.
//   1. Verifies the caller's Supabase JWT (Authorization: Bearer <token>)
//   2. Creates a PENDING producers row linked to their profile
//   3. Elevates their profile to role 'producer' (publishing stays blocked
//      by RLS until an admin flips status to 'active')
//   4. Emails the cooperative admin for review
// Uses the service-role key so it can write across tables (bypasses RLS).
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApplyBody {
  name: string;
  nativeTitle: string;
  village: string;
  yearsOfExperience: number;
  specialtyMotif: string;
  loomType: string;
  bio: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── 1. Authenticate the applicant ────────────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'You must be signed in to apply.' });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Session expired — please sign in again.' });
  }
  const user = userData.user;
  const body = req.body as ApplyBody;

  if (!body.name || !body.village) {
    return res.status(400).json({ error: 'Name and village are required.' });
  }

  // ── 2. Dedupe — one weaver account per user ───────────────
  const { data: existing } = await supabase
    .from('producers')
    .select('id, status')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({
      producerId: existing.id,
      status: existing.status,
      message: 'You already have a weaver application on file.',
    });
  }

  // ── 3. Create the pending producer row ────────────────────
  const producerId = `producer-${Date.now()}`;
  const { error: insertError } = await supabase.from('producers').insert({
    id: producerId,
    profile_id: user.id,
    status: 'pending',
    email: user.email ?? null,
    name: body.name,
    native_title: body.nativeTitle || null,
    location: 'Akwete Town, Abia State',
    village: body.village,
    years_of_experience: body.yearsOfExperience || 0,
    avatar_url: body.avatarUrl || null,
    bio: body.bio || null,
    specialty_motif: body.specialtyMotif || null,
    loom_type: body.loomType || null,
    phone: body.phone || null,
    whatsapp: body.whatsapp || null,
    total_cloths_woven: 0,
    rating: 5.0,
    review_count: 0,
    is_guild_certified: false,
  });

  if (insertError) {
    console.error('[/api/producer-apply] insert error:', insertError);
    return res.status(500).json({ error: insertError.message });
  }

  // ── 4. Link + elevate the profile (role gated by status) ──
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'producer', producer_id: producerId })
    .eq('id', user.id);

  if (profileError) {
    console.error('[/api/producer-apply] profile link error:', profileError);
    // Roll back the orphaned producer row so the user can retry cleanly
    await supabase.from('producers').delete().eq('id', producerId);
    return res.status(500).json({ error: profileError.message });
  }

  // ── 5. Notify admin (non-fatal) ───────────────────────────
  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'orders@akweteluxe.com',
          to: [process.env.ADMIN_EMAIL],
          subject: `New Weaver Application — ${body.name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917;">
              <h1 style="font-size: 20px; color: #78350f;">New Weaver Application</h1>
              <p><strong>Name:</strong> ${body.name} (${body.nativeTitle || '—'})</p>
              <p><strong>Account:</strong> ${user.email}</p>
              <p><strong>Village:</strong> ${body.village}</p>
              <p><strong>Experience:</strong> ${body.yearsOfExperience} years</p>
              <p><strong>Specialty:</strong> ${body.specialtyMotif || '—'}</p>
              <p><strong>Phone:</strong> ${body.phone || '—'} · WhatsApp: ${body.whatsapp || '—'}</p>
              <p style="margin-top:12px;">${body.bio || ''}</p>
              <p style="font-size:12px;color:#78716c;margin-top:16px;">
                Review and approve this weaver from the Admin → Weavers tab.
              </p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('[/api/producer-apply] email error:', err);
    }
  }

  return res.status(200).json({ producerId, status: 'pending' });
}
