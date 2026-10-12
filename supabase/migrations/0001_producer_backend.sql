-- ============================================================
-- Akwete Luxe — Migration 0001: Producer backend + security hardening
-- ============================================================
-- Safe to run on a database that ALREADY has the original schema.
-- Idempotent: every statement can be re-run without error.
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- What it does:
--   • Fixes the signup privilege-escalation hole (role is forced to 'buyer')
--   • Links weaver accounts to auth users + adds an approval workflow
--   • Grants producers RLS access to their own cloths/orders/commissions
--   • Adds updated_at triggers, an app_settings table, and tighter policies
-- ============================================================

-- ── 1. New columns ─────────────────────────────────────────
alter table public.profiles    add column if not exists avatar_url text;

alter table public.producers   add column if not exists profile_id uuid references public.profiles(id) on delete set null;
alter table public.producers   add column if not exists status     text not null default 'active';
alter table public.producers   add column if not exists email      text;

alter table public.order_items add column if not exists producer_id text;

-- status check constraint (add once)
do $$ begin
  alter table public.producers
    add constraint producers_status_check check (status in ('pending','active','suspended'));
exception when duplicate_object then null; end $$;

-- Backfill order_items.producer_id from the linked cloth
update public.order_items oi
set producer_id = c.producer_id
from public.cloths c
where oi.cloth_id = c.id and oi.producer_id is null;


-- ── 2. app_settings (singleton) ────────────────────────────
create table if not exists public.app_settings (
  id            integer primary key default 1 check (id = 1),
  ngn_per_usd   numeric(10,2) not null default 1600,
  bank_details  text,
  updated_at    timestamptz default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;


-- ── 3. SECURITY FIX: signup trigger never trusts client role ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'buyer'   -- never trust a client-supplied role
  );
  return new;
end;
$$;


-- ── 4. Helper functions ────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.current_producer_id()
returns text language sql security definer stable as $$
  select producer_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_active_producer()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles pr
    join public.producers pd on pd.id = pr.producer_id
    where pr.id = auth.uid() and pr.role = 'producer' and pd.status = 'active'
  );
$$;


-- ── 5. updated_at triggers ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists trg_producers_updated_at   on public.producers;
drop trigger if exists trg_cloths_updated_at      on public.cloths;
drop trigger if exists trg_orders_updated_at      on public.orders;
drop trigger if exists trg_commissions_updated_at on public.commissions;
drop trigger if exists trg_settings_updated_at    on public.app_settings;
create trigger trg_producers_updated_at   before update on public.producers    for each row execute procedure public.set_updated_at();
create trigger trg_cloths_updated_at      before update on public.cloths       for each row execute procedure public.set_updated_at();
create trigger trg_orders_updated_at      before update on public.orders       for each row execute procedure public.set_updated_at();
create trigger trg_commissions_updated_at before update on public.commissions  for each row execute procedure public.set_updated_at();
create trigger trg_settings_updated_at    before update on public.app_settings for each row execute procedure public.set_updated_at();


-- ── 6. Producer privilege guard ────────────────────────────
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
drop trigger if exists trg_producers_guard on public.producers;
create trigger trg_producers_guard before update on public.producers
  for each row execute procedure public.guard_producer_privileged();


-- ── 7. RLS: enable + (re)create policies ───────────────────
alter table public.profiles     enable row level security;
alter table public.producers    enable row level security;
alter table public.cloths       enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.commissions  enable row level security;
alter table public.app_settings enable row level security;

-- PROFILES
drop policy if exists "Users view own profile"   on public.profiles;
drop policy if exists "Admins view all profiles" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admins update profiles"   on public.profiles;
create policy "Users view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select using (public.is_admin());
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins update profiles"   on public.profiles for update using (public.is_admin());

-- PRODUCERS
drop policy if exists "Anyone views producers"        on public.producers;
drop policy if exists "Public views active producers" on public.producers;
drop policy if exists "Producers update own row"      on public.producers;
drop policy if exists "Admins manage producers"       on public.producers;
create policy "Public views active producers" on public.producers for select
  using (status = 'active' or id = public.current_producer_id() or public.is_admin());
