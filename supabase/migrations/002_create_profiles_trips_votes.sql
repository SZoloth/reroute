create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  home_latitude double precision,
  home_longitude double precision,
  city text,
  budget_max integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  status text not null default 'ride_clicked' check (status in ('suggested','ride_clicked','completed')),
  rating integer check (rating between 1 and 5),
  notes text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.spot_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create table if not exists public.spot_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_spot_id_idx on public.trips(spot_id);
