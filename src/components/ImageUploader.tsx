// ============================================================
// Akwete Luxe — ImageUploader Component
// Drag-and-drop + click-to-upload → Cloudinary
// Falls back gracefully to URL input when Cloudinary is not configured
// ============================================================
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle2, Loader2, Link as LinkIcon, ImageIcon } from 'lucide-react';

const isCloudinaryConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);
// Note: we detect via the API route, not a public env var (secret stays server-side)

interface ImageUploaderProps {
  /** Current image URL (for preview) */
  value: string;
  /** Called with the final Cloudinary URL (or pasted URL) after upload */
  onChange: (url: string) => void;
  /** Upload folder in Cloudinary, e.g. 'cloths' | 'weavers' */
  folder?: 'cloths' | 'weavers';
  /** Optional label */
  label?: string;
  /** Compact mode: just the preview + click target, no tall dropzone */
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'cloths',
  label = 'Cloth Image',
  compact = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Core upload function ───────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Get signed upload params from our server
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!sigRes.ok) {
        // Fallback: if API not available (local dev without Vercel), use URL mode
        setError('Upload API not available — paste an image URL instead.');
        setMode('url');
        setUploading(false);
        return;
      }

      const { cloudName, apiKey, timestamp, signature, uploadUrl } = await sigRes.json() as {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        signature: string;
        folder: string;
        uploadUrl: string;
      };

      // 2. Upload directly from browser to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);
      // Request WebP transformation + auto quality
      formData.append('transformation', 'f_webp,q_auto,w_1200,c_limit');

      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json() as {
        secure_url?: string;
        error?: { message: string };
      };

      if (!uploadRes.ok || uploadData.error) {
        throw new Error(uploadData.error?.message || 'Upload failed');
      }

      onChange(uploadData.secure_url!);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  // ── Drag and drop ──────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setError(null);
  };

  // ── Preview ────────────────────────────────────────────────
  const hasImage = !!value;

  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-stone-700">{label}</label>
        <div className="flex items-start gap-3">
          {/* Thumbnail preview */}
          <div
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 hover:border-amber-900 bg-stone-50 flex items-center justify-center cursor-pointer overflow-hidden transition-colors shrink-0"
          >
            {hasImage ? (
              <img src={value} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-stone-400" />
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full py-1.5 px-3 text-xs border border-stone-300 rounded-lg hover:border-amber-900 bg-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {uploading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading…</>
                : <><Upload className="w-3.5 h-3.5" />{hasImage ? 'Change Image' : 'Upload Image'}</>
              }
            </button>
            <div className="flex gap-1">
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onBlur={handleUrlSubmit}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); }}}
                placeholder="Or paste URL…"
                className="flex-1 px-2 py-1 text-[11px] border border-stone-200 rounded focus:outline-none focus:border-amber-900 bg-white"
              />
            </div>
            {error && <p className="text-[11px] text-red-600">{error}</p>}
            {hasImage && !uploading && (
              <p className="text-[10px] text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Image ready
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-stone-700">{label}</label>
        <div className="flex rounded-lg overflow-hidden border border-stone-200 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 font-medium transition-colors flex items-center gap-1 ${
              mode === 'upload' ? 'bg-amber-950 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Upload className="w-3 h-3" /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 font-medium transition-colors flex items-center gap-1 ${
              mode === 'url' ? 'bg-amber-950 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            <LinkIcon className="w-3 h-3" /> URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${
            dragOver
              ? 'border-amber-900 bg-amber-50/50'
              : hasImage
              ? 'border-stone-300 bg-stone-50'
              : 'border-stone-300 bg-stone-50 hover:border-amber-900 hover:bg-amber-50/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {hasImage ? (
            <div className="relative h-40">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-semibold bg-stone-900/80 px-3 py-1.5 rounded-lg">
                  Click to change
                </span>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(''); setUrlInput(''); }}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-stone-700 hover:text-red-600 shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-stone-400">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
                  <span className="text-xs font-medium text-amber-900">Uploading to Cloudinary…</span>
                </>
              ) : (
                <>
                  <Upload className="w-7 h-7" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-stone-700">
                      {dragOver ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">JPG, PNG, WebP — max 10MB</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://res.cloudinary.com/… or /images/…"
            className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-900 bg-white"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-amber-950 text-white text-xs font-semibold rounded-lg hover:bg-amber-900 transition-colors"
          >
            Set
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}

      {hasImage && mode === 'url' && (
        <div className="h-20 rounded-lg overflow-hidden border border-stone-200">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {hasImage && mode === 'upload' && !uploading && (
        <p className="text-[11px] text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Image ready
        </p>
      )}
    </div>
  );
};
