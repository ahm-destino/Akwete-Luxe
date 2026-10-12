// ============================================================
// Akwete Luxe — Supabase Database TypeScript Types
// Auto-aligned with supabase/schema.sql
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Row types (what you get back from SELECT) ─────────────────

export interface ProfileRow {
  id: string; // uuid — matches auth.users(id)
  name: string;
  email: string;
  phone: string | null;
  role: 'buyer' | 'producer' | 'admin';
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  producer_id: string | null;
  joined_date: string | null;
  created_at: string;
}

export interface ProducerRow {
  id: string;
  profile_id: string | null;
  status: 'pending' | 'active' | 'suspended';
  email: string | null;
  name: string;
  native_title: string | null;
  location: string | null;
  village: string | null;
  years_of_experience: number;
  avatar_url: string | null;
  bio: string | null;
  specialty_motif: string | null;
  loom_type: string | null;
  story: string | null;
  quote: string | null;
  phone: string | null;
  whatsapp: string | null;
  total_cloths_woven: number;
  generational_lineage: string | null;
  rating: number;
  review_count: number;
  is_guild_certified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClothRow {
  id: string;
  title: string;
  igbo_name: string | null;
  motif_name: string | null;
  motif_symbolism: string | null;
  producer_id: string | null;
  producer_name: string | null;
  producer_avatar: string | null;
  price_ngn: number;
  price_usd: number;
  image_url: string | null;
  secondary_image_url: string | null;
  dimensions: string | null;
  materials: string | null;
  weave_time_days: number;
  colors: string[] | null;
  category: 'Bridal' | 'Royal' | 'Ceremonial' | 'Contemporary' | 'Wall Tapestry' | null;
  in_stock: boolean;
  stock_count: number;
  description: string | null;
  cultural_occasion: string | null;
  weight_grams: number | null;
  loom_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  total_ngn: number;
  total_usd: number;
  status: 'Pending Verification' | 'Weaving / Preparing' | 'Shipped' | 'Delivered';
  delivery_address: string | null;
  payment_method: 'Escrow Bank Transfer' | 'Card Payment' | 'Artisan Direct COD' | null;
  payment_ref: string | null;
  payment_verified: boolean;
  loom_note: string | null;
  payout_released: boolean;
  payout_date: string | null;
  producer_names: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string; // uuid
  order_id: string | null;
  cloth_id: string | null;
  producer_id: string | null;
  cloth_title: string | null;
  quantity: number;
  price_ngn: number;
  price_usd: number;
  custom_note: string | null;
  created_at: string;
}

export interface CommissionRow {
  id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_contact: string | null;
  producer_id: string | null;
  producer_name: string | null;
  desired_motif: string | null;
  occasion: string | null;
  colors: string | null;
  estimated_budget_ngn: number | null;
  target_date: string | null;
  notes: string | null;
  status: 'Requested' | 'In Discussion' | 'Loom Warped' | 'Completed';
  weaver_progress_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string; // uuid
  sender_id: string | null;
  sender_name: string;
  sender_role: 'buyer' | 'producer' | 'admin' | null;
  receiver_id: string | null;
  receiver_name: string;
  cloth_id: string | null;
  cloth_title: string | null;
  text: string;
  read: boolean;
  acting_on_behalf_of: string | null;
  created_at: string;
}

export interface AppSettingsRow {
  id: number;
  ngn_per_usd: number;
  bank_details: string | null;
  updated_at: string;
}

// ── Insert types (what you send for INSERT) ────────────────────

export type ProfileInsert = Omit<ProfileRow, 'created_at'>;
export type ProducerInsert = Omit<ProducerRow, 'created_at' | 'updated_at'>;
export type ClothInsert = Omit<ClothRow, 'created_at' | 'updated_at'>;
export type OrderInsert = Omit<OrderRow, 'created_at' | 'updated_at'>;
export type OrderItemInsert = Omit<OrderItemRow, 'id' | 'created_at'>;
export type CommissionInsert = Omit<CommissionRow, 'created_at' | 'updated_at'>;
export type MessageInsert = Omit<MessageRow, 'id' | 'created_at'>;

// ── Update types ───────────────────────────────────────────────

export type ProfileUpdate = Partial<ProfileInsert>;
export type ProducerUpdate = Partial<ProducerInsert>;
export type ClothUpdate = Partial<ClothInsert>;
export type OrderUpdate = Partial<OrderInsert>;
export type CommissionUpdate = Partial<CommissionInsert>;
export type AppSettingsUpdate = Partial<Omit<AppSettingsRow, 'id' | 'updated_at'>>;
