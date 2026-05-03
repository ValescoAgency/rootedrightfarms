export interface NewsletterProvider {
  /**
   * Add a contact to the external newsletter provider.
   * Returns the provider-assigned contact id so it can be mirrored locally.
   * Throws on failure — the caller decides retry/persistence semantics.
   */
  addContact(email: string): Promise<{ contactId: string }>;
}

/** Default no-op provider — used when env is missing or in unit tests. */
export function createNoopNewsletterProvider(): NewsletterProvider & {
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    async addContact(email) {
      calls.push(email);
      return { contactId: `noop-${email}` };
    },
  };
}

/** Resend Audiences provider. */
export function createResendAudiencesProvider(params: {
  apiKey: string;
  audienceId: string;
}): NewsletterProvider {
  return {
    async addContact(email) {
      const { Resend } = await import("resend");
      const client = new Resend(params.apiKey);
      const res = await client.contacts.create({
        email,
        audienceId: params.audienceId,
        unsubscribed: false,
      });
      if (res.error) {
        throw new Error(`Resend contacts.create failed: ${res.error.message}`);
      }
      const id = res.data?.id;
      if (!id) {
        throw new Error("Resend contacts.create returned no contact id");
      }
      return { contactId: id };
    },
  };
}
