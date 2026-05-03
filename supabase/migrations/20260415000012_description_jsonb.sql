-- Migrate the strains.description column from text (HTML) to jsonb (TipTap
-- document JSON).  Existing rows hold placeholder HTML copy that cannot be
-- auto-converted to the TipTap node format, so they are cleared.  Admins
-- should re-enter descriptions through the editor after this migration runs.

alter table public.strains
  add column description_json jsonb;

update public.strains
  set description_json = null;

alter table public.strains
  drop column description;

alter table public.strains
  rename column description_json to description;
