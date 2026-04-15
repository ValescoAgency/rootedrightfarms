import { randomUUID } from "node:crypto";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import {
  createInMemoryEmploymentRepository,
  type EmploymentRepository,
  type EmploymentRowAtRest,
} from "./employment-repository";

/**
 * Convert an app-layer AES-GCM base64 ciphertext to the PostgreSQL bytea
 * hex literal that PostgREST expects when inserting into a `bytea` column.
 */
function base64ToBytea(b64: string): string {
  return "\\x" + Buffer.from(b64, "base64").toString("hex");
}

export function createSupabaseEmploymentRepository(): EmploymentRepository {
  return {
    async insert(input): Promise<EmploymentRowAtRest> {
      const client = createSupabaseAnonClient();

      // Generate id and timestamp app-side so we don't need a SELECT after
      // insert. The anon role has no SELECT policy on employment_submissions
      // (by design — submitted data is admin-only), so chaining .select()
      // would trigger an RLS violation even though the INSERT itself succeeds.
      const id = randomUUID();
      const createdAt = new Date().toISOString();

      const { error } = await client
        .from("employment_submissions")
        .insert({
          id,
          first_name: input.firstName,
          last_name: input.lastName,
          dob: base64ToBytea(input.dobEncrypted),
          phone: input.phone,
          email: input.email ?? null,
          mailing_address: input.mailingAddress,
          is_us_citizen: input.isUsCitizen,
          is_authorized_to_work: input.isAuthorizedToWork ?? null,
          has_felony: base64ToBytea(input.hasFelonyEncrypted),
          felony_explanation: input.felonyExplanationEncrypted
            ? base64ToBytea(input.felonyExplanationEncrypted)
            : null,
          education: input.education,
          military_service: input.militaryService ?? null,
          arrests_disclosure: base64ToBytea(input.arrestsDisclosureEncrypted),
        });

      if (error) {
        throw new Error(`employment_submissions insert failed: ${error.message}`);
      }

      return { ...input, id, createdAt };
    },
  };
}

export function getEmploymentRepository(): EmploymentRepository {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return createSupabaseEmploymentRepository();
  }
  return createInMemoryEmploymentRepository();
}
