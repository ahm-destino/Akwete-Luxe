-- ============================================================
-- Akwete Luxe — Supabase PostgreSQL Schema (canonical, fresh install)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- If your database ALREADY has an earlier version of this schema,
-- do NOT re-run this file — run supabase/migrations/0001_producer_backend.sql
-- instead (it is idempotent and upgrades an existing database in place).
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  role        text not null default 'buyer' check (role in ('buyer', 'producer', 'admin')),
  avatar_url  text,
  city        text,
  country     text,
  producer_id text,                      -- links a producer account to its producers.id (set server-side)
  joined_date date default current_date,
  created_at  timestamptz default now()
);

-- Auto-create profile on new user signup.
-- SECURITY: role is ALWAYS 'buyer' here — never trust a client-supplied role.
-- Elevation to 'producer' happens only via /api/producer-apply (service role);
-- elevation to 'admin' is done manually by a trusted operator in the dashboard.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'buyer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. PRODUCERS (Master Weavers)
-- ============================================================
create table public.producers (
  id                   text primary key,
  profile_id           uuid references public.profiles(id) on delete set null, -- the auth user who owns this weaver account
  status               text not null default 'active' check (status in ('pending','active','suspended')),
  email                text,
  name                 text not null,
  native_title         text,
  location             text,
  village              text,
  years_of_experience  integer default 0,
  avatar_url           text,
  bio                  text,
  specialty_motif      text,
  loom_type            text,
  story                text,
  quote                text,
  phone                text,
  whatsapp             text,
  total_cloths_woven   integer default 0,
  generational_lineage text,
  rating               numeric(3,1) default 5.0,
  review_count         integer default 0,
  is_guild_certified   boolean default true,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);


-- ============================================================
-- 3. CLOTHS (Inventory)
-- ============================================================
create table public.cloths (
  id                  text primary key,
  title               text not null,
  igbo_name           text,
  motif_name          text,
  motif_symbolism     text,
  producer_id         text references public.producers(id) on delete set null,
  producer_name       text,
  producer_avatar     text,
  price_ngn           integer not null,
  price_usd           integer not null,
  image_url           text,
  secondary_image_url text,
  dimensions          text,
  materials           text,
  weave_time_days     integer default 14,
  colors              text[],
  category            text check (category in ('Bridal','Royal','Ceremonial','Contemporary','Wall Tapestry')),
  in_stock            boolean default true,
  stock_count         integer default 1,
  description         text,
  cultural_occasion   text,
  weight_grams        integer,
  loom_type           text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);


-- ============================================================
-- 4. ORDERS
-- ============================================================
create table public.orders (
  id               text primary key,
  buyer_id         uuid references public.profiles(id) on delete set null,
  buyer_name       text not null,
  buyer_email      text not null,
  buyer_phone      text,
  total_ngn        integer not null,
  total_usd        integer not null,
  status           text not null default 'Pending Verification'
                   check (status in ('Pending Verification','Weaving / Preparing','Shipped','Delivered')),
  delivery_address text,
  payment_method   text check (payment_method in ('Escrow Bank Transfer','Card Payment','Artisan Direct COD')),
  payment_ref      text,
  payment_verified boolean default false,
  loom_note        text,
  payout_released  boolean default false,
  payout_date      date,
  producer_names   text[],
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);


-- ============================================================
-- 5. ORDER ITEMS
-- ============================================================
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    text references public.orders(id) on delete cascade,
  cloth_id    text references public.cloths(id) on delete set null,
  producer_id text,            -- denormalized from the cloth so a weaver can query "my orders"
  cloth_title text,
  quantity    integer not null default 1,
  price_ngn   integer not null,
  price_usd   integer not null,
  custom_note text,
  created_at  timestamptz default now()
);


-- ============================================================
-- 6. CUSTOM COMMISSIONS
-- ============================================================
create table public.commissions (
  id                   text primary key,
  buyer_id             uuid references public.profiles(id) on delete set null,
  buyer_name           text not null,
  buyer_contact        text,
  producer_id          text references public.producers(id) on delete set null,
  producer_name        text,
  desired_motif        text,
  occasion             text,
  colors               text,
  estimated_budget_ngn integer,
  target_date          date,
  notes                text,
  status               text default 'Requested'
                       check (status in ('Requested','In Discussion','Loom Warped','Completed')),
  weaver_progress_note text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);


-- ============================================================
-- 7. MESSAGES
-- ============================================================
create table public.messages (
  id            uuid primary key default uuid_generate_v4(),
  sender_id     uuid references public.profiles(id) on delete set null,
  sender_name   text not null,
  sender_role   text check (sender_role in ('buyer','producer','admin')),
  receiver_id   uuid references public.profiles(id) on delete set null,
  receiver_name text not null,
  cloth_id      text references public.cloths(id) on delete set null,
  cloth_title   text,
  text          text not null,
  read          boolean default false,
  acting_on_behalf_of text,
  created_at    timestamptz default now()
);


