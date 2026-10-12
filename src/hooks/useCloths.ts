// ============================================================
// Akwete Luxe — useCloths Hook
// Supabase CRUD for the cloths table
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ClothRow, ClothInsert, ClothUpdate } from '../lib/database.types';
import { AkweteCloth } from '../types';
import { AKWETE_CLOTHS } from '../data/mockData';
import { toast } from '../lib/toast';

// Map DB row → app AkweteCloth type
function mapRowToCloth(row: ClothRow): AkweteCloth {
  return {
    id: row.id,
    title: row.title,
    igboName: row.igbo_name ?? '',
    motifName: row.motif_name ?? '',
    motifSymbolism: row.motif_symbolism ?? '',
    producerId: row.producer_id ?? '',
    producerName: row.producer_name ?? '',
    producerAvatar: row.producer_avatar ?? '',
    priceNGN: row.price_ngn,
    priceUSD: row.price_usd,
    imageUrl: row.image_url ?? '',
    secondaryImageUrl: row.secondary_image_url ?? undefined,
    dimensions: row.dimensions ?? '',
    materials: row.materials ?? '',
    weaveTimeDays: row.weave_time_days,
    colors: row.colors ?? [],
    category: row.category ?? 'Ceremonial',
    inStock: row.in_stock,
    stockCount: row.stock_count,
    description: row.description ?? '',
    culturalOccasion: row.cultural_occasion ?? '',
    weightGrams: row.weight_grams ?? 0,
    loomType: row.loom_type ?? '',
  };
}

// Map app AkweteCloth → DB insert payload
function mapClothToInsert(cloth: AkweteCloth): ClothInsert {
  return {
    id: cloth.id,
    title: cloth.title,
    igbo_name: cloth.igboName || null,
    motif_name: cloth.motifName || null,
    motif_symbolism: cloth.motifSymbolism || null,
    producer_id: cloth.producerId || null,
    producer_name: cloth.producerName || null,
    producer_avatar: cloth.producerAvatar || null,
    price_ngn: cloth.priceNGN,
    price_usd: cloth.priceUSD,
    image_url: cloth.imageUrl || null,
    secondary_image_url: cloth.secondaryImageUrl || null,
    dimensions: cloth.dimensions || null,
    materials: cloth.materials || null,
    weave_time_days: cloth.weaveTimeDays,
    colors: cloth.colors || null,
    category: cloth.category || null,
    in_stock: cloth.inStock,
    stock_count: cloth.stockCount,
    description: cloth.description || null,
    cultural_occasion: cloth.culturalOccasion || null,
    weight_grams: cloth.weightGrams || null,
    loom_type: cloth.loomType || null,
  };
}

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co'
);

export function useCloths() {
  const [cloths, setCloths] = useState<AkweteCloth[]>(AKWETE_CLOTHS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all cloths ───────────────────────────────────────
  const fetchCloths = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cloths')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[useCloths] fetch error:', error);
      setError(error.message);
      setCloths(AKWETE_CLOTHS);
    } else if (data && data.length > 0) {
      setCloths((data as ClothRow[]).map(mapRowToCloth));
    } else {
      setCloths(AKWETE_CLOTHS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCloths();
  }, [fetchCloths]);

  // ── Add new cloth ──────────────────────────────────────────
  const addNewCloth = useCallback(async (clothData: Omit<AkweteCloth, 'id'>) => {
    const newCloth: AkweteCloth = {
      ...clothData,
      id: `cloth-${Date.now()}`,
    };

    // Optimistic update
    setCloths(prev => [newCloth, ...prev]);

    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('cloths')
      .insert(mapClothToInsert(newCloth));

    if (error) {
      console.error('[useCloths] insert error:', error);
      setCloths(prev => prev.filter(c => c.id !== newCloth.id));
      toast.error(`Could not publish "${newCloth.title}". ${error.message}`);
    } else {
      toast.success(`"${newCloth.title}" published to the catalog.`);
    }
  }, []);

  // ── Update cloth ───────────────────────────────────────────
  const updateCloth = useCallback(async (clothId: string, updated: Partial<AkweteCloth>) => {
    // Optimistic update
    setCloths(prev =>
      prev.map(c => (c.id === clothId ? { ...c, ...updated } : c))
    );

    if (!isSupabaseConfigured) return;

    const updatePayload: ClothUpdate = {};
    if (updated.title !== undefined) updatePayload.title = updated.title;
    if (updated.igboName !== undefined) updatePayload.igbo_name = updated.igboName;
    if (updated.motifName !== undefined) updatePayload.motif_name = updated.motifName;
    if (updated.motifSymbolism !== undefined) updatePayload.motif_symbolism = updated.motifSymbolism;
    if (updated.producerId !== undefined) updatePayload.producer_id = updated.producerId;
    if (updated.producerName !== undefined) updatePayload.producer_name = updated.producerName;
    if (updated.producerAvatar !== undefined) updatePayload.producer_avatar = updated.producerAvatar;
    if (updated.priceNGN !== undefined) updatePayload.price_ngn = updated.priceNGN;
    if (updated.priceUSD !== undefined) updatePayload.price_usd = updated.priceUSD;
    if (updated.imageUrl !== undefined) updatePayload.image_url = updated.imageUrl;
    if (updated.secondaryImageUrl !== undefined) updatePayload.secondary_image_url = updated.secondaryImageUrl;
    if (updated.dimensions !== undefined) updatePayload.dimensions = updated.dimensions;
    if (updated.materials !== undefined) updatePayload.materials = updated.materials;
    if (updated.weaveTimeDays !== undefined) updatePayload.weave_time_days = updated.weaveTimeDays;
    if (updated.colors !== undefined) updatePayload.colors = updated.colors;
    if (updated.category !== undefined) updatePayload.category = updated.category;
    if (updated.inStock !== undefined) updatePayload.in_stock = updated.inStock;
    if (updated.stockCount !== undefined) updatePayload.stock_count = updated.stockCount;
    if (updated.description !== undefined) updatePayload.description = updated.description;
    if (updated.culturalOccasion !== undefined) updatePayload.cultural_occasion = updated.culturalOccasion;
    if (updated.weightGrams !== undefined) updatePayload.weight_grams = updated.weightGrams;
    if (updated.loomType !== undefined) updatePayload.loom_type = updated.loomType;

    const { error } = await supabase
      .from('cloths')
      .update(updatePayload)
      .eq('id', clothId);

    if (error) {
      console.error('[useCloths] update error:', error);
      toast.error(`Could not save changes. ${error.message}`);
      fetchCloths(); // re-sync from DB so the UI reflects what actually persisted
    }
  }, [fetchCloths]);

  // ── Delete cloth ───────────────────────────────────────────
  const deleteCloth = useCallback(async (clothId: string) => {
    setCloths(prev => prev.filter(c => c.id !== clothId));

    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('cloths')
      .delete()
      .eq('id', clothId);

    if (error) {
      console.error('[useCloths] delete error:', error);
      toast.error(`Could not remove the piece. ${error.message}`);
      fetchCloths();
    }
  }, [fetchCloths]);

  return {
    cloths,
    loading,
    error,
    fetchCloths,
    addNewCloth,
    updateCloth,
    deleteCloth,
  };
}
