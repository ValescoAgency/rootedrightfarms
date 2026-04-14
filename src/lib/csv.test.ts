import { describe, it, expect } from "vitest";
import { csvEscape, toCsv } from "./csv";

describe("csvEscape", () => {
  it("passes simple strings untouched", () => {
    expect(csvEscape("plain")).toBe("plain");
  });

  it("wraps values containing commas", () => {
    expect(csvEscape("a, b")).toBe('"a, b"');
  });

  it("doubles embedded quotes", () => {
    expect(csvEscape('he said "hi"')).toBe('"he said ""hi"""');
  });

  it("wraps values containing newlines", () => {
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
  });

  it("converts nullish to empty", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("stringifies non-string primitives", () => {
    expect(csvEscape(42)).toBe("42");
    expect(csvEscape(true)).toBe("true");
  });
});

describe("toCsv", () => {
  it("emits header + escaped rows with CRLF line endings", () => {
    const csv = toCsv(
      ["name", "note"],
      [
        ["Alex", "likes Pie Hoe"],
        ["Jordan", 'says "hi, there"'],
      ],
    );
    expect(csv).toBe(
      'name,note\r\nAlex,likes Pie Hoe\r\nJordan,"says ""hi, there"""\r\n',
    );
  });
});
