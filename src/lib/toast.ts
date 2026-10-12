// ============================================================
// Akwete Luxe — Toast store (framework-light pub/sub)
// Importable from hooks AND components so the data layer can surface
// write failures without threading errors through every call site.
// ============================================================
export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let toasts: Toast[] = [];
const listeners = new Set<(t: Toast[]) => void>();
let nextId = 1;

function emit() {
  for (const l of listeners) l(toasts);
}

export function dismissToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

function push(type: ToastType, message: string, ttl = 5000) {
  const id = nextId++;
  toasts = [...toasts, { id, type, message }];
  emit();
  if (ttl > 0) {
    setTimeout(() => dismissToast(id), ttl);
  }
  return id;
}

export function subscribeToasts(listener: (t: Toast[]) => void) {
  listeners.add(listener);
  listener(toasts);
  return () => { listeners.delete(listener); };
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message, 7000), // errors linger a little longer
  info: (message: string) => push('info', message),
};
