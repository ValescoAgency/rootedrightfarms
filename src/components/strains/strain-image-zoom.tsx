"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeHover(cb: () => void) {
  const mm = window.matchMedia(HOVER_QUERY);
  mm.addEventListener("change", cb);
  return () => mm.removeEventListener("change", cb);
}

function getHoverSnapshot() {
  return window.matchMedia(HOVER_QUERY).matches;
}

function getHoverServerSnapshot() {
  return false;
}

interface StrainImageZoomProps {
  src: string;
  alt: string;
  zoom?: number;
  className?: string;
}

export function StrainImageZoom({
  src,
  alt,
  zoom = 2,
  className = "",
}: StrainImageZoomProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canHover = useSyncExternalStore(
    subscribeHover,
    getHoverSnapshot,
    getHoverServerSnapshot,
  );

  const updatePos = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x, y });
  };

  const handleClick = () => {
    if (!canHover) setLightboxOpen(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${canHover ? "cursor-zoom-in" : "cursor-pointer"} ${className}`}
        onMouseMove={canHover ? (e) => updatePos(e.clientX, e.clientY) : undefined}
        onMouseLeave={canHover ? () => setPos(null) : undefined}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={canHover ? `Zoom in on ${alt}` : `Open ${alt} fullscreen`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder until next/image config lands in VA-42 */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-[var(--duration-quick)] ease-[var(--ease-out)] select-none"
          style={
            pos
              ? {
                  transform: `scale(${zoom})`,
                  transformOrigin: `${pos.x}% ${pos.y}%`,
                }
              : undefined
          }
        />
      </div>
      {lightboxOpen ? (
        <Lightbox src={src} alt={alt} onClose={() => setLightboxOpen(false)} />
      ) : null}
    </>
  );
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20"
      >
        ×
      </button>
      <div
        className="max-h-full max-w-full overflow-auto"
        style={{ touchAction: "pinch-zoom" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder until next/image config lands in VA-42 */}
        <img
          src={src}
          alt={alt}
          className="block select-none"
          style={{ maxHeight: "92vh", maxWidth: "96vw", width: "auto", height: "auto" }}
          draggable={false}
        />
      </div>
    </div>
  );
}
