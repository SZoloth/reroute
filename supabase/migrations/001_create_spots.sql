create extension if not exists "pgcrypto";

create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  city text not null,
  timezone text,
  hours jsonb,
  tags text[] default '{}',
  submitted_by uuid references auth.users(id) on delete set null,
  upvotes integer not null default 0,
  status text not null default 'pending' check (status in ('approved','pending','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists spots_city_idx on public.spots(city);
create index if not exists spots_status_idx on public.spots(status);
