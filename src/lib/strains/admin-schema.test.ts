import { describe, it, expect } from "vitest";
import { strainAdminSchema, parseStrainFormData, slugify } from "./admin-schema";
import type { TiptapDoc } from "./types";

const validDescription: TiptapDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "A flagship." }] }],
};

describe("strainAdminSchema", () => {
  const valid = {
    slug: "pie-hoe",
    name: "Pie Hoe",
    type: "hybrid" as const,
    thcPct: 26.4,
    cbdPct: 0.1,
    description: validDescription,
    lineage: "Grape Pie × Tahoe OG",
    flavors: ["cherry", "earth"],
    effects: ["relaxed"],
    heroImageUrl: "https://cdn.example/pie-hoe.jpg",
    isPublished: true,
  };

  it("parses a healthy payload", () => {
    const result = strainAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug", () => {
    const bad = { ...valid, slug: "Pie Hoe" };
    const r = strainAdminSchema.safeParse(bad);
    expect(r.success).toBe(false);
  });

  it("rejects out-of-range thc percentage", () => {
    const bad = { ...valid, thcPct: 999 };
    expect(strainAdminSchema.safeParse(bad).success).toBe(false);
  });

  it("caps flavors and effects arrays", () => {
    const manyFlavors = Array.from({ length: 30 }, (_, i) => `flavor-${i}`);
    const bad = { ...valid, flavors: manyFlavors };
    expect(strainAdminSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts a site-relative hero image path", () => {
    const ok = { ...valid, heroImageUrl: "/images/strains/pie-hoe.jpg" };
    expect(strainAdminSchema.safeParse(ok).success).toBe(true);
  });

  it("accepts an https hero image URL", () => {
    const ok = { ...valid, heroImageUrl: "https://cdn.example.com/x.jpg" };
    expect(strainAdminSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects a hero image value that is neither URL nor relative path", () => {
    const bad = { ...valid, heroImageUrl: "not-a-url-or-path.jpg" };
    expect(strainAdminSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts null hero image", () => {
    const ok = { ...valid, heroImageUrl: null };
    expect(strainAdminSchema.safeParse(ok).success).toBe(true);
  });
});

describe("parseStrainFormData", () => {
  it("converts FormData strings into the schema shape", () => {
    const fd = new FormData();
    fd.set("slug", "pie-hoe");
    fd.set("name", "Pie Hoe");
    fd.set("type", "hybrid");
    fd.set("thcPct", "26.4");
    fd.set("cbdPct", "");
    fd.set("description", JSON.stringify(validDescription));
    fd.set("lineage", "Grape Pie × Tahoe OG");
    fd.set("flavors", "Cherry, Earth, , cherry");
    fd.set("effects", "relaxed");
    fd.set("heroImageUrl", "https://cdn.example/pie-hoe.jpg");
    fd.set("isPublished", "on");

    const parsed = parseStrainFormData(fd);
    expect(parsed.thcPct).toBe(26.4);
    expect(parsed.cbdPct).toBeNull();
    expect(parsed.isPublished).toBe(true);
    // Flavors are lowercased + trimmed; duplicates allowed (admin enters),
    // but the CSV splitter drops empty tokens.
    expect(parsed.flavors).toEqual(["cherry", "earth", "cherry"]);
  });
});

describe("slugify", () => {
  it("handles spaces + casing + diacritics", () => {
    expect(slugify("Banana Candy")).toBe("banana-candy");
    expect(slugify("Café Noir")).toBe("cafe-noir");
    expect(slugify("  Pie Hoe  ")).toBe("pie-hoe");
  });
});
