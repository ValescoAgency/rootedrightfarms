import { describe, it, expect, vi } from "vitest";
import {
  uploadImage,
  validateImage,
  MAX_IMAGE_BYTES,
} from "./image-upload";

function makeFile(overrides: Partial<Parameters<typeof validateImage>[0]>) {
  const file = {
    size: 1024,
    mimeType: "image/jpeg",
    name: "hero.jpg",
    arrayBuffer: async () => new ArrayBuffer(1024),
    ...overrides,
  } satisfies Parameters<typeof validateImage>[0];
  return file;
}

describe("validateImage", () => {
  it("accepts JPEG, PNG, WebP under the byte cap", () => {
    expect(validateImage(makeFile({ mimeType: "image/jpeg" }))).toBeNull();
    expect(validateImage(makeFile({ mimeType: "image/png" }))).toBeNull();
    expect(validateImage(makeFile({ mimeType: "image/webp" }))).toBeNull();
  });

  it("rejects unsupported mime types", () => {
    const err = validateImage(makeFile({ mimeType: "image/gif" }));
    expect(err?.code).toBe("mime");
  });

  it("rejects files over 5 MB", () => {
    const err = validateImage(makeFile({ size: MAX_IMAGE_BYTES + 1 }));
    expect(err?.code).toBe("size");
  });
});

describe("uploadImage", () => {
  it("returns the public URL on success", async () => {
    const uploader = {
      upload: vi.fn().mockResolvedValue({
        publicUrl: "https://cdn.example/strain-images/foo.jpg",
      }),
    };
    const res = await uploadImage(makeFile({}), "hero", uploader);
    expect(res.error).toBeNull();
    expect(res.url).toContain("cdn.example");
    expect(uploader.upload).toHaveBeenCalledOnce();
    const call = uploader.upload.mock.calls[0][0];
    expect(call.path.startsWith("hero/")).toBe(true);
    expect(call.path.endsWith(".jpg")).toBe(true);
    expect(call.contentType).toBe("image/jpeg");
  });

  it("does not call the uploader on invalid mime", async () => {
    const uploader = { upload: vi.fn() };
    const res = await uploadImage(
      makeFile({ mimeType: "application/pdf" }),
      "hero",
      uploader,
    );
    expect(res.error?.code).toBe("mime");
    expect(uploader.upload).not.toHaveBeenCalled();
  });

  it("bubbles storage errors as storage-error envelope", async () => {
    const uploader = {
      upload: vi.fn().mockRejectedValue(new Error("S3 down")),
    };
    const res = await uploadImage(makeFile({}), "hero", uploader);
    expect(res.error?.code).toBe("storage");
    expect(res.error?.message).toMatch(/S3 down/);
  });
});
