"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function FloatingPillNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 z-50"
      style={{ bottom: "16px" }}
    >
      <ul
        className="flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: "rgba(27, 58, 40, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {primaryNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-full text-[var(--color-ink-inverse)] transition-colors",
                  "min-w-[52px] min-h-[52px] px-2",
                  active &&
                    "bg-[var(--color-accent)] [&_span]:font-semibold",
                )}
                style={{
                  transitionDuration: active
                    ? "var(--duration-editorial)"
                    : "var(--duration-quick)",
                  transitionTimingFunction: active
                    ? "var(--ease-spring)"
                    : "var(--ease-out)",
                }}
              >
                <Icon size={18} aria-hidden />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
