export const INSTAGRAM_MEDIA_TYPES = [
  "IMAGE",
  "VIDEO",
  "CAROUSEL_ALBUM",
] as const;

export type InstagramMediaType = (typeof INSTAGRAM_MEDIA_TYPES)[number];

export interface InstagramPost {
  id: string;
  igPostId: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  permalink: string;
  caption: string | null;
  mediaType: InstagramMediaType;
  postedAt: string;
  fetchedAt: string;
}

export interface GraphMediaResponse {
  data: Array<{
    id: string;
    media_type: InstagramMediaType;
    media_url: string;
    thumbnail_url?: string;
    permalink: string;
    caption?: string;
    timestamp: string;
  }>;
}
