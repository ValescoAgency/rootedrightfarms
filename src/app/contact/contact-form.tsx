"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  INQUIRY_TYPES,
  INQUIRY_LABELS,
  type InquiryType,
} from "@/lib/submissions/types";
import { submitContactAction } from "./actions";

interface Props {
  defaultInquiry: InquiryType;
}

const fieldClass =
  "w-full px-4 py-3 min-h-[44px] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-ink)] focus:border-[var(--color-accent)] outline-none transition-colors duration-[var(--duration-quick)]";

const labelClass =
  "block text-sm font-medium text-[var(--color-ink)] mb-2";

export function ContactForm({ defaultInquiry }: Props) {
  const [state, formAction, pending] = useActionState(submitContactAction, null);
  const [inquiry, setInquiry] = useState<InquiryType>(defaultInquiry);

  if (state?.data) {
    return <ThanksOverlay />;
  }

  const fieldErrors = state?.error?.fields ?? {};
  const formError =
    state?.error && state.error.code !== "invalid_input"
      ? state.error.message
      : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="inquiryType" className={labelClass}>
          How can we help?
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        </label>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value as InquiryType)}
          className={fieldClass}
        >
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {INQUIRY_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          name="name"
          label="Name"
          required
          error={fieldErrors.name}
          autoComplete="name"
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          error={fieldErrors.email}
          autoComplete="email"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="phone"
          name="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
        />
        <Field
          id="company"
          name="company"
          label="Company or dispensary"
          autoComplete="organization"
        />
      </div>

      {inquiry === "dispensary-registration" ? (
        <div className="grid gap-5 rounded-[var(--radius-md)] border border-[var(--color-border)] p-5 bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-bg))]">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Dispensary registration — we&rsquo;ll need a couple more details.
          </p>
          <Field
            id="licenseNumber"
            name="licenseNumber"
            label="OBNDD license number"
            required
            error={fieldErrors.licenseNumber}
          />
          <Field
            id="address"
            name="address"
            label="Dispensary address"
            required
            error={fieldErrors.address}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${fieldClass} min-h-[140px] resize-y`}
          aria-invalid={fieldErrors.message ? "true" : undefined}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
        />
        {fieldErrors.message ? (
          <p id="message-error" className="mt-2 text-xs text-[var(--color-error)]">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center px-8 py-3.5 min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-ink-inverse)] font-medium text-sm transition-all duration-[var(--duration-quick)] hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  required,
  error,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? (
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        ) : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={fieldClass}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ThanksOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="surface-dark rounded-[var(--radius-md)] p-10 lg:p-14 text-center"
    >
      <p
        className="font-serif text-xl font-semibold mb-6"
        style={{ letterSpacing: "0.02em" }}
      >
        Rooted Right Farms
      </p>
      <h2 className="font-serif text-3xl lg:text-4xl mb-4">Thanks.</h2>
      <p
        className="text-base lg:text-lg max-w-md mx-auto"
        style={{ color: "var(--color-ink-inv-muted)" }}
      >
        We&rsquo;ll reply within one business day. In the meantime, check out
        our strains.
      </p>
      <Link
        href="/strains"
        className="mt-8 inline-flex items-center px-7 py-3.5 rounded-full border-[1.5px] border-[var(--color-ink-inverse)] text-[var(--color-ink-inverse)] font-medium text-sm transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-ink-inverse)] hover:text-[var(--color-ink)]"
      >
        Explore Our Strains
      </Link>
    </div>
  );
}
