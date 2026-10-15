"use client";

import type { ClientLogoData } from "@/app/lib/client-logos";
import { STATIC_CLIENT_LOGOS } from "@/app/lib/client-logos";
import { optimizedImage, SMALL_WIDTHS } from "@/app/lib/image-src";

interface Props {
  brands?: ClientLogoData[];
}

export function ClientLogos({ brands = STATIC_CLIENT_LOGOS }: Props) {
  // Only logos with an image scroll past; ones still waiting for an upload stay out of sight.
  const shown = brands.filter((b) => b.logoUrl);
  if (shown.length === 0) return null;
  const marqueeItems = [...shown, ...shown, ...shown];

  return (
    <section className="py-10 md:py-16 bg-white overflow-hidden" aria-label="Brands and Clients">
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Padded top and bottom so the name under a hovered logo isn't cut off by the clipping that hides the scroll. */}
      <div className="relative w-full overflow-hidden py-6 pb-12">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="animate-marquee flex items-center gap-14 md:gap-24">
          {marqueeItems.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="relative flex items-center justify-center shrink-0 cursor-default group h-12"
            >
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  // Small WebP copies sized for a logo about 140px wide, not the uploaded original.
                  {...optimizedImage(brand.logoUrl, "140px", 75, SMALL_WIDTHS)}
                  loading="lazy"
                  alt={brand.name}
                  className="h-10 md:h-12 w-auto max-w-[140px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-[15px] font-bold group-hover:bg-zinc-200 transition-colors">
                  {brand.name.charAt(0)}
                </div>
              )}
              <span className="pointer-events-none absolute top-full mt-3 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-zinc-900 px-3 py-1 text-[12px] font-medium text-white opacity-0 shadow-sm group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
