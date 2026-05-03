-- Launch seed: 4 strains matching the legacy site.
-- Pie Hoe ships with real copy. Other three have placeholder copy pending
-- client content delivery (flagged with TODO in the TS mirror).

insert into public.strains (slug, name, type, thc_pct, cbd_pct, description, lineage, flavors, effects, hero_image_url, gallery_image_urls, is_published)
values
  (
    'pie-hoe',
    'Pie Hoe',
    'hybrid',
    26.40,
    0.10,
    'A dense, resin-caked flower with a layered aroma of cherry pastry, earth, and spice. Pie Hoe is our flagship — a slow, meditative high paired with a sweet, fruit-forward smoke.',
    'Grape Pie × Tahoe OG',
    array['cherry', 'earth', 'spice', 'vanilla'],
    array['relaxed', 'euphoric', 'creative'],
    '/images/strains/pie-hoe.jpg',
    '{}',
    true
  ),
  (
    'banana-candy',
    'Banana Candy',
    'hybrid',
    24.10,
    0.08,
    'Tropical, sweet, and unmistakably banana on the nose. A crowd favorite for relaxed afternoons.',
    'Banana OG × Candyland',
    array['banana', 'tropical', 'sweet'],
    array['relaxed', 'happy', 'uplifted'],
    '/images/strains/banana-candy.jpg',
    '{}',
    true
  ),
  (
    'pine-bud',
    'Pine Bud',
    'sativa',
    22.80,
    0.05,
    'Bright pine and citrus with a clean, energetic ceiling. Good daytime company.',
    'Jack Herer × Sour Pine',
    array['pine', 'citrus', 'earth'],
    array['energetic', 'focused', 'uplifted'],
    '/images/strains/pine-bud.jpg',
    '{}',
    true
  ),
  (
    'tropicana-cookies',
    'TropicanaCookies',
    'hybrid',
    25.70,
    0.07,
    'Orange zest over a warm cookie base. Balanced high that trades off energy for ease over the session.',
    'Tropicana × GSC',
    array['orange', 'citrus', 'cookie'],
    array['relaxed', 'creative', 'happy'],
    '/images/strains/tropicana-cookies.jpg',
    '{}',
    true
  )
on conflict (slug) do nothing;
