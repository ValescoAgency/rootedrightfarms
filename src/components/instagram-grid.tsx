import { getInstagramRepository } from "@/lib/instagram/repository";
import { ScrollReveal } from "@/components/scroll-reveal";

function withUtm(permalink: string): string {
  try {
    const url = new URL(permalink);
    url.searchParams.set("utm_source", "ig_embed");
    return url.toString();
  } catch {
    return permalink;
  }
}

export async function InstagramGrid() {
  const posts = await getInstagramRepository().listLatest(6);

  return (
    <section
      aria-label="From Instagram"
      className="border-t border-[var(--color-border)]"
    >
      <div className="container-site py-16 lg:py-24">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-3">FIG. 003 — ON INSTAGRAM</p>
              <h2 className="font-serif text-3xl lg:text-4xl">
                From the farm, lately.
              </h2>
            </div>
            <a
              href="https://www.instagram.com/rootedrightfarms"
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
            >
              @rootedrightfarms →
            </a>
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <ScrollReveal delayIndex={i}>
                  <div
                    className="aspect-square rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-bg-dark)_10%,var(--color-bg))] border border-[var(--color-border)] grid place-items-center"
                    aria-hidden
                  >
                    <span className="eyebrow">LOADING FEED</span>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
            {posts.map((post, i) => (
              <li key={post.id}>
                <ScrollReveal delayIndex={i}>
                  <a
                    href={withUtm(post.permalink)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block aspect-square rounded-[var(--radius-sm)] overflow-hidden bg-[color-mix(in_srgb,var(--color-bg-dark)_10%,var(--color-bg))] group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- external CDN, next/image allowlist lands with real domains */}
                    <img
                      src={post.thumbnailUrl ?? post.mediaUrl}
                      alt={
                        post.caption
                          ? post.caption.slice(0, 120)
                          : "Rooted Right Farms Instagram post"
                      }
                      className="h-full w-full object-cover transition-transform duration-[var(--duration-quick)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </a>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
