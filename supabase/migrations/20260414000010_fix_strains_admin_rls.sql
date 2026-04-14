-- Fix strains admin RLS policies to use public.user_roles instead of a JWT
-- custom claim.
--
-- Original policies in 20260414000001 checked `auth.jwt() ->> 'role' = 'admin'`,
-- which would require a Supabase Auth Hook to inject the claim on every
-- token refresh. That hook was never wired, so authenticated admin
-- sessions were unable to mutate strains even though requireRole passed
-- at the application layer.
--
-- This migration realigns the strains table with the pattern used by the
-- strain-images storage bucket (20260414000008) and the user_roles table
-- itself (20260414000007): check membership in public.user_roles directly.

drop policy if exists select_strains_admin on public.strains;
drop policy if exists insert_strains_admin on public.strains;
drop policy if exists update_strains_admin on public.strains;
drop policy if exists delete_strains_admin on public.strains;

-- Admins see every row regardless of publication state so the admin
-- editor can list drafts.
create policy select_strains_admin
  on public.strains
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

create policy insert_strains_admin
  on public.strains
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

create policy update_strains_admin
  on public.strains
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

create policy delete_strains_admin
  on public.strains
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

comment on policy select_strains_admin on public.strains is
  'Admins (public.user_roles.role=admin) read every row including drafts.';
comment on policy insert_strains_admin on public.strains is
  'Admin-only insert. RLS enforces membership in public.user_roles.';
comment on policy update_strains_admin on public.strains is
  'Admin-only update. RLS enforces membership in public.user_roles.';
comment on policy delete_strains_admin on public.strains is
  'Admin-only delete. RLS enforces membership in public.user_roles.';
