// ============================================================
// Akwete Luxe — useProducers Hook
// Supabase CRUD for the producers table + the self-register / approval flow
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ProducerRow, ProducerInsert, ProducerUpdate } from '../lib/database.types';
import { Producer, ProducerApplication } from '../types';
import { PRODUCERS } from '../data/mockData';
import { toast } from '../lib/toast';

// Map DB row → app Producer type
function mapRowToProducer(row: ProducerRow): Producer {
  return {
    id: row.id,
    name: row.name,
    nativeTitle: row.native_title ?? '',
    location: row.location ?? '',
    village: row.village ?? '',
    yearsOfExperience: row.years_of_experience,
    avatarUrl: row.avatar_url ?? '',
    bio: row.bio ?? '',
    specialtyMotif: row.specialty_motif ?? '',
    loomType: row.loom_type ?? '',
    story: row.story ?? '',
    quote: row.quote ?? '',
    phone: row.phone ?? '',
    whatsapp: row.whatsapp ?? '',
    totalClothsWoven: row.total_cloths_woven,
    generationalLineage: row.generational_lineage ?? '',
    rating: row.rating,
    reviewCount: row.review_count,
    isGuildCertified: row.is_guild_certified,
    status: row.status ?? 'active',
    profileId: row.profile_id ?? undefined,
    email: row.email ?? undefined,
  };
}

// Map app Producer → DB insert payload
function mapProducerToInsert(producer: Omit<Producer, 'id'> & { id?: string }): ProducerInsert {
  return {
    id: producer.id ?? `producer-${Date.now()}`,
    profile_id: producer.profileId ?? null,
    status: producer.status ?? 'active',
    email: producer.email ?? null,
    name: producer.name,
    native_title: producer.nativeTitle,
    location: producer.location,
    village: producer.village,
    years_of_experience: producer.yearsOfExperience,
    avatar_url: producer.avatarUrl || null,
    bio: producer.bio || null,
    specialty_motif: producer.specialtyMotif || null,
    loom_type: producer.loomType || null,
    story: producer.story || null,
    quote: producer.quote || null,
    phone: producer.phone || null,
    whatsapp: producer.whatsapp || null,
    total_cloths_woven: producer.totalClothsWoven,
    generational_lineage: producer.generationalLineage || null,
    rating: producer.rating,
    review_count: producer.reviewCount,
    is_guild_certified: producer.isGuildCertified,
  };
}

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

