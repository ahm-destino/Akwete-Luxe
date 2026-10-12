// ============================================================
// Akwete Luxe — useCommissions Hook
// Supabase CRUD for the commissions table
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CommissionRow, CommissionInsert, CommissionUpdate } from '../lib/database.types';
import { CustomCommission, User } from '../types';
import { toast } from '../lib/toast';

// Demo commission for unauthenticated state
const DEMO_COMMISSION: CustomCommission = {
  id: 'COMM-101',
  buyerId: 'buyer-demo-1',
  buyerName: 'Chidinma Okafor',
  buyerContact: '+234 809 112 4433',
  producerId: 'producer-1',
  producerName: 'Mama Grace Nwosu',
  desiredMotif: 'Sacred Ikaki & Royal Tortoise',
  occasion: 'Elder Brother Chieftaincy Ceremony',
  colors: 'Deep Indigo, Royal Emerald and Loom Gold',
  estimatedBudgetNGN: 195000,
  targetDate: '2026-11-15',
  notes: 'Needs matching chief shoulder sash with custom gold fringing.',
  status: 'In Discussion',
  createdAt: '2026-09-25',
};

function mapRowToCommission(row: CommissionRow): CustomCommission {
  return {
    id: row.id,
    buyerId: row.buyer_id ?? '',
    buyerName: row.buyer_name,
    buyerContact: row.buyer_contact ?? '',
    producerId: row.producer_id ?? '',
    producerName: row.producer_name ?? '',
    desiredMotif: row.desired_motif ?? '',
    occasion: row.occasion ?? '',
    colors: row.colors ?? '',
    estimatedBudgetNGN: row.estimated_budget_ngn ?? 0,
    targetDate: row.target_date ?? '',
    notes: row.notes ?? '',
    status: row.status,
    createdAt: row.created_at.split('T')[0],
    weaverProgressNote: row.weaver_progress_note ?? undefined,
  };
}

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

export function useCommissions(user: User | null) {
  const [commissions, setCommissions] = useState<CustomCommission[]>([DEMO_COMMISSION]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch commissions ──────────────────────────────────────
  const fetchCommissions = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[useCommissions] fetch error:', error);
      setError(error.message);
    } else if (data) {
      setCommissions((data as CommissionRow[]).map(mapRowToCommission));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchCommissions();
    else setCommissions([DEMO_COMMISSION]);
  }, [user, fetchCommissions]);

  // ── Request commission ─────────────────────────────────────
  const requestCommission = useCallback(async (
    data: Omit<CustomCommission, 'id' | 'createdAt' | 'status'>,
    userId: string | undefined
  ) => {
    const newCommission: CustomCommission = {
      ...data,
      id: `COMM-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Requested',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Optimistic update
    setCommissions(prev => [newCommission, ...prev]);

    if (!isSupabaseConfigured) return;

    try {
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCommission,
          buyerId: userId || null,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
    } catch {
      // Fall back to direct Supabase insert
      const insert: CommissionInsert = {
        id: newCommission.id,
        buyer_id: userId || null,
        buyer_name: data.buyerName,
        buyer_contact: data.buyerContact || null,
        producer_id: data.producerId || null,
        producer_name: data.producerName || null,
        desired_motif: data.desiredMotif || null,
        occasion: data.occasion || null,
        colors: data.colors || null,
        estimated_budget_ngn: data.estimatedBudgetNGN || null,
        target_date: data.targetDate || null,
        notes: data.notes || null,
        status: 'Requested',
        weaver_progress_note: null,
      };

      const { error } = await supabase.from('commissions').insert(insert);
      if (error) {
        console.error('[useCommissions] insert error:', error);
        setCommissions(prev => prev.filter(c => c.id !== newCommission.id));
      }
    }
  }, []);

  // ── Update commission ──────────────────────────────────────
  const updateCommission = useCallback(async (
    commissionId: string,
    updated: Partial<CustomCommission>
  ) => {
    setCommissions(prev =>
      prev.map(c => (c.id === commissionId ? { ...c, ...updated } : c))
    );

    if (!isSupabaseConfigured) return;

    const dbUpdate: CommissionUpdate = {};
    if (updated.status !== undefined) dbUpdate.status = updated.status;
    if (updated.weaverProgressNote !== undefined) dbUpdate.weaver_progress_note = updated.weaverProgressNote;
    if (updated.producerId !== undefined) dbUpdate.producer_id = updated.producerId;
    if (updated.producerName !== undefined) dbUpdate.producer_name = updated.producerName;

    const { error } = await supabase
      .from('commissions')
      .update(dbUpdate)
      .eq('id', commissionId);

    if (error) {
      console.error('[useCommissions] update error:', error);
      toast.error(`Could not update the commission. ${error.message}`);
      fetchCommissions();
    }
  }, [fetchCommissions]);

  // ── Reassign commission to different producer ──────────────
  const reassignCommission = useCallback(async (
    commissionId: string,
    newProducerId: string,
    producers: { id: string; name: string }[]
  ) => {
    const targetProducer = producers.find(p => p.id === newProducerId);
    if (!targetProducer) return;

    await updateCommission(commissionId, {
      producerId: targetProducer.id,
      producerName: targetProducer.name,
    });
  }, [updateCommission]);

  return {
    commissions,
    loading,
    error,
    fetchCommissions,
    requestCommission,
    updateCommission,
    reassignCommission,
  };
}
