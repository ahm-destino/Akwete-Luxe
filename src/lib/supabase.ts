import { createClient } from '@supabase/supabase-js';

// Placeholder values keep the app booting in demo/mock mode when no backend is
// connected. Every hook guards real calls behind `isSupabaseConfigured`, so the
// client is only ever hit for network operations once valid keys are present.
const PLACEHOLDER_URL = 'https://your-project-id.supabase.co';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PLACEHOLDER_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    // Non-fatal: run in demo mode with mock data until the backend is configured.
    console.warn(
        '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — running in demo mode. ' +
        'Copy .env.example to .env.local and set them to connect your Supabase project.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// True only when a real backend is wired up (used by hooks to decide mock vs live).
export const isSupabaseConfigured = !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== PLACEHOLDER_URL
);
