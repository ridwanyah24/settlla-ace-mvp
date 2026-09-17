-- Agent visibility, listing bootstrap, and booking reads
-- Run in the Supabase SQL editor after 001_settlla_schema.sql

-- Agents can read / update all agreements (counter-sign queue)
drop policy if exists "agreements agent read" on public.agreements;
create policy "agreements agent read" on public.agreements for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent')
);

drop policy if exists "agreements agent update" on public.agreements;
create policy "agreements agent update" on public.agreements for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent')
);

-- Agents can read walkthrough bookings
drop policy if exists "bookings agent read" on public.bookings;
create policy "bookings agent read" on public.bookings for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent')
);

-- Agents can insert listings they own
drop policy if exists "listings agent insert" on public.listings;
create policy "listings agent insert" on public.listings for insert with check (
  auth.uid() = agent_id or (
    agent_id is null and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent'
    )
  )
);

-- Bootstrap catalog once (callable by anon so the homepage can populate)
create or replace function public.seed_listings_if_empty(rows jsonb)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted int := 0;
  rec jsonb;
begin
  if exists (select 1 from public.listings) then
    return 0;
  end if;

  for rec in select * from jsonb_array_elements(rows)
  loop
    insert into public.listings (id, neighborhood, body, is_published)
    values (
      rec->>'id',
      rec->>'neighborhood',
      rec->'body',
      true
    )
    on conflict (id) do nothing;
    inserted := inserted + 1;
  end loop;

  return inserted;
end;
$$;

revoke all on function public.seed_listings_if_empty(jsonb) from public;
grant execute on function public.seed_listings_if_empty(jsonb) to anon, authenticated;

drop policy if exists "bookings tenant delete" on public.bookings;
create policy "bookings tenant delete" on public.bookings for delete using (tenant_user_id = auth.uid());

drop policy if exists "rentals agent read" on public.tenant_rentals;
create policy "rentals agent read" on public.tenant_rentals for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent')
);

drop policy if exists "payments agent read" on public.payment_transactions;
create policy "payments agent read" on public.payment_transactions for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'agent')
);
