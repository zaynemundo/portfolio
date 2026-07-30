"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  bg?: string;
  dark?: boolean;
  aspect?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  caption,
  bg = "#f4f4f5",
  aspect = "aspect-[16/10]",
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        className={`relative ${aspect} rounded-2xl overflow-hidden border border-zinc-200 select-none cursor-ew-resize group`}
        style={{ backgroundColor: bg }}
      >
        {/* Before Image (Base Layer - Left side revealed) */}
        <div className="absolute inset-0 w-full h-full">
          {beforeImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={beforeImage} alt={beforeLabel} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-200/80 p-6 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                {beforeLabel}
              </span>
            </div>
          )}
          <span
            className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-semibold backdrop-blur-md transition-opacity duration-200"
            style={{ opacity: Math.min(1, sliderPosition / 15) }}
          >
            {beforeLabel}
          </span>
        </div>

        {/* After Image (Clipped Overlay Layer - Right side revealed) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          {afterImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-6 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                {afterLabel}
              </span>
            </div>
          )}
          <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-zinc-900/90 text-white text-[11px] font-semibold border border-zinc-700 backdrop-blur-md">
            {afterLabel}
          </span>
        </div>

        {/* Vertical Divider Bar + Circular Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle — keyboard-accessible slider control */}
          <button
            type="button"
            role="slider"
            aria-label={`Compare ${beforeLabel} and ${afterLabel}. Use arrow keys to adjust.`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft")  { e.preventDefault(); setSliderPosition((p) => Math.max(0, p - 5)); }
              if (e.key === "ArrowRight") { e.preventDefault(); setSliderPosition((p) => Math.min(100, p + 5)); }
              if (e.key === "Home")       { e.preventDefault(); setSliderPosition(0); }
              if (e.key === "End")        { e.preventDefault(); setSliderPosition(100); }
            }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-zinc-200 flex items-center justify-center text-zinc-800 transition-transform group-hover:scale-110 pointer-events-auto cursor-ew-resize"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5.5 4L1.5 8l4 4M10.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {caption && (
        <p className="text-[13px] text-zinc-500 mt-3 text-center">{caption}</p>
      )}
    </div>
  );
}
