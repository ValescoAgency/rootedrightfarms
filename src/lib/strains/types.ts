export const STRAIN_TYPES = ["indica", "sativa", "hybrid"] as const;
export type StrainType = (typeof STRAIN_TYPES)[number];

// ---------------------------------------------------------------------------
// TipTap document JSON types
// ---------------------------------------------------------------------------

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
}

export interface TiptapDoc {
  type: "doc";
  content: TiptapNode[];
}

/** Extract a plain-text string from a TipTap document (for meta descriptions, card previews, etc.). */
export function extractTiptapText(doc: TiptapDoc): string {
  function nodeText(node: TiptapNode): string {
    if (node.type === "text") return node.text ?? "";
    return (node.content ?? []).map(nodeText).join("");
  }
  return doc.content
    .map(nodeText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------

export interface Strain {
  id: string;
  slug: string;
  name: string;
  type: StrainType;
  thcPct: number | null;
  cbdPct: number | null;
  description: TiptapDoc | null;
  lineage: string | null;
  flavors: string[];
  effects: string[];
  heroImageUrl: string | null;
  galleryImageUrls: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListStrainsOptions {
  type?: StrainType;
}
