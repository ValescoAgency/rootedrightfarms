-- user_roles: per-user capability flags. Keyed to auth.users so lifecycle
-- (delete, email change) follows automatically. A user may have multiple
-- roles (no unique composite constraint beyond (user_id, role)).

create type app_role as enum ('admin', 'submissions_viewer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index idx_user_roles_user on public.user_roles (user_id);
create index idx_user_roles_role on public.user_roles (role);

alter table public.user_roles enable row level security;

-- A user may read the roles assigned to them. No one else can read them
-- from a JWT — admin management happens via service_role only.
create policy select_user_roles_self
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

comment on policy select_user_roles_self on public.user_roles is
  'Authenticated users may read only their own role rows.';

-- INSERT/UPDATE/DELETE deliberately have no policy: only service_role
-- bypasses RLS, so role assignments must go through the admin CLI or a
-- migration. This prevents accidental self-promotion.

-- Helper function to promote a user by email. Runs under service_role
-- (the migration is applied as the owner). Safe to re-invoke.
create or replace function public.grant_role_by_email(
  user_email text,
  target_role app_role
) returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where lower(email) = lower(user_email) limit 1;
  if target_user_id is null then
    raise notice 'grant_role_by_email: no auth.users row for %', user_email;
    return;
  end if;
  insert into public.user_roles (user_id, role)
  values (target_user_id, target_role)
  on conflict (user_id, role) do nothing;
end;
$$;

revoke all on function public.grant_role_by_email(text, app_role) from public, anon, authenticated;

comment on function public.grant_role_by_email(text, app_role) is
  'Admin-only. Idempotent. Call from a migration or psql as service_role.';

-- Best-effort seed. Rows are created only if the user already signed in
-- (auth.users has the row). Otherwise the function returns with a notice
-- and we rely on post-signup manual promotion.
select public.grant_role_by_email('jeff@rootedrightfarms.com', 'admin');
select public.grant_role_by_email('jason@valescoagency.com', 'admin');
