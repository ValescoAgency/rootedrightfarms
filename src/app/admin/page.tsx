import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await requireRole(["admin"], "/admin");
  return (
    <section className="container-site py-12 lg:py-16 max-w-3xl">
      <p className="eyebrow mb-4">ADMIN</p>
      <h1 className="font-serif text-4xl lg:text-5xl mb-3">
        Welcome, {session.email}.
      </h1>
      <p className="text-[var(--color-ink-muted)] mb-10">
        Admin surfaces land here once VA-42 (strains CRUD) and VA-43
        (submissions inbox) are wired. Sign-in is gated by{" "}
        <code className="text-[var(--color-ink)]">requireRole([&apos;admin&apos;])</code>.
      </p>
      <ul className="space-y-2 text-sm text-[var(--color-ink-muted)]">
        <li>Session user id: {session.userId}</li>
        <li>Roles: {session.roles.join(", ") || "(none)"}</li>
      </ul>
    </section>
  );
}
