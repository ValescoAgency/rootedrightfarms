-- submission_access_log: audit trail for every admin view of a decrypted
-- employment submission. Append-only — no UPDATE or DELETE policy means
-- rows can only be written via server-role context after requireRole
-- (see src/app/admin/submissions/audit.ts).

create type submission_kind as enum ('contact', 'employment');

create table public.submission_access_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users (id) on delete set null,
  submission_kind submission_kind not null,
  submission_id uuid not null,
  action text not null,
  accessed_at timestamptz not null default now()
);

create index idx_submission_access_log_submission
  on public.submission_access_log (submission_kind, submission_id, accessed_at desc);
create index idx_submission_access_log_actor
  on public.submission_access_log (actor_user_id, accessed_at desc);

alter table public.submission_access_log enable row level security;

create policy select_access_log_admin
  on public.submission_access_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- INSERT happens via service_role only (the admin page action writes the
-- row using the service-role client). No INSERT policy for anon/authenticated.

comment on policy select_access_log_admin on public.submission_access_log is
  'Admins can inspect who accessed which PII record. Append-only by design.';