-- ============================================================
-- 8. APP SETTINGS (singleton — exchange rate, cooperative bank details)
-- ============================================================
create table public.app_settings (
  id            integer primary key default 1 check (id = 1),
  ngn_per_usd   numeric(10,2) not null default 1600,
  bank_details  text,
  updated_at    timestamptz default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;


-- ============================================================
-- INDEXES
-- ============================================================
create index idx_cloths_producer_id      on public.cloths(producer_id);
create index idx_cloths_category         on public.cloths(category);
create index idx_cloths_in_stock         on public.cloths(in_stock);
create index idx_producers_profile_id    on public.producers(profile_id);
create index idx_producers_status        on public.producers(status);
create index idx_orders_buyer_id         on public.orders(buyer_id);
create index idx_orders_status           on public.orders(status);
create index idx_order_items_order_id    on public.order_items(order_id);
create index idx_order_items_producer_id on public.order_items(producer_id);
create index idx_commissions_buyer_id    on public.commissions(buyer_id);
create index idx_commissions_producer_id on public.commissions(producer_id);
create index idx_messages_sender_id      on public.messages(sender_id);
create index idx_messages_receiver_id    on public.messages(receiver_id);
create index idx_messages_read           on public.messages(read);


-- ============================================================
-- HELPER FUNCTIONS (security definer → bypass RLS, used inside policies)
-- They read profiles/producers but are only referenced in policies on OTHER
-- tables, so there is no RLS recursion.
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- The producers.id linked to the current auth user (null for buyers/anon).
create or replace function public.current_producer_id()
returns text language sql security definer stable as $$
  select producer_id from public.profiles where id = auth.uid();
$$;

-- True only when the current user is a producer whose weaver account is active.
create or replace function public.is_active_producer()
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.profiles pr
    join public.producers pd on pd.id = pr.producer_id
    where pr.id = auth.uid() and pr.role = 'producer' and pd.status = 'active'
  );
$$;


-- ============================================================
-- TRIGGERS (updated_at + producer privilege guard)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_producers_updated_at   before update on public.producers    for each row execute procedure public.set_updated_at();
create trigger trg_cloths_updated_at      before update on public.cloths       for each row execute procedure public.set_updated_at();
create trigger trg_orders_updated_at      before update on public.orders       for each row execute procedure public.set_updated_at();
create trigger trg_commissions_updated_at before update on public.commissions  for each row execute procedure public.set_updated_at();
create trigger trg_settings_updated_at    before update on public.app_settings for each row execute procedure public.set_updated_at();

-- A producer may edit their own weaver profile, but may NOT change their own
-- status (self-approve) or re-link profile_id. Admins may change anything.
create or replace function public.guard_producer_privileged()
returns trigger language plpgsql security definer as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.profile_id := old.profile_id;
  end if;
  return new;
end;
$$;

create trigger trg_producers_guard before update on public.producers
  for each row execute procedure public.guard_producer_privileged();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.producers    enable row level security;
alter table public.cloths       enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.commissions  enable row level security;
alter table public.messages     enable row level security;
alter table public.app_settings enable row level security;

-- PROFILES
create policy "Users view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select using (public.is_admin());
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins update profiles"   on public.profiles for update using (public.is_admin());

-- PRODUCERS — public sees active weavers; a weaver sees their own (even pending); admins see all
create policy "Public views active producers" on public.producers for select
  using (status = 'active' or id = public.current_producer_id() or public.is_admin());
create policy "Producers update own row"      on public.producers for update
  using (id = public.current_producer_id());
create policy "Admins manage producers"       on public.producers for all
  using (public.is_admin()) with check (public.is_admin());

-- CLOTHS — public read; active producers manage their own; admins manage all
create policy "Anyone views cloths"         on public.cloths for select using (true);
create policy "Producers manage own cloths" on public.cloths for all
  using (producer_id = public.current_producer_id() and public.is_active_producer())
  with check (producer_id = public.current_producer_id() and public.is_active_producer());
create policy "Admins manage cloths"        on public.cloths for all
  using (public.is_admin()) with check (public.is_admin());

-- ORDERS
create policy "Buyers view own orders"     on public.orders for select using (auth.uid() = buyer_id);
create policy "Buyers insert orders"       on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Producers view their orders" on public.orders for select
  using (id in (select order_id from public.order_items where producer_id = public.current_producer_id()));
create policy "Producers update their orders" on public.orders for update
  using (id in (select order_id from public.order_items where producer_id = public.current_producer_id()));
create policy "Admins manage all orders"   on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

-- ORDER ITEMS
create policy "Buyers view own items"           on public.order_items for select
  using (order_id in (select id from public.orders where buyer_id = auth.uid()));
create policy "Buyers insert items for own orders" on public.order_items for insert
  with check (order_id in (select id from public.orders where buyer_id = auth.uid()));
create policy "Producers view their items"      on public.order_items for select
  using (producer_id = public.current_producer_id());
create policy "Admins manage order items"       on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

-- COMMISSIONS
create policy "Buyers view own comms"          on public.commissions for select using (auth.uid() = buyer_id);
create policy "Buyers insert commissions"      on public.commissions for insert with check (auth.uid() = buyer_id);
create policy "Producers view assigned comms"  on public.commissions for select
  using (producer_id = public.current_producer_id());
create policy "Producers update assigned comms" on public.commissions for update
  using (producer_id = public.current_producer_id());
create policy "Admins manage commissions"      on public.commissions for all
  using (public.is_admin()) with check (public.is_admin());

-- MESSAGES
create policy "Users view own messages"    on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Auth users send messages"   on public.messages for insert with check (auth.uid() = sender_id);
create policy "Admins manage messages"     on public.messages for all
  using (public.is_admin()) with check (public.is_admin());

-- APP SETTINGS
create policy "Anyone reads settings" on public.app_settings for select using (true);
create policy "Admins manage settings" on public.app_settings for all
  using (public.is_admin()) with check (public.is_admin());


-- ============================================================
-- REALTIME (live messaging + order / catalog / commission updates)
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.cloths;
alter publication supabase_realtime add table public.commissions;
