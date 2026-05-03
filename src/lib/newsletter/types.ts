export interface Subscriber {
  id: string;
  email: string;
  resendContactId: string | null;
  source: string | null;
  createdAt: string;
}

export type SubscribeEnvelope =
  | { data: { alreadySubscribed: boolean }; error: null }
  | { data: null; error: { code: string; message: string } };
