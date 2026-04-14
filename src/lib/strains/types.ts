export const STRAIN_TYPES = ["indica", "sativa", "hybrid"] as const;
export type StrainType = (typeof STRAIN_TYPES)[number];

export interface Strain {
  id: string;
  slug: string;
  name: string;
  type: StrainType;
  thcPct: number | null;
  cbdPct: number | null;
  description: string | null;
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
