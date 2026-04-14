"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/admin/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function signInWithGoogle() {
    setStatus("sending");
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/admin/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  if (status === "sent") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-sm text-[var(--color-ink-muted)]"
      >
        Sign-in link sent to <strong>{email}</strong>. Open the link from the
        same device to continue.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={sendMagicLink} className="space-y-3" noValidate>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 min-h-[44px] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-ink)] focus:border-[var(--color-accent)] outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      <div className="relative text-center text-xs text-[var(--color-ink-subtle)]">
        <span className="relative z-10 px-3 bg-[var(--color-bg)]">or</span>
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-[var(--color-border)] -z-0" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={status === "sending"}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-ink)] text-[var(--color-ink)] font-medium text-sm transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ink-inverse)] disabled:opacity-60"
      >
        Continue with Google
      </button>

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
