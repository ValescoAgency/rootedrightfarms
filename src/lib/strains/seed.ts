import type { Strain } from "./types";

/**
 * Mirror of the seed migration at supabase/migrations/20260414000002_seed_strains.sql.
 * Used as the fallback catalog when Supabase is unreachable (local dev
 * without `supabase start`, build time before DB is provisioned) and as
 * the fixture for repository unit tests.
 *
 * TODO(content): replace placeholder copy + images for Banana Candy, Pine
 * Bud, and TropicanaCookies once client delivers final content.
 */
export const seedStrains: Strain[] = [
  {
    id: "seed-pie-hoe",
    slug: "pie-hoe",
    name: "Pie Hoe",
    type: "hybrid",
    thcPct: 26.4,
    cbdPct: 0.1,
    description:
      "A dense, resin-caked flower with a layered aroma of cherry pastry, earth, and spice. Pie Hoe is our flagship — a slow, meditative high paired with a sweet, fruit-forward smoke.",
    lineage: "Grape Pie × Tahoe OG",
    flavors: ["cherry", "earth", "spice", "vanilla"],
    effects: ["relaxed", "euphoric", "creative"],
    heroImageUrl: "/images/strains/pie-hoe-card-desktop.jpg",
    galleryImageUrls: [],
    isPublished: true,
    createdAt: "2026-04-14T00:00:00Z",
    updatedAt: "2026-04-14T00:00:00Z",
  },
  {
    id: "seed-banana-candy",
    slug: "banana-candy",
    name: "Banana Candy",
    type: "hybrid",
    thcPct: 24.1,
    cbdPct: 0.08,
    description:
      "Tropical, sweet, and unmistakably banana on the nose. A crowd favorite for relaxed afternoons.",
    lineage: "Banana OG × Candyland",
    flavors: ["banana", "tropical", "sweet"],
    effects: ["relaxed", "happy", "uplifted"],
    heroImageUrl: "/images/strains/banana-candy-card-desktop.jpg",
    galleryImageUrls: [],
    isPublished: true,
    createdAt: "2026-04-14T00:00:00Z",
    updatedAt: "2026-04-14T00:00:00Z",
  },
  {
    id: "seed-pine-bud",
    slug: "pine-bud",
    name: "Pine Bud",
    type: "sativa",
    thcPct: 22.8,
    cbdPct: 0.05,
    description:
      "Bright pine and citrus with a clean, energetic ceiling. Good daytime company.",
    lineage: "Jack Herer × Sour Pine",
    flavors: ["pine", "citrus", "earth"],
    effects: ["energetic", "focused", "uplifted"],
    heroImageUrl: "/images/strains/pine-bud-card-desktop.jpg",
    galleryImageUrls: [],
    isPublished: true,
    createdAt: "2026-04-14T00:00:00Z",
    updatedAt: "2026-04-14T00:00:00Z",
  },
  {
    id: "seed-tropicana-cookies",
    slug: "tropicana-cookies",
    name: "TropicanaCookies",
    type: "hybrid",
    thcPct: 25.7,
    cbdPct: 0.07,
    description:
      "Orange zest over a warm cookie base. Balanced high that trades off energy for ease over the session.",
    lineage: "Tropicana × GSC",
    flavors: ["orange", "citrus", "cookie"],
    effects: ["relaxed", "creative", "happy"],
    heroImageUrl: "/images/strains/tropicana-cookies-card-desktop.jpg",
    galleryImageUrls: [],
    isPublished: true,
    createdAt: "2026-04-14T00:00:00Z",
    updatedAt: "2026-04-14T00:00:00Z",
  },
];
