"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AGE_COOKIE,
  AGE_COOKIE_MAX_AGE_SECONDS,
  sanitizeNextParam,
} from "@/lib/age-gate";

export async function confirmAge(formData: FormData) {
  const next = sanitizeNextParam(formData.get("next")?.toString());
  const store = await cookies();
  store.set(AGE_COOKIE, "1", {
    maxAge: AGE_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  redirect(next);
}

export async function denyAge() {
  redirect("/age-blocked");
}
