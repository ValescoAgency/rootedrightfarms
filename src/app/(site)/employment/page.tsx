import Image from "next/image";
import { EmploymentForm } from "./employment-form";

export const metadata = {
  title: "Employment Application",
  description:
    "Apply to work at Rooted Right Farms — indoor hydroponic cannabis, Ardmore, Oklahoma.",
};

export default function EmploymentPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative aspect-[3/2] lg:aspect-[21/9]">
          {/* TODO: swap for client-supplied team/facility photo when delivered. Placeholder sourced from design/prototypes.pen (see public/images/CREDITS.md). */}
          <Image
            src="/images/employment/team.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(27,58,40,0.2) 30%, rgba(27,58,40,0.8) 100%)",
            }}
          />
        </div>
      </section>
      <section className="container-site py-16 lg:py-24">
        <p className="eyebrow mb-4">FIG. 008 — EMPLOYMENT</p>
        <h1 className="font-serif text-4xl lg:text-5xl max-w-2xl mb-6">
          Apply to work with us.
        </h1>
        <p className="max-w-2xl text-lg text-[var(--color-ink-muted)]">
          We keep every application on file. When a role opens that matches
          your background, we reach out. Sensitive fields are encrypted at
          rest and can only be read by authorized staff.
        </p>
      </section>

      <section className="container-site pb-20 lg:pb-24 max-w-3xl">
        <EmploymentForm />
      </section>
    </>
  );
}
