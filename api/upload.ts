// ============================================================
// Akwete Luxe — POST /api/upload
// Generates a Cloudinary signed upload URL for the frontend
// The browser uploads directly to Cloudinary (no server memory usage)
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary not configured on server' });
  }

  const { folder = 'akwete-luxe', publicId } = req.body as {
    folder?: string;
    publicId?: string;
  };

  const timestamp = Math.round(Date.now() / 1000);

  // Build signature string — must match what Cloudinary expects
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };
  if (publicId) paramsToSign.public_id = publicId;

  // Sort keys alphabetically, build key=value&key2=value2 string
  const signatureString = Object.keys(paramsToSign)
    .sort()
    .map(k => `${k}=${paramsToSign[k]}`)
    .join('&');

  const signature = crypto
    .createHash('sha256')
    .update(signatureString + apiSecret)
    .digest('hex');

  return res.status(200).json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  });
}
