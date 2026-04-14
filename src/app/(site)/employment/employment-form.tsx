"use client";

import { useActionState, useState } from "react";
import {
  EDUCATION_LEVELS,
  EDUCATION_LABELS,
} from "@/lib/submissions/employment-schema";
import { submitEmploymentAction } from "./actions";

const fieldClass =
  "w-full px-4 py-3 min-h-[44px] border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-ink)] focus:border-[var(--color-accent)] outline-none transition-colors duration-[var(--duration-quick)]";

const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-2";

export function EmploymentForm() {
  const [state, formAction, pending] = useActionState(
    submitEmploymentAction,
    null,
  );
  const [isUsCitizen, setIsUsCitizen] = useState<"yes" | "no" | "">("");
  const [hasFelony, setHasFelony] = useState<"yes" | "no" | "">("");

  if (state?.data) {
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
        <h2 className="font-serif text-3xl lg:text-4xl mb-4">
          Application received.
        </h2>
        <p
          className="text-base lg:text-lg max-w-md mx-auto"
          style={{ color: "var(--color-ink-inv-muted)" }}
        >
          Thanks for applying. We retain applications and will be in touch
          when a position opens that matches.
        </p>
      </div>
    );
  }

  const errors = state?.error?.fields ?? {};
  const formError =
    state?.error && state.error.code !== "invalid_input"
      ? state.error.message
      : null;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          name="firstName"
          label="First name"
          required
          error={errors.firstName}
        />
        <Field
          id="lastName"
          name="lastName"
          label="Last name"
          required
          error={errors.lastName}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="dob"
          name="dob"
          type="date"
          label="Date of birth"
          required
          error={errors.dob}
        />
        <Field
          id="phone"
          name="phone"
          type="tel"
          label="Cell phone"
          required
          error={errors.phone}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="email"
          name="email"
          type="email"
          label="Email (optional)"
          error={errors.email}
        />
        <Field
          id="mailingAddress"
          name="mailingAddress"
          label="Physical mailing address"
          required
          error={errors.mailingAddress}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>
          Are you a US Citizen?{" "}
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        </legend>
        <RadioPair
          name="isUsCitizen"
          value={isUsCitizen}
          onChange={setIsUsCitizen}
        />
      </fieldset>

      {isUsCitizen === "no" ? (
        <fieldset>
          <legend className={labelClass}>
            If no, are you authorized to work in the US?
          </legend>
          <RadioPair name="isAuthorizedToWork" />
          {errors.isAuthorizedToWork ? (
            <FieldError message={errors.isAuthorizedToWork} />
          ) : null}
        </fieldset>
      ) : null}

      <fieldset>
        <legend className={labelClass}>
          Have you ever been convicted of a felony?{" "}
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        </legend>
        <RadioPair
          name="hasFelony"
          value={hasFelony}
          onChange={setHasFelony}
        />
      </fieldset>

      {hasFelony === "yes" ? (
        <Field
          as="textarea"
          id="felonyExplanation"
          name="felonyExplanation"
          label="If yes, please explain"
          required
          rows={3}
          error={errors.felonyExplanation}
        />
      ) : null}

      <div>
        <label htmlFor="education" className={labelClass}>
          Highest education completed{" "}
          <span
            aria-hidden
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
            style={{ background: "var(--color-accent)" }}
          />
        </label>
        <select id="education" name="education" required className={fieldClass}>
          <option value="">Select one</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {EDUCATION_LABELS[level]}
            </option>
          ))}
        </select>
        {errors.education ? <FieldError message={errors.education} /> : null}
      </div>

      <Field
        as="textarea"
        id="militaryService"
        name="militaryService"
        label="US Military service history (optional)"
        rows={3}
      />

      <Field
        as="textarea"
        id="arrestsDisclosure"
        name="arrestsDisclosure"
        label="List any arrests or convictions, including year and description (if none, enter NONE)"
        required
        rows={4}
        error={errors.arrestsDisclosure}
      />

      <section
        aria-label="Certification"
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-bg))] p-5 space-y-4"
      >
        <p className="text-sm text-[var(--color-ink-muted)] leading-[1.7]">
          Rooted Right Farms is an equal-opportunity employer. We do not
          discriminate on the basis of race, color, religion, sex, national
          origin, age, disability, veteran status, or any other protected
          status. Employment is at-will. A criminal record does not
          automatically disqualify an applicant; cannabis-industry rules may
          require additional vetting for certain roles.
        </p>
        <label className="flex gap-3 items-start text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            name="certifiedTruthful"
            required
            className="mt-1 w-4 h-4 accent-[var(--color-accent)]"
          />
          <span>
            I certify that the information provided is true and complete to
            the best of my knowledge. I understand that any false statement
            may result in disqualification or termination.
          </span>
        </label>
        {errors.certifiedTruthful ? (
          <FieldError message={errors.certifiedTruthful} />
        ) : null}
      </section>

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
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  as = "input",
  rows,
  required,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  required?: boolean;
  error?: string;
}) {
  const common = {
    id,
    name,
    required,
    "aria-invalid": error ? ("true" as const) : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: fieldClass,
  };
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
      {as === "textarea" ? (
        <textarea
          {...common}
          rows={rows ?? 4}
          className={`${fieldClass} resize-y min-h-[100px]`}
        />
      ) : (
        <input {...common} type={type} />
      )}
      {error ? <FieldError message={error} id={`${id}-error`} /> : null}
    </div>
  );
}

function FieldError({ message, id }: { message: string; id?: string }) {
  return (
    <p id={id} className="mt-2 text-xs text-[var(--color-error)]">
      {message}
    </p>
  );
}

function RadioPair({
  name,
  value,
  onChange,
}: {
  name: string;
  value?: string;
  onChange?: (v: "yes" | "no") => void;
}) {
  return (
    <div className="flex gap-6">
      {(["yes", "no"] as const).map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value ? value === opt : undefined}
            onChange={() => onChange?.(opt)}
            required
            className="accent-[var(--color-accent)]"
          />
          {opt === "yes" ? "Yes" : "No"}
        </label>
      ))}
    </div>
  );
}
