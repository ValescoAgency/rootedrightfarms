import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after both magic link + OAuth callbacks with a
 * `code` param. Exchange the code for a session, then redirect to the
 * originally requested `next` URL.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitize(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback-failed", url.origin),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=callback-failed&message=${encodeURIComponent(error.message)}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

function sanitize(next: string | null): string {
  if (!next) return "/admin";
  if (!next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}
