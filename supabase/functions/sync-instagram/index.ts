// Supabase Edge Function: sync-instagram
// Invoked daily by a cron hitting POST /functions/v1/sync-instagram with the
// service-role key. Pulls the 6 latest posts from the Instagram Graph API
// and upserts into public.instagram_posts. On failure the last-good cache
// is preserved (no DELETE is ever issued).
//
// Deploy:  supabase functions deploy sync-instagram
// Schedule (from SQL):
//   select cron.schedule('sync-instagram-daily', '0 9 * * *',
//     $$select net.http_post(
//       url := 'https://<project-ref>.functions.supabase.co/sync-instagram',
//       headers := jsonb_build_object(
//         'Authorization', 'Bearer ' || current_setting('app.cron_function_token')
//       )
//     );$$);

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck -- this file runs in Deno on Supabase Edge Runtime, not Node.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_FIELDS =
  "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp";
const REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: auth, error: authErr } = await supabase
    .from("instagram_auth")
    .select("access_token, token_expires_at")
    .eq("id", "default")
    .maybeSingle();

  if (authErr || !auth) {
    await recordError(supabase, "no token configured");
    return Response.json({ ok: false, reason: "no token" }, { status: 500 });
  }

  let accessToken: string = auth.access_token;
  let tokenExpiresAt = new Date(auth.token_expires_at);
  const now = new Date();

  if (tokenExpiresAt.getTime() - now.getTime() < REFRESH_THRESHOLD_MS) {
    try {
      const refreshed = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`,
      ).then((r) => r.json());
      if (!refreshed.access_token) throw new Error(JSON.stringify(refreshed));
      accessToken = refreshed.access_token;
      tokenExpiresAt = new Date(
        now.getTime() + refreshed.expires_in * 1000,
      );
      await supabase
        .from("instagram_auth")
        .update({
          access_token: accessToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          last_refreshed_at: now.toISOString(),
        })
        .eq("id", "default");
    } catch (err) {
      await recordError(
        supabase,
        `token refresh failed: ${errMessage(err)}`,
      );
      await sendRefreshAlert(errMessage(err));
      return Response.json(
        { ok: false, reason: "refresh" },
        { status: 500 },
      );
    }
  }

  // Fetch latest media.
  let payload: any;
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=${GRAPH_FIELDS}&limit=6&access_token=${encodeURIComponent(accessToken)}`,
    );
    payload = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(payload));
  } catch (err) {
    await recordError(supabase, `fetch failed: ${errMessage(err)}`);
    return Response.json({ ok: false, reason: "fetch" }, { status: 500 });
  }

  if (!payload || !Array.isArray(payload.data)) {
    await recordError(supabase, "malformed Graph response");
    return Response.json({ ok: false, reason: "malformed" }, { status: 500 });
  }

  const rows = payload.data
    .filter((d: any) =>
      ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"].includes(d?.media_type),
    )
    .slice(0, 6)
    .map((d: any) => ({
      ig_post_id: d.id,
      media_url: d.media_url,
      thumbnail_url: d.thumbnail_url ?? null,
      permalink: d.permalink,
      caption: d.caption ?? null,
      media_type: d.media_type,
      posted_at: d.timestamp,
      fetched_at: now.toISOString(),
    }));

  if (rows.length === 0) {
    await recordError(supabase, "no valid posts");
    return Response.json({ ok: false, reason: "empty" }, { status: 500 });
  }

  const { error: upsertErr } = await supabase
    .from("instagram_posts")
    .upsert(rows, { onConflict: "ig_post_id" });

  if (upsertErr) {
    await recordError(supabase, `upsert: ${upsertErr.message}`);
    return Response.json({ ok: false, reason: "upsert" }, { status: 500 });
  }

  await supabase
    .from("instagram_auth")
    .update({
      last_sync_at: now.toISOString(),
      last_sync_status: "ok",
      last_sync_error: null,
    })
    .eq("id", "default");

  return Response.json({ ok: true, upserted: rows.length });
});

async function recordError(supabase: any, message: string) {
  await supabase
    .from("instagram_auth")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: "error",
      last_sync_error: message,
    })
    .eq("id", "default");
  console.error("[sync-instagram]", message);
}

async function sendRefreshAlert(detail: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("INSTAGRAM_REFRESH_ALERT_EMAIL");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!key || !to || !from) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "[rootedrightfarms] Instagram token refresh failed",
      text: `The sync-instagram Edge Function could not refresh the long-lived token.\n\nReason: ${detail}\n\nIf this is not resolved within 7 days the homepage feed will go stale.`,
    }),
  }).catch(() => {});
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
