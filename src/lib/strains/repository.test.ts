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

  describe("listStrains with includeDrafts", () => {
    it("surfaces draft rows when requested", async () => {
      const rows = await repo.listStrains({ includeDrafts: true });
      expect(rows.map((r) => r.slug).sort()).toEqual(["a", "b", "c", "d", "draft"]);
    });
  });

  describe("getStrainBySlug with includeDrafts", () => {
    it("returns a draft when opted in", async () => {
      const s = await repo.getStrainBySlug("draft", { includeDrafts: true });
      expect(s?.slug).toBe("draft");
      expect(s?.isPublished).toBe(false);
    });
  });

  describe("saveStrain", () => {
    it("updates an existing row in place", async () => {
      const r = createInMemoryStrainRepository(fixture);
      const saved = await r.saveStrain({
        slug: "a",
        name: "A Renamed",
        type: "indica",
        thcPct: 22,
        cbdPct: 0,
        description: "updated",
        lineage: null,
        flavors: [],
        effects: [],
        heroImageUrl: "/images/strains/a.jpg",
        isPublished: true,
      });
      expect(saved.name).toBe("A Renamed");
      expect(saved.description).toBe("updated");
      const reread = await r.getStrainBySlug("a");
      expect(reread?.description).toBe("updated");
    });

    it("renames the slug when originalSlug differs from input.slug", async () => {
      const r = createInMemoryStrainRepository(fixture);
      await r.saveStrain(
        {
          slug: "a-renamed",
          name: "A",
          type: "indica",
          thcPct: 20,
          cbdPct: 0,
          description: null,
          lineage: null,
          flavors: [],
          effects: [],
          heroImageUrl: null,
          isPublished: true,
        },
        { originalSlug: "a" },
      );
      expect(await r.getStrainBySlug("a")).toBeNull();
      expect((await r.getStrainBySlug("a-renamed"))?.slug).toBe("a-renamed");
    });

    it("creates a new row when no originalSlug and slug is novel", async () => {
      const r = createInMemoryStrainRepository(fixture);
      const created = await r.saveStrain({
        slug: "new-strain",
        name: "New Strain",
        type: "hybrid",
        thcPct: 18,
        cbdPct: 0,
        description: null,
        lineage: null,
        flavors: [],
        effects: [],
        heroImageUrl: null,
        isPublished: true,
      });
      expect(created.slug).toBe("new-strain");
      const all = await r.listStrains();
      expect(all.find((s) => s.slug === "new-strain")).toBeDefined();
    });
  });

  describe("deleteStrain", () => {
    it("removes the row so subsequent lookups miss", async () => {
      const r = createInMemoryStrainRepository(fixture);
      await r.deleteStrain("a");
      expect(await r.getStrainBySlug("a")).toBeNull();
      const all = await r.listStrains({ includeDrafts: true });
      expect(all.find((s) => s.slug === "a")).toBeUndefined();
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
