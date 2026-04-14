import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getContactSubmission } from "../data";
import { INQUIRY_LABELS } from "@/lib/submissions/types";
import { updateContactStatus } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ContactSubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["admin"], `/admin/submissions/contact/${id}`);
  const row = await getContactSubmission(id);
  if (!row) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/submissions/contact"
        className="inline-flex items-center text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] mb-6"
      >
        ← All contact
      </Link>
      <h2 className="font-serif text-3xl mb-3">{row.name}</h2>
      <p className="text-[var(--color-ink-muted)] mb-6">
        {INQUIRY_LABELS[row.inquiryType]} · {row.status}
      </p>

      <dl className="space-y-4 text-sm">
        <Row label="Email" value={row.email} />
        <Row label="Phone" value={row.phone ?? "—"} />
        <Row label="Company" value={row.company ?? "—"} />
        {row.licenseNumber ? (
          <Row label="OBNDD license" value={row.licenseNumber} />
        ) : null}
        {row.address ? (
          <Row label="Dispensary address" value={row.address} />
        ) : null}
        <div>
          <dt className="text-[var(--color-ink-subtle)] mb-1">Message</dt>
          <dd className="whitespace-pre-wrap text-[var(--color-ink)] border-l-2 border-[var(--color-border)] pl-4">
            {row.message}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t border-[var(--color-border)]">
        <form action={updateContactStatus}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="action" value="markRead" />
          <button
            type="submit"
            disabled={row.status !== "new"}
            className="px-4 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-ink)] text-sm font-medium disabled:opacity-50"
          >
            Mark as read
          </button>
        </form>
        <form action={updateContactStatus}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="action" value="archive" />
          <button
            type="submit"
            disabled={row.status === "archived"}
            className="px-4 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-error)] text-[var(--color-error)] text-sm font-medium disabled:opacity-50"
          >
            Archive
          </button>
        </form>
        {row.status === "archived" ? (
          <form action={updateContactStatus}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="action" value="unarchive" />
            <button
              type="submit"
              className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] text-sm font-medium"
            >
              Unarchive
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex gap-6">
      <dt className="w-32 shrink-0 text-[var(--color-ink-subtle)]">{label}</dt>
      <dd className="text-[var(--color-ink)]">{value ?? "—"}</dd>
    </div>
  );
}
