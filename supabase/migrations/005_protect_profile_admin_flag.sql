-- profiles.is_admin is trusted by public.is_admin(), the admin page and the
-- spot moderation API. RLS on profiles checks only row ownership, so the flag
-- must not be writable through the API roles. Admins are granted from the
-- Supabase dashboard / SQL editor (postgres) or with the service role.

create or replace function public.protect_profile_admin_flag()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' and new.is_admin then
      raise exception 'is_admin cannot be set by this role'
        using errcode = '42501';
    end if;

    if tg_op = 'UPDATE' and new.is_admin is distinct from old.is_admin then
      raise exception 'is_admin cannot be changed by this role'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_flag on public.profiles;
create trigger profiles_protect_admin_flag
before insert or update on public.profiles
for each row
execute function public.protect_profile_admin_flag();
