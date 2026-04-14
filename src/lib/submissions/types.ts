export const INQUIRY_TYPES = [
  "wholesale",
  "dispensary-registration",
  "nursery-design",
  "tissue-cultures",
  "general",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_LABELS: Record<InquiryType, string> = {
  wholesale: "Wholesale / Dispensary",
  "dispensary-registration": "Dispensary Registration",
  "nursery-design": "Nursery / Design Services",
  "tissue-cultures": "Tissue Cultures",
  general: "General Inquiry",
};

export interface ContactSubmissionPayload {
  inquiryType: InquiryType;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  licenseNumber?: string;
  address?: string;
  message: string;
}

export type Envelope<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string; fields?: Record<string, string> } };
