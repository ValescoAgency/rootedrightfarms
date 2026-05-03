import { describe, it, expect } from "vitest";
import { decideRequireRole, type AuthenticatedSession } from "./auth";

const adminSession: AuthenticatedSession = {
  userId: "u1",
  email: "jeff@example.com",
  roles: ["admin"],
};

const viewerSession: AuthenticatedSession = {
  userId: "u2",
  email: "viewer@example.com",
  roles: ["submissions_viewer"],
};

const noRolesSession: AuthenticatedSession = {
  userId: "u3",
  email: "empty@example.com",
  roles: [],
};

describe("decideRequireRole", () => {
  it("returns unauthenticated when no session", () => {
    expect(decideRequireRole(["admin"], null).outcome).toBe("unauthenticated");
  });

  it("allows when the user holds the required role", () => {
    const r = decideRequireRole(["admin"], adminSession);
    expect(r.outcome).toBe("allow");
    if (r.outcome === "allow") expect(r.session.userId).toBe("u1");
  });

  it("forbids when the user has a different role", () => {
    const r = decideRequireRole(["admin"], viewerSession);
    expect(r.outcome).toBe("forbidden");
  });

  it("forbids when the user has no roles", () => {
    expect(decideRequireRole(["admin"], noRolesSession).outcome).toBe(
      "forbidden",
    );
  });

  it("allows when ANY required role is held", () => {
    const r = decideRequireRole(["admin", "submissions_viewer"], viewerSession);
    expect(r.outcome).toBe("allow");
  });
});
