import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Cookie-free Supabase client for public read paths.
 *
 * Use this inside `generateStaticParams`, ISR re-renders, or any
 * server-side read that does NOT require the current user's session
 * (RLS evaluates requests under the `anon` role). Admin actions and
 * anything that inspects `auth.uid()` must use `createSupabaseServerClient`
 * instead so the request carries the user's cookies.
 *
 * `cookies()` is not callable inside `generateStaticParams` (build-time,
 * no HTTP request), which is why this exists.
 */
export function createSupabaseAnonClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
