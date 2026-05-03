import { randomUUID } from "node:crypto";
import { createSupabaseAnonClient } from "@/lib/supabase/anon";
import {
  createInMemorySubmissionsRepository,
  type PersistedSubmission,
  type SubmissionsRepository,
} from "./repository";

export function createSupabaseContactRepository(): SubmissionsRepository {
  return {
    async insertContact(input, meta): Promise<PersistedSubmission> {
      const client = createSupabaseAnonClient();

      // Generate id and timestamp app-side — anon role has INSERT but no
      // SELECT on contact_submissions, so chaining .select() would fail RLS.
      const id = randomUUID();
      const createdAt = new Date().toISOString();

      const { error } = await client.from("contact_submissions").insert({
        id,
        inquiry_type: input.inquiryType,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        company: input.company || null,
        license_number: input.licenseNumber || null,
        address: input.address || null,
        message: input.message,
        metadata: meta,
      });

      if (error) {
        throw new Error(`contact_submissions insert failed: ${error.message}`);
      }

      return { ...input, id, createdAt };
    },
  };
}

export function getContactRepository(): SubmissionsRepository {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return createSupabaseContactRepository();
  }
  return createInMemorySubmissionsRepository();
}
