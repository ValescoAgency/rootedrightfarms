export const metadata = {
  title: "Access Restricted",
  robots: { index: false, follow: false },
};

export default function AgeBlockedPage() {
  return (
    <div className="surface-dark min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <p
          className="font-serif text-2xl font-semibold mb-16"
          style={{ letterSpacing: "0.02em" }}
        >
          Rooted Right Farms
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-6">
          We&rsquo;re sorry, you must be 21 or older.
        </h1>
        <p className="text-base" style={{ color: "var(--color-ink-inv-muted)" }}>
          Access to this site is restricted by law. Please close this window.
        </p>
      </div>
    </div>
  );
}
