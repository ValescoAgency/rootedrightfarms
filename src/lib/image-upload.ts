export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageUploadError =
  | { code: "mime"; message: string }
  | { code: "size"; message: string }
  | { code: "storage"; message: string };

export type ImageUploadResult =
  | { url: string; error: null }
  | { url: null; error: ImageUploadError };

export interface ImageMeta {
  size: number;
  mimeType: string;
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface StorageUploader {
  upload(params: {
    path: string;
    bytes: ArrayBuffer;
    contentType: string;
  }): Promise<{ publicUrl: string }>;
}

export function validateImage(file: ImageMeta): ImageUploadError | null {
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(file.mimeType)) {
    return {
      code: "mime",
      message: `Unsupported file type "${file.mimeType}". Use JPG, PNG, or WebP.`,
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      code: "size",
      message: `File is ${Math.round(file.size / 1024)} KB. Max 5 MB.`,
    };
  }
  return null;
}

function extensionFor(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "bin";
}

/**
 * Validate + upload an image. Injected StorageUploader lets unit tests run
 * without Supabase. The server action (src/app/admin/strains/actions.ts)
 * supplies a real Supabase-Storage-backed uploader.
 */
export async function uploadImage(
  file: ImageMeta,
  prefix: string,
  uploader: StorageUploader,
): Promise<ImageUploadResult> {
  const validationError = validateImage(file);
  if (validationError) return { url: null, error: validationError };

  const ext = extensionFor(file.mimeType);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${prefix}/${stamp}-${rand}.${ext}`;

  try {
    const bytes = await file.arrayBuffer();
    const { publicUrl } = await uploader.upload({
      path,
      bytes,
      contentType: file.mimeType,
    });
    return { url: publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: {
        code: "storage",
        message: err instanceof Error ? err.message : "Upload failed",
      },
    };
  }
}
