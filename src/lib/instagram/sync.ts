import type { InstagramRepository } from "./repository";
import type { GraphMediaResponse, InstagramMediaType } from "./types";
import { INSTAGRAM_MEDIA_TYPES } from "./types";

export interface GraphClient {
  fetchLatestMedia(
    accessToken: string,
    limit: number,
  ): Promise<GraphMediaResponse>;
  refreshLongLivedToken(
    accessToken: string,
  ): Promise<{ access_token: string; expires_in: number }>;
}

export interface SyncClock {
  now(): Date;
}

export interface TokenStore {
  load(): Promise<{
    accessToken: string;
    tokenExpiresAt: Date;
  } | null>;
  save(next: {
    accessToken: string;
    tokenExpiresAt: Date;
    lastRefreshedAt: Date;
  }): Promise<void>;
  recordSyncResult(result: {
    lastSyncAt: Date;
    lastSyncStatus: "ok" | "error";
    lastSyncError?: string;
  }): Promise<void>;
}

export interface SyncLogger {
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface RefreshAlerter {
  sendRefreshFailedAlert(message: string): Promise<void>;
}

export interface SyncDeps {
  repository: InstagramRepository;
  graph: GraphClient;
  tokenStore: TokenStore;
  logger: SyncLogger;
  alerter: RefreshAlerter;
  clock?: SyncClock;
  limit?: number;
}

export interface SyncResult {
  status: "ok" | "error";
  upserted: number;
  reason?: string;
}

const REFRESH_THRESHOLD_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure sync orchestration. Deliberately does NOT delete rows — any failure
 * (missing token, refresh failure, fetch failure, malformed response) leaves
 * the last-good cache intact and records the error in token storage.
 */
export async function runInstagramSync(deps: SyncDeps): Promise<SyncResult> {
  const now = deps.clock?.now() ?? new Date();
  const limit = deps.limit ?? 6;

  const token = await deps.tokenStore.load();
  if (!token) {
    const reason = "no token configured";
    deps.logger.error("[instagram] " + reason);
    await deps.tokenStore.recordSyncResult({
      lastSyncAt: now,
      lastSyncStatus: "error",
      lastSyncError: reason,
    });
    return { status: "error", upserted: 0, reason };
  }

  let accessToken = token.accessToken;
  let tokenExpiresAt = token.tokenExpiresAt;

  // Proactively refresh inside the 7-day window.
  const msUntilExpiry = tokenExpiresAt.getTime() - now.getTime();
  if (msUntilExpiry < REFRESH_THRESHOLD_DAYS * DAY_MS) {
    try {
      const refreshed = await deps.graph.refreshLongLivedToken(accessToken);
      accessToken = refreshed.access_token;
      tokenExpiresAt = new Date(now.getTime() + refreshed.expires_in * 1000);
      await deps.tokenStore.save({
        accessToken,
        tokenExpiresAt,
        lastRefreshedAt: now,
      });
    } catch (err) {
      const reason = `token refresh failed: ${errorMessage(err)}`;
      deps.logger.error("[instagram] " + reason);
      await deps.alerter.sendRefreshFailedAlert(reason);
      await deps.tokenStore.recordSyncResult({
        lastSyncAt: now,
        lastSyncStatus: "error",
        lastSyncError: reason,
      });
      return { status: "error", upserted: 0, reason };
    }
  }

  // Fetch.
  let payload: GraphMediaResponse;
  try {
    payload = await deps.graph.fetchLatestMedia(accessToken, limit);
  } catch (err) {
    const reason = `fetch failed: ${errorMessage(err)}`;
    deps.logger.error("[instagram] " + reason);
    await deps.tokenStore.recordSyncResult({
      lastSyncAt: now,
      lastSyncStatus: "error",
      lastSyncError: reason,
    });
    return { status: "error", upserted: 0, reason };
  }

  if (!payload || !Array.isArray(payload.data)) {
    const reason = "malformed Graph response";
    deps.logger.error("[instagram] " + reason, {
      preview: JSON.stringify(payload)?.slice(0, 200),
    });
    await deps.tokenStore.recordSyncResult({
      lastSyncAt: now,
      lastSyncStatus: "error",
      lastSyncError: reason,
    });
    return { status: "error", upserted: 0, reason };
  }

  const clean = payload.data
    .filter((d) => isMediaType(d?.media_type))
    .filter((d) => typeof d.id === "string" && typeof d.media_url === "string")
    .slice(0, limit)
    .map((d) => ({
      igPostId: d.id,
      mediaUrl: d.media_url,
      thumbnailUrl: d.thumbnail_url ?? null,
      permalink: d.permalink,
      caption: d.caption ?? null,
      mediaType: d.media_type,
      postedAt: d.timestamp,
    }));

  if (clean.length === 0) {
    const reason = "no valid posts in Graph response";
    deps.logger.warn("[instagram] " + reason);
    await deps.tokenStore.recordSyncResult({
      lastSyncAt: now,
      lastSyncStatus: "error",
      lastSyncError: reason,
    });
    return { status: "error", upserted: 0, reason };
  }

  await deps.repository.upsert(clean);
  await deps.tokenStore.recordSyncResult({
    lastSyncAt: now,
    lastSyncStatus: "ok",
  });
  return { status: "ok", upserted: clean.length };
}

function isMediaType(value: unknown): value is InstagramMediaType {
  return (
    typeof value === "string" &&
    (INSTAGRAM_MEDIA_TYPES as readonly string[]).includes(value)
  );
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
