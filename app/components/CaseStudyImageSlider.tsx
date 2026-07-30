"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface SliderImage {
  label: string;
  alt: string;
  src?: string;
}

interface Props {
  images: SliderImage[];
  placeholderBg?: string;
  placeholderDark?: boolean;
  autoPlayInterval?: number;
}

export function CaseStudyImageSlider({
  images,
  placeholderBg = "#f4f4f5",
  placeholderDark = false,
  autoPlayInterval = 4000,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const isPausedRef = useRef(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Drag
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  /* Scroll to a specific slide index */
  const scrollToIdx = useCallback((idx: number, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    const item = track.children[idx] as HTMLElement;
    if (!item) return;
    const offset = item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2;
    track.scrollTo({ left: offset, behavior: smooth ? "smooth" : "instant" });
    activeIdxRef.current = idx;
    setActiveIdx(idx);
  }, []);

  /* Wrap-around navigation */
  const goTo = useCallback((raw: number) => {
    const idx = ((raw % images.length) + images.length) % images.length;
    scrollToIdx(idx);
  }, [images.length, scrollToIdx]);

  /* Auto-advance */
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      if (!isPausedRef.current) goTo(activeIdxRef.current + 1);
    }, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlayInterval, goTo, images.length]);

  /* Sync active index on native scroll (touch swipe) */
  const handleScroll = useCallback(() => {
    if (isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    activeIdxRef.current = closest;
    setActiveIdx(closest);
  }, []);

  /* Mouse drag — disable scroll-snap during drag, re-enable on release */
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = track.scrollLeft;
    isPausedRef.current = true;
    track.style.scrollSnapType = "none"; // disable snap so manual scroll works
    track.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = dragStartScrollRef.current - (e.clientX - dragStartXRef.current);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    isPausedRef.current = false;
    const track = trackRef.current;
    if (!track) return;
    track.style.scrollSnapType = ""; // re-enable snap
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 50) {
      goTo(activeIdxRef.current + (delta < 0 ? 1 : -1));
    } else {
      scrollToIdx(activeIdxRef.current); // snap back in place
    }
  }, [goTo, scrollToIdx]);

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx !== null) {
        if (e.key === "ArrowLeft")  setLightboxIdx((p) => p !== null ? (p - 1 + images.length) % images.length : null);
        if (e.key === "ArrowRight") setLightboxIdx((p) => p !== null ? (p + 1) % images.length : null);
        if (e.key === "Escape")     setLightboxIdx(null);
        return;
      }
      if (e.key === "ArrowLeft")  goTo(activeIdxRef.current - 1);
      if (e.key === "ArrowRight") goTo(activeIdxRef.current + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, images.length, lightboxIdx]);

  /* Scroll lock when lightbox open */
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIdx]);

  if (images.length === 0) return null;

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = false; }}
      >
        {/* Scroll track — slides peek adjacent images */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          tabIndex={0}
          aria-label="Project screenshots"
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory outline-none select-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="snap-center flex-shrink-0 relative"
              style={{ width: "clamp(300px, 76vw, 920px)" }}
            >
              {/* Pill label — overlays the boundary between slides */}
              <div
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-3 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-sm text-white text-[11px] font-mono font-medium whitespace-nowrap pointer-events-none select-none"
              >
                {img.label}
              </div>

              {/* Image */}
              <div
                className="aspect-[16/10] rounded-xl overflow-hidden border flex items-center justify-center"
                style={{
                  backgroundColor: placeholderBg,
                  borderColor: placeholderDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  backgroundImage: placeholderDark
                    ? "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)"
                    : "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {img.src ? (
                  <button
                    onClick={() => { if (!isDraggingRef.current) setLightboxIdx(i); }}
                    className="w-full h-full block"
                    aria-label={`Expand ${img.alt}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                  </button>
                ) : (
                  <div className="text-center px-8">
                    <p
                      className="text-[11px] font-medium mb-1"
                      style={{ color: placeholderDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)" }}
                    >
                      {img.label}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: placeholderDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" }}
                    >
                      Screenshot to be added
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-5">
          {/* Numbered indicators */}
          <div className="flex items-center gap-4" role="tablist" aria-label="Slide indicators">
            {images.map((img, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goTo(i)}
                  aria-label={`View ${img.label}`}
                  className="flex items-center gap-2 transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0.3 }}
                >
                  <span
                    className="font-mono transition-all duration-300"
                    style={{
                      fontSize: "11px",
                      fontWeight: isActive ? 600 : 400,
                      color: placeholderDark ? "#fff" : "#18181b",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {isActive && (
                    <span
                      className="text-[11px] font-medium truncate max-w-[140px]"
                      style={{ color: placeholderDark ? "rgba(255,255,255,0.55)" : "#71717a" }}
                    >
                      {img.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Arrow buttons */}
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo(activeIdx - 1)}
                aria-label="Previous screenshot"
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100 transition-all duration-150"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => goTo(activeIdx + 1)}
                aria-label="Next screenshot"
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100 transition-all duration-150"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[lightboxIdx].alt}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 backdrop-blur-md"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            aria-label="Close lightbox"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors duration-150 z-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => p !== null ? (p - 1 + images.length) % images.length : null); }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors duration-150 z-10"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div
            className="relative max-w-[90vw] max-h-[88vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {images[lightboxIdx].src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={images[lightboxIdx].src}
                alt={images[lightboxIdx].alt}
                className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
                draggable={false}
              />
            ) : (
              <div className="w-[70vw] aspect-[16/10] rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                No image
              </div>
            )}
            <p className="text-[12px] text-white/50 font-mono">
              {String(lightboxIdx + 1).padStart(2, "0")} — {images[lightboxIdx].label}
              <span className="ml-3 text-white/25">{lightboxIdx + 1} / {images.length}</span>
            </p>
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => p !== null ? (p + 1) % images.length : null); }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors duration-150 z-10"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
