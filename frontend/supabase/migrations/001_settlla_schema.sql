-- Settlla Kaduna Hub — Supabase schema (run in SQL editor or via CLI)

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  phone_number text,
  role text not null check (role in ('tenant', 'agent')),
  nin_number text,
  relocation_context text,
  agency_name text,
  accreditation text,
  mandate_count int default 0,
  verified_status text default 'verified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Listings (JSON body matches frontend Listing type)
create table if not exists public.listings (
  id text primary key,
  agent_id uuid references public.profiles (id) on delete set null,
  neighborhood text,
  body jsonb not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_published_idx on public.listings (is_published);

-- Tenancy agreements
create table if not exists public.agreements (
  agreement_id text primary key,
  listing_id text not null references public.listings (id) on delete cascade,
  tenant_user_id uuid references public.profiles (id) on delete set null,
  document jsonb not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agreements_tenant_idx on public.agreements (tenant_user_id);

-- Walkthrough bookings
create table if not exists public.bookings (
  booking_id text primary key,
  listing_id text not null,
  tenant_user_id uuid references public.profiles (id) on delete set null,
  slot_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists bookings_slot_unique on public.bookings (slot_id)
where slot_id is not null;

-- Payments
create table if not exists public.payment_transactions (
  transaction_id text primary key,
  tenant_user_id uuid references public.profiles (id) on delete set null,
  agreement_id text references public.agreements (agreement_id) on delete set null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Active tenant rental snapshot (dashboard + escrow)
create table if not exists public.tenant_rentals (
  rental_id text primary key,
  tenant_user_id uuid not null references public.profiles (id) on delete cascade,
  agreement_id text,
  listing_id text,
  payload jsonb not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tenant_rentals_user_idx on public.tenant_rentals (tenant_user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone_number, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone_number',
    coalesce(new.raw_user_meta_data->>'role', 'tenant')
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.agreements enable row level security;
alter table public.bookings enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.tenant_rentals enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

create policy "listings public read" on public.listings for select using (is_published = true);
create policy "listings agent insert" on public.listings for insert with check (auth.uid() = agent_id);
create policy "listings agent update" on public.listings for update using (auth.uid() = agent_id);

create policy "agreements tenant read" on public.agreements for select using (
  tenant_user_id = auth.uid() or tenant_user_id is null
);
create policy "agreements tenant write" on public.agreements for insert with check (auth.uid() = tenant_user_id or tenant_user_id is null);
create policy "agreements tenant update" on public.agreements for update using (
  tenant_user_id = auth.uid() or tenant_user_id is null
);

create policy "bookings tenant read" on public.bookings for select using (tenant_user_id = auth.uid() or tenant_user_id is null);
create policy "bookings tenant insert" on public.bookings for insert with check (true);

create policy "payments tenant read" on public.payment_transactions for select using (tenant_user_id = auth.uid());
create policy "payments tenant insert" on public.payment_transactions for insert with check (tenant_user_id = auth.uid());

create policy "rentals tenant read" on public.tenant_rentals for select using (tenant_user_id = auth.uid());
create policy "rentals tenant write" on public.tenant_rentals for all using (tenant_user_id = auth.uid());
