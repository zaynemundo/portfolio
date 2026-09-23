"use client";

import { ProjectLogo } from "@/app/components/ProjectLogo";
import type { ClientLogoData } from "@/app/lib/client-logos";
import { STATIC_CLIENT_LOGOS } from "@/app/lib/client-logos";

interface Props {
  brands?: ClientLogoData[];
}

export function ClientLogos({ brands = STATIC_CLIENT_LOGOS }: Props) {
  const marqueeItems = [...brands, ...brands, ...brands];

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden" aria-label="Brands and Clients">
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

      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="animate-marquee flex items-center gap-12 md:gap-20">
          {marqueeItems.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex items-center gap-3.5 shrink-0 cursor-default group"
            >
              <ProjectLogo name={brand.name} logo={{ initials: brand.initials, bg: brand.bg, light: brand.light }} size={42} radius={10} />
              <span className="text-[17px] md:text-[19px] font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors whitespace-nowrap tracking-tight">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
