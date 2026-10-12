// ============================================================
// Akwete Luxe — useSettings Hook
// Reads/writes the singleton app_settings row (exchange rate, bank details).
// Replaces the hardcoded ₦/$ divisor that used to live in the dashboards.
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AppSettingsRow, AppSettingsUpdate } from '../lib/database.types';
import { AppSettings } from '../types';
import { toast } from '../lib/toast';

const DEFAULT_SETTINGS: AppSettings = {
  ngnPerUsd: 1600,
  bankDetails:
    'Akwete Weavers Cooperative Escrow\nGTBank 0123456789 · Access Bank 0987654321 · Zenith 1122334455',
};

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

function mapRow(row: AppSettingsRow): AppSettings {
  return {
    ngnPerUsd: Number(row.ngn_per_usd) || DEFAULT_SETTINGS.ngnPerUsd,
    bankDetails: row.bank_details ?? DEFAULT_SETTINGS.bankDetails,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const fetchSettings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (!error && data) setSettings(mapRow(data as AppSettingsRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Admin-only (RLS enforces). Optimistic.
  const updateSettings = useCallback(async (updated: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updated }));
    if (!isSupabaseConfigured) return { error: null };

    const payload: AppSettingsUpdate = {};
    if (updated.ngnPerUsd !== undefined) payload.ngn_per_usd = updated.ngnPerUsd;
    if (updated.bankDetails !== undefined) payload.bank_details = updated.bankDetails;

    const { error } = await supabase.from('app_settings').update(payload).eq('id', 1);
    if (error) {
      console.error('[useSettings] update error:', error);
      toast.error(`Could not save settings. ${error.message}`);
      fetchSettings();
      return { error: error.message };
    }
    return { error: null };
  }, [fetchSettings]);

  return { settings, loading, fetchSettings, updateSettings };
}
