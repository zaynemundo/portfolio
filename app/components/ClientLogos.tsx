"use client";

import { ProjectLogo } from "@/app/components/ProjectLogo";

interface ClientBrand {
  name: string;
  logo: { initials: string; bg: string; light?: boolean };
}

const BRANDS: ClientBrand[] = [
  { name: "P&O Marinas", logo: { initials: "P&O", bg: "#c0d4ec" } },
  { name: "Monili Jewellers", logo: { initials: "MJ", bg: "#d9d4cd" } },
  { name: "Scandinavian Physiotherapy", logo: { initials: "SPC", bg: "#bcd9ee" } },
  { name: "Rocky Real Estate", logo: { initials: "RRE", bg: "#d5d2cd" } },
  { name: "Nuraya Properties", logo: { initials: "NP", bg: "#ddd9c0" } },
  { name: "Althea Diamonds", logo: { initials: "AD", bg: "#e2ded8" } },
  { name: "Vijit Pillai Art", logo: { initials: "VPA", bg: "#ddd8d0" } },
  { name: "Tip2Gether", logo: { initials: "T2G", bg: "#1e4832", light: true } },
];

export function ClientLogos() {
  const marqueeItems = [...BRANDS, ...BRANDS, ...BRANDS];

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
              key={`${brand.name}-${i}`}
              className="flex items-center gap-3.5 shrink-0 cursor-default group"
            >
              <ProjectLogo name={brand.name} logo={brand.logo} size={42} radius={10} />
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
