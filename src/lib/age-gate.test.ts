import { describe, it, expect } from "vitest";
import { isExemptPath, buildAgeCheckUrl, sanitizeNextParam } from "./age-gate";

describe("isExemptPath", () => {
  it("passes through the gate routes themselves", () => {
    expect(isExemptPath("/age-check")).toBe(true);
    expect(isExemptPath("/age-blocked")).toBe(true);
  });

  it("passes through legal pages", () => {
    expect(isExemptPath("/privacy")).toBe(true);
    expect(isExemptPath("/terms")).toBe(true);
  });

  it("passes through Next internals and api", () => {
    expect(isExemptPath("/_next/static/chunks/main.js")).toBe(true);
    expect(isExemptPath("/api/health")).toBe(true);
  });

  it("passes through static assets by extension", () => {
    expect(isExemptPath("/favicon.ico")).toBe(true);
    expect(isExemptPath("/logo.svg")).toBe(true);
    expect(isExemptPath("/hero.webp")).toBe(true);
    expect(isExemptPath("/fonts/inter.woff2")).toBe(true);
  });

  it("gates normal pages", () => {
    expect(isExemptPath("/")).toBe(false);
    expect(isExemptPath("/strains")).toBe(false);
    expect(isExemptPath("/strains/pie-hoe")).toBe(false);
    expect(isExemptPath("/contact")).toBe(false);
  });
});

describe("buildAgeCheckUrl", () => {
  it("redirects to /age-check with ?next preserving pathname + query", () => {
    const from = new URL("https://example.com/strains/pie-hoe?ref=nav");
    const target = buildAgeCheckUrl(from);
    expect(target.pathname).toBe("/age-check");
    expect(target.searchParams.get("next")).toBe("/strains/pie-hoe?ref=nav");
  });

  it("omits next when landing on root", () => {
    const from = new URL("https://example.com/");
    const target = buildAgeCheckUrl(from);
    expect(target.searchParams.get("next")).toBe(null);
  });
});

describe("sanitizeNextParam", () => {
  it("defaults to /", () => {
    expect(sanitizeNextParam(null)).toBe("/");
    expect(sanitizeNextParam(undefined)).toBe("/");
    expect(sanitizeNextParam("")).toBe("/");
  });

  it("rejects protocol-relative and external URLs", () => {
    expect(sanitizeNextParam("//evil.com")).toBe("/");
    expect(sanitizeNextParam("https://evil.com")).toBe("/");
  });

  it("rejects a loop back through the gate", () => {
    expect(sanitizeNextParam("/age-check")).toBe("/");
    expect(sanitizeNextParam("/age-blocked")).toBe("/");
  });

  it("accepts a same-origin path", () => {
    expect(sanitizeNextParam("/strains")).toBe("/strains");
    expect(sanitizeNextParam("/contact?src=nav")).toBe("/contact?src=nav");
  });
});
