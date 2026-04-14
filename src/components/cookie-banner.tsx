"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const COOKIE = "rrf_cookie_dismissed";
const MAX_AGE_DAYS = 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeDismissCookie() {
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=1; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function subscribeToCookies(callback: () => void) {
  window.addEventListener("visibilitychange", callback);
  return () => window.removeEventListener("visibilitychange", callback);
}

export function CookieBanner() {
  // On the server + during hydration we render null; once mounted, read the
  // cookie. useSyncExternalStore keeps the lint rule against setState-in-effect
  // happy and avoids hydration mismatch.
  const dismissed = useSyncExternalStore(
    subscribeToCookies,
    () => readCookie(COOKIE) === "1",
    () => true,
  );
  const [locallyDismissed, setLocallyDismissed] = useState(false);

  if (dismissed || locallyDismissed) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed left-4 right-4 z-40 mx-auto max-w-xl rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-md)] p-4 lg:p-5"
      style={{ bottom: "96px" }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-[var(--color-ink-muted)]">
          We use a few cookies to verify age, remember this dismissal, and load
          Instagram embeds.{" "}
          <Link
            href="/privacy"
            className="underline text-[var(--color-ink)] hover:text-[var(--color-accent)]"
          >
            See our Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => {
            writeDismissCookie();
            setLocallyDismissed(true);
          }}
          className="shrink-0 px-5 py-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] text-sm font-medium transition-all duration-[var(--duration-quick)] hover:brightness-95"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
