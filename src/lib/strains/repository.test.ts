import { describe, it, expect } from "vitest";
import { createInMemoryStrainRepository } from "./repository";
import type { Strain } from "./types";

const fixture: Strain[] = [
  base("a", "indica", true),
  base("b", "sativa", true),
  base("c", "sativa", true),
  base("d", "hybrid", true),
  base("draft", "hybrid", false),
];

function base(slug: string, type: Strain["type"], isPublished: boolean): Strain {
  return {
    id: `id-${slug}`,
    slug,
    name: slug.toUpperCase(),
    type,
    thcPct: 20,
    cbdPct: 0,
    description: null,
    lineage: null,
    flavors: [],
    effects: [],
    heroImageUrl: null,
    galleryImageUrls: [],
    isPublished,
    createdAt: "2026-04-14T00:00:00Z",
    updatedAt: "2026-04-14T00:00:00Z",
  };
}

describe("in-memory StrainRepository", () => {
  const repo = createInMemoryStrainRepository(fixture);

  describe("listStrains", () => {
    it("returns only published rows when no filter is passed", async () => {
      const rows = await repo.listStrains();
      expect(rows).toHaveLength(4);
      expect(rows.every((r) => r.isPublished)).toBe(true);
    });

    it("filters by strain type", async () => {
      const rows = await repo.listStrains({ type: "sativa" });
      expect(rows.map((r) => r.slug).sort()).toEqual(["b", "c"]);
    });

    it("returns [] when the filter has no matches", async () => {
      const empty = createInMemoryStrainRepository([]);
      expect(await empty.listStrains({ type: "indica" })).toEqual([]);
    });
  });

  describe("getStrainBySlug", () => {
    it("returns a published strain", async () => {
      const s = await repo.getStrainBySlug("a");
      expect(s?.slug).toBe("a");
    });

    it("returns null for unknown slug", async () => {
      expect(await repo.getStrainBySlug("nope")).toBeNull();
    });

    it("does not return unpublished strains", async () => {
      expect(await repo.getStrainBySlug("draft")).toBeNull();
    });
  });

  describe("getRelatedStrains", () => {
    it("returns same-type strains excluding the current slug", async () => {
      const rows = await repo.getRelatedStrains("sativa", "b");
      expect(rows.map((r) => r.slug)).toEqual(["c"]);
    });

    it("caps results at the given limit", async () => {
      const rows = await repo.getRelatedStrains("sativa", "b", 0);
      expect(rows).toHaveLength(0);
    });

    it("defaults limit to 3", async () => {
      const many: Strain[] = Array.from({ length: 10 }, (_, i) =>
        base(`h${i}`, "hybrid", true),
      );
      const r = createInMemoryStrainRepository(many);
      const rows = await r.getRelatedStrains("hybrid", "h0");
      expect(rows).toHaveLength(3);
    });
  });
});
