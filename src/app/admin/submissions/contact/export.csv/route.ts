import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { listContactInbox } from "../data";
import { toCsv } from "@/lib/csv";
import { INQUIRY_LABELS } from "@/lib/submissions/types";
import type { SubmissionStatus } from "@/lib/submissions/admin-inbox";

export async function GET(request: NextRequest) {
  await requireRole(["admin"], "/admin/submissions/contact/export.csv");

  const status = request.nextUrl.searchParams.get(
    "status",
  ) as SubmissionStatus | null;

  const rows = await listContactInbox({
    status: status ?? undefined,
  });

  const headers = [
    "created_at",
    "status",
    "inquiry_type",
    "name",
    "email",
    "phone",
    "company",
    "license_number",
    "address",
    "message",
  ];

  const body = toCsv(
    headers,
    rows.map((r) => [
      r.createdAt,
      r.status,
      INQUIRY_LABELS[r.inquiryType],
      r.name,
      r.email,
      r.phone ?? "",
      r.company ?? "",
      r.licenseNumber ?? "",
      r.address ?? "",
      r.message,
    ]),
  );

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="contact-submissions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
