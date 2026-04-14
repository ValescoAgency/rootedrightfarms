import Link from "next/link";
import { INQUIRY_LABELS } from "@/lib/submissions/types";
import { listContactInbox } from "./data";

export default async function ContactInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; inquiry?: string }>;
}) {
  const params = await searchParams;
  const rows = await listContactInbox({
    status: params.status as "new" | "read" | "archived" | undefined,
    inquiryType: params.inquiry as keyof typeof INQUIRY_LABELS | undefined,
  });

  return (
    <>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-serif text-3xl lg:text-4xl">Contact submissions</h1>
        <Link
          href={`/admin/submissions/contact/export.csv${params.status ? `?status=${params.status}` : ""}`}
          className="inline-flex items-center px-4 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-ink)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ink-inverse)] transition-colors"
        >
          Export CSV
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 mb-6 text-sm" method="get">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="px-3 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
        <select
          name="inquiry"
          defaultValue={params.inquiry ?? ""}
          className="px-3 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <option value="">All inquiries</option>
          {Object.entries(INQUIRY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)]"
        >
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[color-mix(in_srgb,var(--color-bg-dark)_4%,var(--color-bg))]">
            <tr className="text-left">
              <Th>Received</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Inquiry</Th>
              <Th>Status</Th>
              <Th>Preview</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[var(--color-ink-muted)]"
                >
                  No submissions yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <Td>{formatDate(r.createdAt)}</Td>
                  <Td>
                    <Link
                      href={`/admin/submissions/contact/${r.id}`}
                      className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                    >
                      {r.name}
                    </Link>
                  </Td>
                  <Td>{r.email}</Td>
                  <Td>{INQUIRY_LABELS[r.inquiryType]}</Td>
                  <Td>
                    <StatusPill status={r.status} />
                  </Td>
                  <Td className="max-w-xs truncate text-[var(--color-ink-muted)]">
                    {r.message.slice(0, 80)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-subtle)]">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}

function StatusPill({ status }: { status: "new" | "read" | "archived" }) {
  const color =
    status === "new"
      ? "var(--color-accent)"
      : status === "read"
        ? "var(--color-success)"
        : "var(--color-ink-subtle)";
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{
        background: `color-mix(in srgb, ${color} 15%, var(--color-bg))`,
        color,
      }}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
