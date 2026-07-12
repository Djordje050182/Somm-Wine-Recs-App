-- Somm cloud sync schema (Supabase / Postgres)
-- Run in the Supabase SQL editor when standing up the production database.
--
-- Design: the app keeps working offline-first from localStorage; when a user
-- is signed in, known state keys are mirrored here (push on change, pull on
-- sign-in). One row per (user, key) keeps the sync surface tiny and lets the
-- client stay the source of truth for shape.

create table if not exists public.user_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,                  -- e.g. 'sommTastings', 'sommFavWines'
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

create policy "own state read"  on public.user_state for select using (auth.uid() = user_id);
create policy "own state write" on public.user_state for insert with check (auth.uid() = user_id);
create policy "own state update" on public.user_state for update using (auth.uid() = user_id);
create policy "own state delete" on public.user_state for delete using (auth.uid() = user_id);

-- Winery portal: which user manages which estate (assigned manually at first).
create table if not exists public.partner_estates (
  user_id uuid not null references auth.users (id) on delete cascade,
  winery_id text not null,            -- 'mr-edwards'
  region_id text not null,            -- 'margaret-river'
  role text not null default 'owner',
  primary key (user_id, winery_id)
);

alter table public.partner_estates enable row level security;
create policy "own estates read" on public.partner_estates for select using (auth.uid() = user_id);

-- Portal listing overrides + partner wines + uploaded images, published to
-- every visitor (public read), writable only by the estate's manager.
create table if not exists public.partner_content (
  winery_id text primary key,
  region_id text not null,
  listing jsonb,                      -- Partial<Winery> patch
  wines jsonb,                        -- WineDetail[]
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

alter table public.partner_content enable row level security;
create policy "public listing read" on public.partner_content for select using (true);
create policy "manager write" on public.partner_content
  for all using (
    exists (
      select 1 from public.partner_estates pe
      where pe.user_id = auth.uid() and pe.winery_id = partner_content.winery_id
    )
  );

-- Storage bucket for portal photo/logo uploads (run once):
--   select storage.create_bucket('estate-media', public => true);
