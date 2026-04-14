import { describe, it, expect } from "vitest";
import { parseSiteConfig, getSiteConfig } from "./site-config";

const validConfig = {
  hero: { tagline: "t", subtitle: "s" },
  contact: {
    email: "hi@example.com",
    phone: "",
    address: { street: "", city: "Ardmore", state: "OK", postalCode: "" },
    replyWindow: "Reply within 1 business day",
  },
  social: { instagram: "rrf", facebook: "" },
  trustBar: [{ key: "license", label: "OBNDD #123", icon: "shield" }],
  copyright: { year: 2026, licenseText: "21+ only." },
};

describe("parseSiteConfig", () => {
  it("parses a well-formed config", () => {
    const parsed = parseSiteConfig(validConfig);
    expect(parsed.contact.email).toBe("hi@example.com");
    expect(parsed.trustBar).toHaveLength(1);
  });

  it("throws with a helpful path when a required key is missing", () => {
    const bad = { ...validConfig, hero: { subtitle: "s" } };
    expect(() => parseSiteConfig(bad)).toThrow(/hero\.tagline/);
  });

  it("throws when a type is wrong", () => {
    const bad = {
      ...validConfig,
      copyright: { year: "2026", licenseText: "x" },
    };
    expect(() => parseSiteConfig(bad)).toThrow(/copyright\.year/);
  });

  it("rejects an invalid email", () => {
    const bad = { ...validConfig, contact: { ...validConfig.contact, email: "nope" } };
    expect(() => parseSiteConfig(bad)).toThrow(/contact\.email/);
  });

  it("rejects an unknown trust-bar icon", () => {
    const bad = {
      ...validConfig,
      trustBar: [{ key: "x", label: "y", icon: "rocket" }],
    };
    expect(() => parseSiteConfig(bad)).toThrow(/trustBar\.0\.icon/);
  });

  it("requires at least one trust-bar entry", () => {
    const bad = { ...validConfig, trustBar: [] };
    expect(() => parseSiteConfig(bad)).toThrow();
  });
});

describe("getSiteConfig", () => {
  it("loads and validates src/config/site.json", () => {
    const cfg = getSiteConfig();
    expect(cfg.hero.tagline.length).toBeGreaterThan(0);
    expect(cfg.contact.address.state).toBe("OK");
    expect(cfg.trustBar.length).toBeGreaterThanOrEqual(1);
  });
});
