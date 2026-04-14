import { describe, it, expect } from "vitest";
import { runInstagramSync, type SyncDeps } from "./sync";
import { createInMemoryInstagramRepository } from "./repository";
import type { InstagramPost } from "./types";

const FIXED_NOW = new Date("2026-05-01T09:00:00Z");

function makeSeed(): InstagramPost[] {
  return [
    {
      id: "seed-1",
      igPostId: "cached-post",
      mediaUrl: "https://cdn.example/cached.jpg",
      thumbnailUrl: null,
      permalink: "https://instagram.com/p/cached",
      caption: "cached",
      mediaType: "IMAGE",
      postedAt: "2026-04-01T12:00:00Z",
      fetchedAt: "2026-04-01T12:00:00Z",
    },
  ];
}

function makeDeps(overrides: {
  graphLatest?: SyncDeps["graph"]["fetchLatestMedia"];
  graphRefresh?: SyncDeps["graph"]["refreshLongLivedToken"];
  tokenOverride?: Awaited<ReturnType<SyncDeps["tokenStore"]["load"]>>;
  seed?: InstagramPost[];
}) {
  const repository = createInMemoryInstagramRepository(
    overrides.seed ?? makeSeed(),
  );
  const saves: unknown[] = [];
  const syncResults: unknown[] = [];
  const alerts: string[] = [];
  const logs: string[] = [];

  const deps: SyncDeps & {
    repository: ReturnType<typeof createInMemoryInstagramRepository>;
    saves: unknown[];
    syncResults: unknown[];
    alerts: string[];
    logs: string[];
  } = {
    repository,
    saves,
    syncResults,
    alerts,
    logs,
    graph: {
      fetchLatestMedia:
        overrides.graphLatest ??
        (async () => ({
          data: Array.from({ length: 6 }, (_, i) => ({
            id: `post-${i}`,
            media_type: "IMAGE" as const,
            media_url: `https://cdn.example/${i}.jpg`,
            permalink: `https://instagram.com/p/${i}`,
            caption: `caption ${i}`,
            timestamp: `2026-05-0${i + 1}T00:00:00Z`,
          })),
        })),
      refreshLongLivedToken:
        overrides.graphRefresh ??
        (async () => ({
          access_token: "refreshed-token",
          expires_in: 60 * 60 * 24 * 60, // 60 days
        })),
    },
    tokenStore: {
      async load() {
        if (overrides.tokenOverride !== undefined) return overrides.tokenOverride;
        return {
          accessToken: "existing-token",
          tokenExpiresAt: new Date("2026-07-01T00:00:00Z"),
        };
      },
      async save(next) {
        saves.push(next);
      },
      async recordSyncResult(r) {
        syncResults.push(r);
      },
    },
    logger: {
      warn: (m) => logs.push("W:" + m),
      error: (m) => logs.push("E:" + m),
    },
    alerter: {
      async sendRefreshFailedAlert(m) {
        alerts.push(m);
      },
    },
    clock: { now: () => FIXED_NOW },
    limit: 6,
  };
  return deps;
}

describe("runInstagramSync", () => {
  it("upserts 6 posts on a healthy response", async () => {
    const deps = makeDeps({});
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("ok");
    expect(res.upserted).toBe(6);
    // Cached row untouched + 6 new rows.
    expect(deps.repository.rows).toHaveLength(7);
  });

  it("preserves last-good cache when fetch fails", async () => {
    const deps = makeDeps({
      graphLatest: async () => {
        throw new Error("500 Upstream");
      },
    });
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("error");
    expect(deps.repository.rows).toHaveLength(1);
    expect(deps.repository.rows[0].igPostId).toBe("cached-post");
    expect(deps.syncResults[0]).toMatchObject({ lastSyncStatus: "error" });
  });

  it("preserves cache on malformed response", async () => {
    const deps = makeDeps({
      // @ts-expect-error -- intentional shape mismatch
      graphLatest: async () => ({ nope: true }),
    });
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("error");
    expect(res.reason).toMatch(/malformed/);
    expect(deps.repository.rows).toHaveLength(1);
  });

  it("refreshes a token inside the 7-day expiry window", async () => {
    const deps = makeDeps({
      tokenOverride: {
        accessToken: "stale-token",
        tokenExpiresAt: new Date(FIXED_NOW.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    });
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("ok");
    expect(deps.saves).toHaveLength(1);
    // Sync continued after refresh and upserted posts.
    expect(res.upserted).toBe(6);
  });

  it("alerts + preserves cache when token refresh fails", async () => {
    const deps = makeDeps({
      tokenOverride: {
        accessToken: "stale-token",
        tokenExpiresAt: new Date(FIXED_NOW.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      graphRefresh: async () => {
        throw new Error("refresh 400");
      },
    });
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("error");
    expect(deps.alerts).toHaveLength(1);
    expect(deps.repository.rows).toHaveLength(1);
  });

  it("errors cleanly when no token is configured", async () => {
    const deps = makeDeps({ tokenOverride: null });
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("error");
    expect(res.reason).toMatch(/no token/);
    expect(deps.repository.rows).toHaveLength(1);
  });

  it("skips non-IMAGE/VIDEO/CAROUSEL_ALBUM entries", async () => {
    const deps = makeDeps({
      graphLatest: async () => ({
        data: [
          // @ts-expect-error -- intentional unknown type
          { id: "bad", media_type: "STORY", media_url: "x", permalink: "p", timestamp: "t" },
          {
            id: "ok",
            media_type: "IMAGE",
            media_url: "https://cdn/ok.jpg",
            permalink: "https://instagram.com/p/ok",
            timestamp: "2026-05-01T00:00:00Z",
          },
        ],
      }),
    });
    const res = await runInstagramSync(deps);
    expect(res.status).toBe("ok");
    expect(res.upserted).toBe(1);
    expect(deps.repository.rows.find((r) => r.igPostId === "ok")).toBeDefined();
    expect(deps.repository.rows.find((r) => r.igPostId === "bad")).toBeUndefined();
  });
});
