import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

/**
 * Employment export. Decrypted columns are included because the export is
 * gated on the admin role and the PII disclaimer at the top of the CSV is
 * the only way Jeff can work offline with the data. Each export writes a
 * submission_access_log row — TODO(va-43-supabase) once the real repo is
 * wired we'll emit one log row per row in the export.
 */
export async function GET() {
  await requireRole(["admin"], "/admin/submissions/employment/export.csv");

  // TODO(va-43-supabase): replace with real inbox rows once the Supabase
  // repo is live. For now emit just the header with the warning banner so
  // the route is exercised.
  const headers = [
    "id",
    "created_at",
    "status",
    "first_name",
    "last_name",
    "email",
    "phone",
    "mailing_address",
    "dob",
    "is_us_citizen",
    "is_authorized_to_work",
    "has_felony",
    "felony_explanation",
    "education",
    "military_service",
    "arrests_disclosure",
  ];

  const warning =
    "# WARNING: contains sensitive PII (DOB, felony disclosure, arrests). Handle per rootedrightfarms retention policy.\r\n";
  const body = warning + toCsv(headers, []);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="employment-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
