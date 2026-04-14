import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type AppRole = "admin" | "submissions_viewer";

export interface AuthenticatedSession {
  userId: string;
  email: string;
  roles: AppRole[];
}

/**
 * Load the current session + roles. Returns `null` when the visitor has no
 * valid Supabase session.
 */
export async function getSession(): Promise<AuthenticatedSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  // RLS limits this SELECT to the user's own rows (policy select_user_roles_self).
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  return {
    userId: user.id,
    email: user.email,
    roles: (roleRows ?? []).map((r) => r.role as AppRole),
  };
}

/**
 * Pure RBAC decision — exported for tests so they can stub a session
 * instead of real Supabase. Production code should use `requireRole`.
 */
export type RequireRoleDecision =
  | { outcome: "allow"; session: AuthenticatedSession }
  | { outcome: "unauthenticated" }
  | { outcome: "forbidden"; session: AuthenticatedSession };

export function decideRequireRole(
  allowedRoles: AppRole[],
  session: AuthenticatedSession | null,
): RequireRoleDecision {
  if (!session) return { outcome: "unauthenticated" };
  if (session.roles.some((role) => allowedRoles.includes(role))) {
    return { outcome: "allow", session };
  }
  return { outcome: "forbidden", session };
}

/**
 * Server helper for admin routes. Redirects unauthenticated visitors to the
 * login page (with a `next` param so they return after signing in) and
 * throws a 403-ish redirect for authenticated users without the required
 * role.
 */
export async function requireRole(
  allowedRoles: AppRole[],
  currentPath: string,
): Promise<AuthenticatedSession> {
  const session = await getSession();
  const decision = decideRequireRole(allowedRoles, session);

  if (decision.outcome === "unauthenticated") {
    const target = `/admin/login?next=${encodeURIComponent(currentPath)}`;
    redirect(target);
  }
  if (decision.outcome === "forbidden") {
    redirect("/admin/forbidden");
  }
  return decision.session;
}
