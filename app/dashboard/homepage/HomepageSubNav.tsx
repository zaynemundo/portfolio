"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/app/dashboard/routes";

const TABS = [
  { href: routes.homepage.hero, label: "Hero Banner" },
  { href: routes.homepage.selectedWork, label: "Selected Work" },
  { href: routes.homepage.about, label: "About" },
  { href: routes.homepage.insights, label: "Insights" },
];

export function HomepageSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 mb-8 border-b border-zinc-800">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? "border-purple-400 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
