-- strain-images: public read, admin-only write via storage RLS.
-- Admins are identified by the same (JWT role = admin) predicate used on
-- the strains/submissions tables.

insert into storage.buckets (id, name, public)
values ('strain-images', 'strain-images', true)
on conflict (id) do nothing;

-- Public can read objects in this bucket (bucket is public anyway; the
-- policy is belt + suspenders).
create policy select_strain_images_public
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'strain-images');

-- Admins (JWT role claim via user_roles OR a session custom claim) can
-- upload/update/delete. We check the user_roles membership directly so a
-- missing/forged JWT claim can't grant access.
create policy insert_strain_images_admin
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'strain-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

create policy update_strain_images_admin
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'strain-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (bucket_id = 'strain-images');

create policy delete_strain_images_admin
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'strain-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );
