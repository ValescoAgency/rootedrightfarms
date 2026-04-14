"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { nextStatus } from "@/lib/submissions/admin-inbox";
import { getContactSubmission, setContactStatus } from "./contact/data";

type StatusAction = "markRead" | "archive" | "unarchive";

export async function updateContactStatus(formData: FormData) {
  await requireRole(["admin"], "/admin/submissions/contact");
  const id = formData.get("id")?.toString();
  const action = formData.get("action")?.toString() as StatusAction;
  if (!id || !action) return;

  const row = await getContactSubmission(id);
  if (!row) return;

  const next = nextStatus(row.status, action);
  if (!next) return;
  await setContactStatus(id, next);

  revalidatePath(`/admin/submissions/contact/${id}`);
  revalidatePath("/admin/submissions/contact");
  redirect(`/admin/submissions/contact/${id}`);
}
