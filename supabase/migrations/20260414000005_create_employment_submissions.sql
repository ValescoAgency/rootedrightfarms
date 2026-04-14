-- Employment submissions. Sensitive columns (DOB, felony disclosure and
-- explanation, arrests disclosure) are encrypted at rest via pgcrypto using
-- a symmetric key loaded into a connection-local setting by the application
-- (service role only). Public INSERTs go through the server-side encrypt()
-- helper so anon can never read plaintext. Admin-only decrypt() enforces
-- the JWT role claim and raises if the key is missing.

create type education_level as enum (
  'less_than_high_school',
  'high_school',
  'some_college',
  'associate',
  'bachelor',
  'master',
  'doctorate'
);

create type employment_status as enum ('new', 'reviewed', 'archived');

create table public.employment_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  dob bytea not null,
  phone text not null,
  email text,
  mailing_address text not null,
  is_us_citizen boolean not null,
  is_authorized_to_work boolean,
  has_felony bytea not null,
  felony_explanation bytea,
  education education_level not null,
  military_service text,
  arrests_disclosure bytea not null,
  status employment_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_employment_submissions_status_created
  on public.employment_submissions (status, created_at desc);

create trigger employment_submissions_touch_updated_at
  before update on public.employment_submissions
  for each row execute function public.tg_touch_updated_at();

alter table public.employment_submissions enable row level security;

create policy insert_employment_submissions_anon
  on public.employment_submissions
  for insert
  to anon
  with check (true);

create policy select_employment_submissions_admin
  on public.employment_submissions
  for select
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

create policy update_employment_submissions_admin
  on public.employment_submissions
  for update
  to authenticated
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

comment on policy insert_employment_submissions_anon on public.employment_submissions is
  'Public employment form. Encrypted columns written as pgp_sym_encrypt ciphertext.';
comment on policy select_employment_submissions_admin on public.employment_submissions is
  'Admin inbox read; decrypt via employment_decrypt(col) which checks role.';
comment on policy update_employment_submissions_admin on public.employment_submissions is
  'Admin status transitions.';

-- Encryption helpers.
-- The key is sourced from current_setting('app.employment_key') which the
-- application sets at the start of each privileged session. When the setting
-- is missing these functions raise instead of silently returning nonsense.

create or replace function public.employment_encrypt(plaintext text)
returns bytea
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  k text;
begin
  if plaintext is null then return null; end if;
  k := current_setting('app.employment_key', true);
  if k is null or length(k) < 16 then
    raise exception 'employment_encrypt: app.employment_key is not configured';
  end if;
  return pgp_sym_encrypt(plaintext, k);
end;
$$;

create or replace function public.employment_decrypt(ciphertext bytea)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  k text;
begin
  if ciphertext is null then return null; end if;
  if coalesce((auth.jwt() ->> 'role'), '') <> 'admin' then
    raise exception 'employment_decrypt: admin role required';
  end if;
  k := current_setting('app.employment_key', true);
  if k is null or length(k) < 16 then
    raise exception 'employment_decrypt: app.employment_key is not configured';
  end if;
  return pgp_sym_decrypt(ciphertext, k);
end;
$$;

-- anon may call encrypt (to insert) but never decrypt.
revoke all on function public.employment_decrypt(bytea) from public, anon;
grant execute on function public.employment_decrypt(bytea) to authenticated;

grant execute on function public.employment_encrypt(text) to anon, authenticated;

comment on function public.employment_encrypt(text) is
  'Encrypt PII for employment_submissions. Requires app.employment_key set on the session.';
comment on function public.employment_decrypt(bytea) is
  'Decrypt employment PII. Requires JWT role=admin AND app.employment_key set.';