create policy "Producers update own row"      on public.producers for update
  using (id = public.current_producer_id());
create policy "Admins manage producers"       on public.producers for all
  using (public.is_admin()) with check (public.is_admin());

-- CLOTHS
drop policy if exists "Anyone views cloths"         on public.cloths;
drop policy if exists "Producers manage own cloths" on public.cloths;
drop policy if exists "Admins manage cloths"        on public.cloths;
create policy "Anyone views cloths"         on public.cloths for select using (true);
create policy "Producers manage own cloths" on public.cloths for all
  using (producer_id = public.current_producer_id() and public.is_active_producer())
  with check (producer_id = public.current_producer_id() and public.is_active_producer());
create policy "Admins manage cloths"        on public.cloths for all
  using (public.is_admin()) with check (public.is_admin());

-- ORDERS
drop policy if exists "Buyers view own orders"       on public.orders;
drop policy if exists "Buyers insert orders"         on public.orders;
drop policy if exists "Producers view their orders"  on public.orders;
drop policy if exists "Producers update their orders" on public.orders;
drop policy if exists "Admins manage all orders"     on public.orders;
create policy "Buyers view own orders"       on public.orders for select using (auth.uid() = buyer_id);
create policy "Buyers insert orders"         on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Producers view their orders"  on public.orders for select
  using (id in (select order_id from public.order_items where producer_id = public.current_producer_id()));
create policy "Producers update their orders" on public.orders for update
  using (id in (select order_id from public.order_items where producer_id = public.current_producer_id()));
create policy "Admins manage all orders"     on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

-- ORDER ITEMS
drop policy if exists "Buyers view own items"            on public.order_items;
drop policy if exists "Insert order items"               on public.order_items;
drop policy if exists "Buyers insert items for own orders" on public.order_items;
drop policy if exists "Producers view their items"       on public.order_items;
drop policy if exists "Admins manage order items"        on public.order_items;
create policy "Buyers view own items"            on public.order_items for select
  using (order_id in (select id from public.orders where buyer_id = auth.uid()));
create policy "Buyers insert items for own orders" on public.order_items for insert
  with check (order_id in (select id from public.orders where buyer_id = auth.uid()));
create policy "Producers view their items"       on public.order_items for select
  using (producer_id = public.current_producer_id());
create policy "Admins manage order items"        on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

-- COMMISSIONS
drop policy if exists "Buyers view own comms"           on public.commissions;
drop policy if exists "Buyers insert commissions"       on public.commissions;
drop policy if exists "Producers view assigned comms"   on public.commissions;
drop policy if exists "Producers update assigned comms" on public.commissions;
drop policy if exists "Admins manage commissions"       on public.commissions;
create policy "Buyers view own comms"           on public.commissions for select using (auth.uid() = buyer_id);
create policy "Buyers insert commissions"       on public.commissions for insert with check (auth.uid() = buyer_id);
create policy "Producers view assigned comms"   on public.commissions for select
  using (producer_id = public.current_producer_id());
create policy "Producers update assigned comms" on public.commissions for update
  using (producer_id = public.current_producer_id());
create policy "Admins manage commissions"       on public.commissions for all
  using (public.is_admin()) with check (public.is_admin());

-- APP SETTINGS
drop policy if exists "Anyone reads settings"  on public.app_settings;
drop policy if exists "Admins manage settings" on public.app_settings;
create policy "Anyone reads settings"  on public.app_settings for select using (true);
create policy "Admins manage settings" on public.app_settings for all
  using (public.is_admin()) with check (public.is_admin());


-- ── 8. Realtime (guarded — skip tables already in the publication) ──
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='cloths') then
    alter publication supabase_realtime add table public.cloths;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='commissions') then
    alter publication supabase_realtime add table public.commissions;
  end if;
end $$;
