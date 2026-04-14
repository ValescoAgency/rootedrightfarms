"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  /** 0-indexed child index for staggered entry (60ms per step). */
  delayIndex?: number;
  className?: string;
}

/**
 * Wraps a block in the DESIGN.md scroll reveal: fade + translateY(16px→0)
 * over 480ms with 60ms stagger. Honors prefers-reduced-motion via the
 * global media query in globals.css — the translate is dropped but opacity
 * still fades.
 *
 * Always renders a `<div>`. Consumers put their semantic markup inside.
 */
export function ScrollReveal({ children, delayIndex = 0, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-[var(--ease-out)]",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
      style={{
        transitionDuration: "var(--duration-editorial)",
        transitionDelay: `${delayIndex * 60}ms`,
      }}
    >
      {children}
    </div>
  );
}
