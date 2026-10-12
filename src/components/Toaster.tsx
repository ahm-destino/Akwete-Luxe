// ============================================================
// Akwete Luxe — Toaster
// Renders the toast stack. Mount once per full-screen surface.
// Sits above every modal (z-[70]) so failures are always visible.
// ============================================================
import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Toast, subscribeToasts, dismissToast } from '../lib/toast';

const STYLES: Record<Toast['type'], { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />,
  },
  error: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
  },
  info: {
    wrap: 'bg-white border-stone-200 text-stone-800',
    icon: <Info className="w-4 h-4 text-amber-800 shrink-0" />,
  },
};

export const Toaster: React.FC = () => {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {items.map(t => {
        const s = STYLES[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-lg text-xs font-medium animate-in slide-in-from-bottom-2 fade-in duration-200 ${s.wrap}`}
            role="status"
          >
            {s.icon}
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
