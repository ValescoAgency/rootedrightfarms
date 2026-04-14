"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  parseStrainFormData,
  strainAdminSchema,
} from "@/lib/strains/admin-schema";
import { getStrainRepository } from "@/lib/strains/repository";
import type { Envelope } from "@/lib/submissions/types";

export type StrainSaveResult = Envelope<{ slug: string }>;

/**
 * Save (create or update) a strain. Gated by requireRole so a direct POST
 * to the action endpoint still goes through RBAC. The Supabase repository
 * enforces admin-only writes via the update_strains_admin /
 * insert_strains_admin policies (see migration 20260414000010).
 */
export async function saveStrainAction(
  _prev: StrainSaveResult | null,
  formData: FormData,
): Promise<StrainSaveResult> {
  await requireRole(["admin"], "/admin/strains");

  const raw = parseStrainFormData(formData);
  const parsed = strainAdminSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_form";
      if (!(key in fields)) fields[key] = issue.message;
    }
    return {
      data: null,
      error: {
        code: "invalid_input",
        message: "Please fix the fields.",
        fields,
      },
    };
  }

  const originalSlugRaw = formData.get("originalSlug")?.toString();
  const originalSlug =
    originalSlugRaw && originalSlugRaw.trim().length > 0
      ? originalSlugRaw.trim()
      : undefined;

  try {
    const repo = getStrainRepository();
    await repo.saveStrain(parsed.data, { originalSlug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      data: null,
      error: { code: "save_failed", message },
    };
  }

  revalidatePath("/strains");
  revalidatePath(`/strains/${parsed.data.slug}`);
  if (originalSlug && originalSlug !== parsed.data.slug) {
    revalidatePath(`/strains/${originalSlug}`);
  }
  revalidatePath("/admin/strains");
  revalidatePath(`/admin/strains/${parsed.data.slug}`);

  return { data: { slug: parsed.data.slug }, error: null };
}

export async function deleteStrainAction(formData: FormData) {
  await requireRole(["admin"], "/admin/strains");
  const slug = formData.get("slug")?.toString();
  if (slug) {
    const repo = getStrainRepository();
    await repo.deleteStrain(slug);
    revalidatePath(`/strains/${slug}`);
  }
  revalidatePath("/strains");
  revalidatePath("/admin/strains");
  redirect("/admin/strains");
}
