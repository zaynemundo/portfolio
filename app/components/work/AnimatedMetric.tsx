"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Parses a metric string like "+25%", "~52%", "1,228", "↑" into its parts.
 * Returns null for non-numeric values so they render without animation.
 */
function parseValue(raw: string): { prefix: string; num: number; suffix: string } | null {
  const m = raw.match(/^([^0-9]*)([0-9][0-9,]*)([^0-9]*)$/);
  if (!m) return null;
  const num = parseFloat(m[2].replace(/,/g, ""));
  if (isNaN(num)) return null;
  return { prefix: m[1], num, suffix: m[3] };
}

function formatNum(n: number, hasComma: boolean): string {
  return hasComma
    ? Math.round(n).toLocaleString("en-US")
    : Math.round(n).toString();
}

/**
 * Animates a metric value from 0 to its final number when the element
 * enters the viewport.
 *
 * Accessibility:
 * - The animated span is aria-hidden; a visually-hidden span always carries
 *   the final value for screen readers.
 * - prefers-reduced-motion skips the animation and renders the final value
 *   immediately.
 *
 * GPU-friendly: only opacity/transform via requestAnimationFrame; no layout.
 */
export function AnimatedMetric({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const parsed = parseValue(value);
  const hasComma = value.includes(",");

  useEffect(() => {
    if (!parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();

        const duration = 1200;
        const t0 = performance.now();

        const tick = (now: number) => {
          const t = Math.min((now - t0) / duration, 1);
          // ease-out cubic — fast start, gentle end
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(
            `${parsed.prefix}${formatNum(eased * parsed.num, hasComma)}${parsed.suffix}`
          );
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(value); // guarantee exact final value
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {/* Visible animated number — screen readers skip this */}
      <span aria-hidden="true">{display}</span>
      {/* Screen readers always get the final value */}
      <span className="sr-only">{value}</span>
    </span>
  );
}
