-- Run after migrations to verify RLS + policy coverage

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'public_profiles', 'spots', 'trips', 'spot_votes', 'spot_reports')
order by tablename;

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'public_profiles', 'spots', 'trips', 'spot_votes', 'spot_reports')
order by tablename, policyname;

-- sanity checks for helper function existence
select proname, prosecdef
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('is_admin', 'sync_public_profile')
order by proname;

-- ensure sync trigger exists on profiles
select trigger_name, event_object_table, action_timing, event_manipulation
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'profiles'
  and trigger_name = 'profiles_sync_public_profile';
