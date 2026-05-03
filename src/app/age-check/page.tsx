import Image from "next/image";
import { confirmAge, denyAge } from "./actions";
import { sanitizeNextParam } from "@/lib/age-gate";

export const metadata = {
  title: "Age Verification",
  robots: { index: false, follow: false },
};

export default async function AgeCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNextParam(params.next);

  return (
    <div className="surface-dark min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center">
        <div className="flex items-center justify-center gap-3 mb-16">
          <Image
            src="/images/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10"
          />
          <p
            className="font-serif text-2xl font-semibold"
            style={{ letterSpacing: "0.02em" }}
          >
            Rooted Right Farms
          </p>
        </div>
        <p className="eyebrow mb-4" style={{ color: "var(--color-ink-inv-muted)" }}>
          VERIFY ACCESS
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-8">Are you 21 or older?</h1>
        <p
          className="text-base lg:text-lg mb-10"
          style={{ color: "var(--color-ink-inv-muted)" }}
        >
          This site contains content related to cannabis. You must be 21 or older
          to enter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <form action={confirmAge}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95"
            >
              Yes, I&rsquo;m 21 or older
            </button>
          </form>
          <form action={denyAge}>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border-[1.5px] border-[var(--color-ink-inverse)] text-[var(--color-ink-inverse)] font-medium text-sm transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-ink-inverse)] hover:text-[var(--color-ink)]"
            >
              No, I&rsquo;m under 21
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
