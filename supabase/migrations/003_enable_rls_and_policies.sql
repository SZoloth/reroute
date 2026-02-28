-- RLS + policies for Kidnap v1

-- helper
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.is_admin = true
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated, anon;

-- profiles
alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- spots
alter table public.spots enable row level security;

create policy "spots_select_accessible"
on public.spots
for select
to authenticated
using (
  status = 'approved'
  or submitted_by = auth.uid()
  or public.is_admin(auth.uid())
);

create policy "spots_insert_submitter_pending"
on public.spots
for insert
to authenticated
with check (
  submitted_by = auth.uid()
  and status = 'pending'
);

create policy "spots_admin_update"
on public.spots
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- allow authenticated users to update only upvotes column
revoke update on public.spots from authenticated;
grant update (upvotes) on public.spots to authenticated;

create policy "spots_upvote_update"
on public.spots
for update
to authenticated
using (status = 'approved')
with check (status = 'approved');

-- trips
alter table public.trips enable row level security;

create policy "trips_select_public_or_own"
on public.trips
for select
to authenticated
using (
  user_id = auth.uid()
  or is_public = true
);

create policy "trips_insert_own"
on public.trips
for insert
to authenticated
with check (user_id = auth.uid());

create policy "trips_update_own"
on public.trips
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- spot_votes
alter table public.spot_votes enable row level security;

create policy "spot_votes_select_authenticated"
on public.spot_votes
for select
to authenticated
using (true);

create policy "spot_votes_insert_own"
on public.spot_votes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "spot_votes_delete_own"
on public.spot_votes
for delete
to authenticated
using (user_id = auth.uid());

-- spot_reports
alter table public.spot_reports enable row level security;

create policy "spot_reports_select_own_or_admin"
on public.spot_reports
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin(auth.uid())
);

create policy "spot_reports_insert_own"
on public.spot_reports
for insert
to authenticated
with check (user_id = auth.uid());
