import { describe, it, expect, vi } from "vitest";
import {
  nextStatus,
  createInMemoryContactInbox,
  createInMemoryEmploymentInbox,
  type ContactInboxRow,
  type EmploymentInboxRow,
} from "./admin-inbox";
import type { EmploymentRowAtRest } from "./employment-repository";

describe("nextStatus", () => {
  it("new → read only via markRead", () => {
    expect(nextStatus("new", "markRead")).toBe("read");
    expect(nextStatus("read", "markRead")).toBeNull();
  });

  it("archive works from new + read", () => {
    expect(nextStatus("new", "archive")).toBe("archived");
    expect(nextStatus("read", "archive")).toBe("archived");
    expect(nextStatus("archived", "archive")).toBeNull();
  });

  it("unarchive flips archived back to read", () => {
    expect(nextStatus("archived", "unarchive")).toBe("read");
    expect(nextStatus("read", "unarchive")).toBeNull();
  });
});

describe("contact inbox list filtering", () => {
  const seed: ContactInboxRow[] = [
    row("1", "wholesale", "new"),
    row("2", "wholesale", "read"),
    row("3", "general", "archived"),
  ];
  const inbox = createInMemoryContactInbox(seed);

  it("filters by status", async () => {
    const rows = await inbox.list({ status: "new" });
    expect(rows.map((r) => r.id)).toEqual(["1"]);
  });

  it("filters by inquiry type", async () => {
    const rows = await inbox.list({ inquiryType: "wholesale" });
    expect(rows.map((r) => r.id).sort()).toEqual(["1", "2"]);
  });

  it("transitions status by id", async () => {
    await inbox.setStatus("1", "read");
    expect((await inbox.get("1"))?.status).toBe("read");
  });
});

describe("employment inbox decryption + audit", () => {
  const atRest: Record<string, EmploymentRowAtRest> = {
    "emp-1": {
      id: "emp-1",
      firstName: "Alex",
      lastName: "Doe",
      dobEncrypted: "CIPHER:dob",
      phone: "555",
      email: null,
      mailingAddress: "123 any",
      isUsCitizen: true,
      isAuthorizedToWork: null,
      hasFelonyEncrypted: "CIPHER:no",
      felonyExplanationEncrypted: null,
      education: "high_school",
      militaryService: null,
      arrestsDisclosureEncrypted: "CIPHER:NONE",
      createdAt: "2026-05-01T00:00:00Z",
    },
  };

  const listRows: EmploymentInboxRow[] = [
    {
      id: "emp-1",
      firstName: "Alex",
      lastName: "Doe",
      email: null,
      phone: "555",
      status: "new",
      createdAt: "2026-05-01T00:00:00Z",
    },
  ];

  const onAccess = vi.fn().mockResolvedValue(undefined);
  const decrypt = (r: EmploymentRowAtRest) => ({
    row: listRows[0],
    dob: r.dobEncrypted.replace("CIPHER:", ""),
    hasFelony: r.hasFelonyEncrypted.replace("CIPHER:", "") as "yes" | "no",
    felonyExplanation: null,
    arrestsDisclosure: r.arrestsDisclosureEncrypted.replace("CIPHER:", ""),
  });

  const inbox = createInMemoryEmploymentInbox({
    rows: listRows,
    decrypt,
    atRestLookup: (id) => atRest[id] ?? null,
    onAccess,
  });

  it("decrypts and writes an audit row when opened", async () => {
    const r = await inbox.openForReview("emp-1", "user-123");
    expect(r?.dob).toBe("dob");
    expect(r?.arrestsDisclosure).toBe("NONE");
    expect(onAccess).toHaveBeenCalledOnce();
    expect(onAccess.mock.calls[0][0]).toMatchObject({
      actorUserId: "user-123",
      submissionId: "emp-1",
    });
  });

  it("returns null for unknown id without logging", async () => {
    const calls = onAccess.mock.calls.length;
    const r = await inbox.openForReview("missing", "user-123");
    expect(r).toBeNull();
    expect(onAccess.mock.calls.length).toBe(calls);
  });
});

function row(
  id: string,
  inquiryType: ContactInboxRow["inquiryType"],
  status: ContactInboxRow["status"],
): ContactInboxRow {
  return {
    id,
    inquiryType,
    name: `N${id}`,
    email: `${id}@e.com`,
    phone: "",
    company: "",
    licenseNumber: "",
    address: "",
    message: "msg",
    certifiedTruthful: undefined as never, // contact schema doesn't use this
    status,
    createdAt: new Date().toISOString(),
  };
}