export function useProducers() {
  const [producers, setProducers] = useState<Producer[]>(PRODUCERS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all producers ────────────────────────────────────
  // (RLS decides visibility: public sees active, a weaver also sees their own,
  //  admins see every row including pending applications.)
  const fetchProducers = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[useProducers] fetch error:', error);
      setError(error.message);
      // Fallback to mock data
      setProducers(PRODUCERS);
    } else if (data && data.length > 0) {
      setProducers((data as ProducerRow[]).map(mapRowToProducer));
    } else {
      // DB empty — use mock data
      setProducers(PRODUCERS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducers();
  }, [fetchProducers]);

  // ── Add producer (admin-provisioned, immediately active) ───
  const addProducer = useCallback(async (data: Omit<Producer, 'id'>) => {
    const newId = `producer-${Date.now()}`;
    const newProducer: Producer = { ...data, id: newId, status: data.status ?? 'active' };

    // Optimistic update
    setProducers(prev => [...prev, newProducer]);

    if (!isSupabaseConfigured) return { error: null };

    const { error } = await supabase
      .from('producers')
      .insert(mapProducerToInsert(newProducer));

    if (error) {
      console.error('[useProducers] insert error:', error);
      setProducers(prev => prev.filter(p => p.id !== newId)); // Rollback
      toast.error(`Could not register ${newProducer.name}. ${error.message}`);
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // ── Update producer ────────────────────────────────────────
  const updateProducer = useCallback(async (id: string, updated: Partial<Producer>) => {
    // Optimistic update
    setProducers(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updated } : p))
    );

    if (!isSupabaseConfigured) return { error: null };

    const updatePayload: ProducerUpdate = {};
    if (updated.name !== undefined) updatePayload.name = updated.name;
    if (updated.nativeTitle !== undefined) updatePayload.native_title = updated.nativeTitle;
    if (updated.location !== undefined) updatePayload.location = updated.location;
    if (updated.village !== undefined) updatePayload.village = updated.village;
    if (updated.yearsOfExperience !== undefined) updatePayload.years_of_experience = updated.yearsOfExperience;
    if (updated.avatarUrl !== undefined) updatePayload.avatar_url = updated.avatarUrl;
    if (updated.bio !== undefined) updatePayload.bio = updated.bio;
    if (updated.specialtyMotif !== undefined) updatePayload.specialty_motif = updated.specialtyMotif;
    if (updated.loomType !== undefined) updatePayload.loom_type = updated.loomType;
    if (updated.story !== undefined) updatePayload.story = updated.story;
    if (updated.quote !== undefined) updatePayload.quote = updated.quote;
    if (updated.phone !== undefined) updatePayload.phone = updated.phone;
    if (updated.whatsapp !== undefined) updatePayload.whatsapp = updated.whatsapp;
    if (updated.totalClothsWoven !== undefined) updatePayload.total_cloths_woven = updated.totalClothsWoven;
    if (updated.generationalLineage !== undefined) updatePayload.generational_lineage = updated.generationalLineage;
    if (updated.rating !== undefined) updatePayload.rating = updated.rating;
    if (updated.reviewCount !== undefined) updatePayload.review_count = updated.reviewCount;
    if (updated.isGuildCertified !== undefined) updatePayload.is_guild_certified = updated.isGuildCertified;
    if (updated.status !== undefined) updatePayload.status = updated.status;
    if (updated.email !== undefined) updatePayload.email = updated.email;

    const { error } = await supabase
      .from('producers')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('[useProducers] update error:', error);
      toast.error(`Could not save weaver changes. ${error.message}`);
      fetchProducers(); // re-sync from DB
      return { error: error.message };
    }
    return { error: null };
  }, [fetchProducers]);

  // ── Delete producer ────────────────────────────────────────
  const deleteProducer = useCallback(async (id: string) => {
    // Optimistic update
    setProducers(prev => prev.filter(p => p.id !== id));

    if (!isSupabaseConfigured) return { error: null };

    const { error } = await supabase
      .from('producers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[useProducers] delete error:', error);
      toast.error(`Could not remove the weaver. ${error.message}`);
      fetchProducers(); // Re-fetch to restore
      return { error: error.message };
    }
    return { error: null };
  }, [fetchProducers]);

  // ── Apply to become a selling weaver (buyer → pending producer) ──
  // Returns the newly created producer id so the caller can link the session.
  const applyAsProducer = useCallback(async (
    application: ProducerApplication,
    accessToken?: string,
  ): Promise<{ error: string | null; producerId?: string }> => {
    const newId = `producer-${Date.now()}`;
    const optimistic: Producer = {
      id: newId,
      name: application.name,
      nativeTitle: application.nativeTitle,
      location: 'Akwete Town, Abia State',
      village: application.village,
      yearsOfExperience: application.yearsOfExperience,
      avatarUrl: application.avatarUrl,
      bio: application.bio,
      specialtyMotif: application.specialtyMotif,
      loomType: application.loomType,
      story: '',
      quote: '',
      phone: application.phone,
      whatsapp: application.whatsapp,
      totalClothsWoven: 0,
      generationalLineage: '',
      rating: 5.0,
      reviewCount: 0,
      isGuildCertified: false,
      status: 'pending',
    };

    // Optimistic insert
    setProducers(prev => [...prev, optimistic]);

    if (!isSupabaseConfigured) return { error: null, producerId: newId };

    try {
      const res = await fetch('/api/producer-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(application),
      });

      const payload = (await res.json().catch(() => ({}))) as { error?: string; producerId?: string };

      if (!res.ok) {
        setProducers(prev => prev.filter(p => p.id !== newId)); // Rollback
        return { error: payload.error || 'Could not submit application.' };
      }

      // Reconcile the optimistic row id with the server-generated id
      if (payload.producerId && payload.producerId !== newId) {
        setProducers(prev =>
          prev.map(p => (p.id === newId ? { ...p, id: payload.producerId! } : p))
        );
      }
      return { error: null, producerId: payload.producerId ?? newId };
    } catch (err) {
      console.error('[useProducers] apply error:', err);
      setProducers(prev => prev.filter(p => p.id !== newId));
      return { error: 'Network error submitting application.' };
    }
  }, []);

  // ── Approve / suspend (admin) ──────────────────────────────
  const approveProducer = useCallback((id: string) => updateProducer(id, { status: 'active' }), [updateProducer]);
  const suspendProducer = useCallback((id: string) => updateProducer(id, { status: 'suspended' }), [updateProducer]);

  return {
    producers,
    loading,
    error,
    fetchProducers,
    addProducer,
    updateProducer,
    deleteProducer,
    applyAsProducer,
    approveProducer,
    suspendProducer,
  };
}
