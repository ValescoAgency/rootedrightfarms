"use client";

import { useActionState, useState } from "react";
import type { Strain } from "@/lib/strains/types";
import { STRAIN_TYPES } from "@/lib/strains/types";
import { slugify } from "@/lib/strains/admin-schema";
import {
  saveStrainAction,
  deleteStrainAction,
  type StrainSaveResult,
} from "./actions";
import { TiptapEditor } from "./tiptap-editor";
import { ImageUpload } from "./image-upload";

interface Props {
  mode: "create" | "edit";
  strain?: Strain;
}

const fieldClass =
  "w-full px-4 py-3 min-h-[44px] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-ink)] focus:border-[var(--color-accent)] outline-none";

const labelClass =
  "block text-sm font-medium text-[var(--color-ink)] mb-2";

export function StrainEditor({ mode, strain }: Props) {
  const [state, formAction, pending] = useActionState(
    saveStrainAction,
    null as StrainSaveResult | null,
  );
  const [name, setName] = useState(strain?.name ?? "");
  const [slug, setSlug] = useState(strain?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [strainType, setStrainType] = useState(strain?.type ?? "hybrid");

  const errors = state?.error?.fields ?? {};

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="mode" value={mode} />
        {strain?.slug ? (
          <input type="hidden" name="originalSlug" value={strain.slug} />
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="name" required error={errors.name}>
            <input
              name="name"
              value={name}
              required
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={fieldClass}
            />
          </Field>
          <Field label="Slug" name="slug" required error={errors.slug}>
            <input
              name="slug"
              value={slug}
              required
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Type" name="type" required error={errors.type}>
            <select
              name="type"
              required
              value={strainType}
              onChange={(e) => setStrainType(e.target.value as typeof strainType)}
              className={fieldClass}
            >
              {STRAIN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="THC %" name="thcPct" error={errors.thcPct}>
            <input
              name="thcPct"
              type="number"
              step="0.1"
              min={0}
              max={100}
              defaultValue={strain?.thcPct ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="CBD %" name="cbdPct" error={errors.cbdPct}>
            <input
              name="cbdPct"
              type="number"
              step="0.1"
              min={0}
              max={100}
              defaultValue={strain?.cbdPct ?? ""}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="Lineage" name="lineage" error={errors.lineage}>
          <input
            name="lineage"
            defaultValue={strain?.lineage ?? ""}
            placeholder="Grape Pie × Tahoe OG"
            className={fieldClass}
          />
        </Field>

        <Field label="Description" name="description" error={errors.description}>
          <TiptapEditor
            name="description"
            defaultValue={strain?.description}
            error={errors.description}
          />
        </Field>

        <Field
          label="Flavors (comma separated, lowercase)"
          name="flavors"
          error={errors.flavors}
        >
          <input
            name="flavors"
            defaultValue={strain?.flavors.join(", ") ?? ""}
            className={fieldClass}
          />
        </Field>

        <Field
          label="Effects (comma separated, lowercase)"
          name="effects"
          error={errors.effects}
        >
          <input
            name="effects"
            defaultValue={strain?.effects.join(", ") ?? ""}
            className={fieldClass}
          />
        </Field>

        <Field
          label="Hero image"
          name="heroImageUrl"
          error={errors.heroImageUrl}
        >
          <ImageUpload
            name="heroImageUrl"
            defaultValue={strain?.heroImageUrl}
            error={errors.heroImageUrl}
          />
        </Field>

        <label className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={strain?.isPublished ?? false}
            className="w-4 h-4 accent-[var(--color-accent)]"
          />
          Published
        </label>

        {state?.error && state.error.code !== "invalid_input" ? (
          <p role="alert" className="text-sm text-[var(--color-error)]">
            {state.error.message}
          </p>
        ) : null}
        {state?.data ? (
          <p role="status" className="text-sm text-[var(--color-success)]">
            Saved.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm disabled:opacity-60"
        >
          {pending ? "Saving…" : mode === "create" ? "Create strain" : "Save changes"}
        </button>
      </form>

      {mode === "edit" && strain ? (
        <form
          action={deleteStrainAction}
          className="pt-6 border-t border-[var(--color-border)]"
          onSubmit={(e) => {
            if (!window.confirm(`Delete "${strain.name}"? This cannot be undone.`)) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="slug" value={strain.slug} />
          <button
            type="submit"
            className="inline-flex items-center px-5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-error)] text-[var(--color-error)] text-sm font-medium hover:bg-[var(--color-error)] hover:text-[var(--color-ink-inverse)] transition-colors"
          >
            Delete strain
          </button>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  required,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required ? (
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-xs text-[var(--color-error)]">{error}</p>
      ) : null}
    </div>
  );
}
