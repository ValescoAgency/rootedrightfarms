/**
 * Minimal CSV writer. Escapes per RFC 4180: fields containing ",", newline,
 * or double-quote are wrapped in double quotes; embedded double quotes are
 * doubled.
 */

export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvRow(values: readonly unknown[]): string {
  return values.map(csvEscape).join(",");
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
): string {
  const lines = [toCsvRow(headers), ...rows.map(toCsvRow)];
  return lines.join("\r\n") + "\r\n";
}
