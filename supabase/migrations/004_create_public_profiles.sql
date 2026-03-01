-- Public profile projection for feed/social surfaces
-- Contains only non-sensitive fields from profiles

create table if not exists public.public_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  name text,
  avatar_url text,
  city text,
  updated_at timestamptz not null default now()
);

-- Backfill existing rows
insert into public.public_profiles (id, name, avatar_url, city)
select p.id, p.name, p.avatar_url, p.city
from public.profiles p
on conflict (id) do update
set
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  city = excluded.city,
  updated_at = now();

-- Keep projection in sync with profiles
create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.public_profiles where id = old.id;
    return old;
  end if;

  insert into public.public_profiles (id, name, avatar_url, city, updated_at)
  values (new.id, new.name, new.avatar_url, new.city, now())
  on conflict (id) do update
  set
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    city = excluded.city,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists profiles_sync_public_profile on public.profiles;
create trigger profiles_sync_public_profile
after insert or update of name, avatar_url, city or delete
on public.profiles
for each row
execute function public.sync_public_profile();

-- Public-readable to authenticated users only
alter table public.public_profiles enable row level security;

drop policy if exists "public_profiles_select_authenticated" on public.public_profiles;
create policy "public_profiles_select_authenticated"
on public.public_profiles
for select
to authenticated
using (true);
