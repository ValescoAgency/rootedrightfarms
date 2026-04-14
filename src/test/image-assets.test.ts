import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { globSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");

// Paths we scan for hard-coded `/images/...` references. Seed data lives
// under src/lib/strains/seed.ts; page + component markup under src/app and
// src/components.
const SCAN_GLOBS = [
  "src/app/**/*.{ts,tsx}",
  "src/components/**/*.{ts,tsx}",
  "src/lib/strains/seed.ts",
];

// `/images/<something>.<ext>` with a conservative char class so we don't pick
// up query strings or template expressions.
const IMAGE_PATH_RE = /\/images\/[A-Za-z0-9_\-./]+?\.(?:png|jpe?g|webp|avif|svg|gif)/g;

function collectReferencedImagePaths(): Map<string, string[]> {
  const refs = new Map<string, string[]>();
  for (const pattern of SCAN_GLOBS) {
    for (const file of globSync(pattern, { cwd: ROOT, absolute: true })) {
      if (file.includes("__tests__") || file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
        continue;
      }
      const contents = readFileSync(file, "utf8");
      const matches = contents.match(IMAGE_PATH_RE);
      if (!matches) continue;
      for (const match of matches) {
        const users = refs.get(match) ?? [];
        users.push(path.relative(ROOT, file));
        refs.set(match, users);
      }
    }
  }
  return refs;
}

describe("public image assets", () => {
  const referenced = collectReferencedImagePaths();

  it("scan picks up the expected hero + strain + services images", () => {
    const paths = [...referenced.keys()];
    // Spot-check a representative image per section — catches scanner regressions.
    expect(paths).toContain("/images/home/hero-desktop.png");
    expect(paths).toContain("/images/home/hero-mobile.png");
    expect(paths).toContain("/images/about/hero-desktop.jpg");
    expect(paths).toContain("/images/services/nursery-design.png");
    expect(paths).toContain("/images/services/tissue-cultures.png");
    expect(paths).toContain("/images/contact/dispensary-shelf.png");
    expect(paths).toContain("/images/strains-hero/grow-room.png");
    expect(paths).toContain("/images/employment/team.png");
    expect(paths).toContain("/images/strains/pie-hoe.jpg");
    expect(paths).toContain("/images/strains/banana-candy.jpg");
    expect(paths).toContain("/images/strains/pine-bud.jpg");
    expect(paths).toContain("/images/strains/tropicana-cookies.jpg");
  });

  for (const [imagePath, users] of referenced) {
    it(`${imagePath} exists in public/ (referenced by ${users.join(", ")})`, () => {
      const abs = path.join(PUBLIC_DIR, imagePath.replace(/^\/+/, ""));
      const stat = statSync(abs);
      expect(stat.isFile(), `${abs} is not a regular file`).toBe(true);
      expect(stat.size, `${abs} is empty`).toBeGreaterThan(0);
    });
  }
});
