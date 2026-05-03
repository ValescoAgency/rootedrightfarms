-- Contact submissions: single table for every inquiry routed through /contact.
-- Dispensary-registration rows include license + address; other inquiry types
-- leave those columns null.

create type inquiry_type as enum (
  'wholesale',
  'dispensary-registration',
  'nursery-design',
  'tissue-cultures',
  'general'
);

create type submission_status as enum ('new', 'read', 'archived');

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  inquiry_type inquiry_type not null,
  name text not null,
  email text not null,
  phone text,
  company text,
  license_number text,
  address text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  status submission_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contact_submissions_status_created
  on public.contact_submissions (status, created_at desc);
create index idx_contact_submissions_inquiry_type
  on public.contact_submissions (inquiry_type);

create trigger contact_submissions_touch_updated_at
  before update on public.contact_submissions
  for each row execute function public.tg_touch_updated_at();

alter table public.contact_submissions enable row level security;

-- anon role may INSERT (the public form). It may not read back what it wrote.
create policy insert_contact_submissions_anon
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- Admins (JWT role claim) can see and update submissions. No one can delete;
-- archive via status = 'archived' instead.
create policy select_contact_submissions_admin
  on public.contact_submissions
  for select
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

create policy update_contact_submissions_admin
  on public.contact_submissions
  for update
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

comment on policy insert_contact_submissions_anon on public.contact_submissions is
  'Public form submissions. No SELECT follows — the server action reads nothing back.';
comment on policy select_contact_submissions_admin on public.contact_submissions is
  'Admin inbox read — JWT role = admin.';
comment on policy update_contact_submissions_admin on public.contact_submissions is
  'Admin inbox state transitions (new → read → archived).';
