"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  parseStrainFormData,
  strainAdminSchema,
} from "@/lib/strains/admin-schema";
import type { Envelope } from "@/lib/submissions/types";

export type StrainSaveResult = Envelope<{ slug: string }>;

/**
 * Save (create or update) a strain. Uses requireRole on every invocation so
 * even a direct POST to the action endpoint is gated. Once the
 * Supabase-backed StrainRepository lands this function will call it; for
 * now it validates + revalidates paths, returning a clear shape that the
 * editor can render.
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
      error: { code: "invalid_input", message: "Please fix the fields.", fields },
    };
  }

  // TODO(va-42-supabase): persist via Supabase repository once service-role
  // env + CRUD methods are wired. For now we revalidate and return success
  // so the editor flow can be exercised in preview.
  revalidatePath("/strains");
  revalidatePath(`/strains/${parsed.data.slug}`);
  revalidatePath("/admin/strains");

  return { data: { slug: parsed.data.slug }, error: null };
}

export async function deleteStrainAction(_formData: FormData) {
  await requireRole(["admin"], "/admin/strains");
  // TODO(va-42-supabase): read slug from _formData and delete once the
  // Supabase-backed repo has a delete method.
  revalidatePath("/strains");
  revalidatePath("/admin/strains");
  redirect("/admin/strains");
}
