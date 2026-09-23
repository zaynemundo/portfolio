"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/app/(admin)/_components/LogoutButton";
import { routes } from "@/app/(admin)/_routes";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function buildContentItems(unreadInquiries: number): NavItem[] {
  return [
    { href: routes.home, label: "Dashboard", icon: <OverviewIcon /> },
    { href: routes.homepage.index, label: "Homepage", icon: <HomeIcon /> },
    { href: routes.blog.list, label: "Blog", icon: <BlogIcon /> },
    { href: routes.caseStudies.list, label: "Case Studies", icon: <CaseStudyIcon /> },
    { href: routes.inquiries.list, label: "Inquiries", icon: <InquiriesIcon />, badge: unreadInquiries },
  ];
}

const HUB_ITEMS: NavItem[] = [
  { href: routes.notes.list, label: "Notes", icon: <NotesIcon /> },
  { href: routes.projects.list, label: "Freelance Projects", icon: <ProjectsIcon /> },
];

export function ConsoleShell({
  email, children, unreadInquiries = 0,
}: {
  email: string;
  children: React.ReactNode;
  unreadInquiries?: number;
}) {
  const pathname = usePathname();
  const contentItems = buildContentItems(unreadInquiries);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className="w-60 shrink-0 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
        <div className="h-14 flex items-center px-5 border-b border-zinc-800">
          <Link href={routes.home} className="flex items-center gap-2.5">
            <span className="text-[13px] font-extrabold tracking-tight text-white">ZM</span>
            <span className="h-4 w-px bg-zinc-800" aria-hidden="true" />
            <span className="text-[13px] font-medium text-zinc-300">Dashboard</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <NavGroup label="Content" accent="purple" items={contentItems} pathname={pathname} />
          <NavGroup label="Hub" accent="emerald" items={HUB_ITEMS} pathname={pathname} />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <p className="text-[12px] text-zinc-500 truncate mb-2">{email}</p>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-[1100px] mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}

function NavGroup({
  label, accent, items, pathname,
}: {
  label: string;
  accent: "purple" | "emerald";
  items: NavItem[];
  pathname: string;
}) {
  const activeClasses = accent === "purple"
    ? "bg-purple-500/10 text-purple-300"
    : "bg-emerald-500/10 text-emerald-300";
  const dotClasses = accent === "purple" ? "bg-purple-400" : "bg-emerald-400";

  return (
    <div>
      <p className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-zinc-600 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClasses}`} aria-hidden="true" />
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive ? activeClasses : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {!!item.badge && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10.5px] font-semibold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function iconProps() {
  return { width: 15, height: 15, viewBox: "0 0 20 20", fill: "none" as const, "aria-hidden": true };
}

function OverviewIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 9.5 10 3l7 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function BlogIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 3.5h9l3 3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 8.5h6M7 11.5h6M7 14.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function CaseStudyIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="5.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 5.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 4v1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function InquiriesIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 5.5h14v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 5.5 10 11l7-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function NotesIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 3.5h10a1 1 0 0 1 1 1V16l-3-2-3 2-3-2-3 2V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.5 7.5h5M7.5 10.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function ProjectsIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3l1.5 2h6.5A1.5 1.5 0 0 1 17 8.5v6A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5v-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
