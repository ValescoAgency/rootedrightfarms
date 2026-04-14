-- Auto-promote known admin emails to the `admin` role when they sign up.
--
-- Problem: the seed in 20260414000007 calls grant_role_by_email() for each
-- admin, but that function silently no-ops when the auth.users row does not
-- yet exist. If a real human signs up after migrations are applied, they
-- land on /admin/forbidden until someone manually runs grant_role_by_email.
--
-- Fix: a SECURITY DEFINER trigger on auth.users that checks the new row's
-- email against a hardcoded allowlist and inserts the admin role if it
-- matches. Adding a new admin = a new migration, which keeps control gated
-- and auditable. Do NOT replace this with a public-writable table.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  admin_emails text[] := array[
    'jason@valescoagency.com',
    'jeff@rootedrightfarms.com'
  ];
begin
  if new.email is null then
    return new;
  end if;

  if lower(new.email) = any (select lower(e) from unnest(admin_emails) as e) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

comment on function public.handle_new_user() is
  'Auto-promotes hardcoded admin emails on signup. Extend the admin_emails array and ship a new migration to add an admin.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: promote any allowlisted user who already signed up but is
-- missing the admin role. Idempotent via the unique (user_id, role).
select public.grant_role_by_email('jason@valescoagency.com', 'admin');
select public.grant_role_by_email('jeff@rootedrightfarms.com', 'admin');
