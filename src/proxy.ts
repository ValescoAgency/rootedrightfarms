import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, buildAgeCheckUrl, isExemptPath } from "@/lib/age-gate";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExemptPath(pathname)) return NextResponse.next();

  const verified = request.cookies.get(AGE_COOKIE);
  if (verified?.value === "1") return NextResponse.next();

  return NextResponse.redirect(buildAgeCheckUrl(request.nextUrl));
}

export const config = {
  // Skip static file routes at the matcher level for a cheap fast-path.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
