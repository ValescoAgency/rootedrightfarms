"use client";

import { useActionState } from "react";
import { subscribeNewsletterAction } from "@/app/actions/newsletter";

interface Props {
  source?: string;
  layout?: "footer" | "inline";
}

export function NewsletterSignup({ source = "footer", layout = "footer" }: Props) {
  const [state, formAction, pending] = useActionState(
    subscribeNewsletterAction,
    null,
  );

  if (state?.data) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-[var(--color-ink-muted)]"
      >
        {state.data.alreadySubscribed
          ? "You're already on the list. Thanks."
          : "Subscribed. We'll be in touch."}
      </p>
    );
  }

  const error = state?.error?.message ?? null;

  const stacked = layout === "footer";

  return (
    <form
      action={formAction}
      noValidate
      className={
        stacked
          ? "flex flex-col gap-2"
          : "flex flex-col sm:flex-row gap-2 sm:items-center"
      }
    >
      <input type="hidden" name="source" value={source} />
      <label htmlFor={`newsletter-email-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`newsletter-email-${source}`}
        name="email"
        type="email"
        required
        placeholder="you@dispensary.com"
        autoComplete="email"
        aria-invalid={error ? "true" : undefined}
        className="flex-1 px-4 py-3 min-h-[44px] text-sm border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-ink)] focus:border-[var(--color-accent)] outline-none transition-colors duration-[var(--duration-quick)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Subscribing…" : "Subscribe"}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-[var(--color-error)] sm:basis-full">
          {error}
        </p>
      ) : null}
    </form>
  );
}
