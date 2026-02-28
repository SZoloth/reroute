-- Run after migrations to verify RLS + policy coverage

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'spots', 'trips', 'spot_votes', 'spot_reports')
order by tablename;

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'spots', 'trips', 'spot_votes', 'spot_reports')
order by tablename, policyname;

-- sanity checks for helper function existence
select proname, prosecdef
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'is_admin';
