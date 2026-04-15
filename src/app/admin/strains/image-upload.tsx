"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { ALLOWED_IMAGE_MIME, MAX_IMAGE_BYTES } from "@/lib/image-upload";
import { uploadStrainImageAction } from "./actions";

interface ImageUploadProps {
  name: string;
  defaultValue?: string | null;
  error?: string;
}

/**
 * Drag-and-drop image uploader for the strain hero image. Uploads immediately
 * on drop via the uploadStrainImageAction server action, then stores the
 * returned public URL in a hidden input for form submission.
 */
export function ImageUpload({ name, defaultValue, error }: ImageUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        setUploadError(rejected[0]?.errors[0]?.message ?? "File rejected.");
        return;
      }
      const file = accepted[0];
      if (!file) return;

      setUploading(true);
      setUploadError(null);

      const fd = new FormData();
      fd.append("file", file);

      const result = await uploadStrainImageAction(fd);

      setUploading(false);
      if (result.error !== null) {
        setUploadError(result.error);
      } else {
        setUrl(result.url);
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(ALLOWED_IMAGE_MIME.map((m) => [m, []])),
    maxSize: MAX_IMAGE_BYTES,
    multiple: false,
    disabled: uploading,
  });

  const clear = () => {
    setUrl("");
    setUploadError(null);
  };

  const displayError = error ?? uploadError;

  return (
    <div className="space-y-3">
      {/* Hidden input carries the URL into the form */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        /* Preview */
        <div className="relative group w-full max-w-sm">
          <div className="relative aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden border-[1.5px] border-[var(--color-border)]">
            <Image
              src={url}
              alt="Hero image preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
            />
          </div>
          <button
            type="button"
            onClick={clear}
            title="Remove image"
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X size={14} />
          </button>
          {/* Replace option */}
          <div
            {...getRootProps()}
            className="mt-2 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <span className="text-xs text-[var(--color-ink-muted)] underline underline-offset-2 hover:text-[var(--color-ink)] transition-colors">
              {uploading ? "Uploading…" : "Replace image"}
            </span>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          {...getRootProps()}
          className={[
            "flex flex-col items-center justify-center gap-3 px-6 py-10",
            "border-[1.5px] border-dashed rounded-[var(--radius-md)] cursor-pointer",
            "transition-colors",
            displayError
              ? "border-[var(--color-error)]"
              : isDragActive
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-border)]/30",
          ].join(" ")}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-[var(--color-ink-muted)]" />
          ) : (
            <ImagePlus size={24} className="text-[var(--color-ink-muted)]" />
          )}
          <div className="text-center">
            <p className="text-sm text-[var(--color-ink)]">
              {isDragActive
                ? "Drop to upload"
                : uploading
                  ? "Uploading…"
                  : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              JPG, PNG or WebP · max 5 MB
            </p>
          </div>
        </div>
      )}

      {displayError ? (
        <p className="text-xs text-[var(--color-error)]">{displayError}</p>
      ) : null}
    </div>
  );
}
