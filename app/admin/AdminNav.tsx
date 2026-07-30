"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "../actions/admin-auth";

type NavItem = { href: string; label: string; icon: string; badge?: boolean };

const overviewItems: NavItem[] = [
  { href: "/admin",           label: "Dashboard", icon: "dashboard" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inquiries", badge: true },
];

const contentItems: NavItem[] = [
  { href: "/admin/projects",   label: "Works & Projects",  icon: "projects" },
  { href: "/admin/blog",       label: "Blog Articles",     icon: "blog" },
  { href: "/admin/about",      label: "About & Profile",   icon: "about" },
  { href: "/admin/experience", label: "Experience",       icon: "experience" },
  { href: "/admin/skills",     label: "Skills & Tools",   icon: "skills" },
  { href: "/admin/links",      label: "Contact & Links",  icon: "links" },
];

const settingsItems: NavItem[] = [
  { href: "/admin/profile", label: "Account & Access", icon: "account" },
];

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case "dashboard":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "inquiries":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "projects":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M2.5 4a1.5 1.5 0 011.5-1.5h8a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012.5 12V4z" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 6.5h5M5.5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "blog":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M3.5 3h9M3.5 6h9M3.5 9h6M3.5 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "about":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 7.5v4M8 5.25v.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "experience":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 5V3.5a1 1 0 011-1h3a1 1 0 011 1V5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "skills":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M3 13l3.5-3.5M10.5 4.5L13 2M10.5 4.5l-6 6M10.5 4.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "links":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M6.5 9.5l3-3M6 5H4.5a2.5 2.5 0 100 5H6M10 11h1.5a2.5 2.5 0 100-5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "account":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function NavLink({
  item,
  exact = false,
  unread = 0,
}: {
  item: NavItem;
  exact?: boolean;
  unread?: number;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-blue-50/90 text-blue-700 font-semibold shadow-2xs before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-600 before:rounded-r"
          : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <NavIcon name={item.icon} />
        <span>{item.label}</span>
      </div>
      {item.badge && unread > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[9.5px] font-extrabold shadow-2xs">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}

export function AdminNav({ unread = 0 }: { unread?: number }) {
  const [contentOpen, setContentOpen] = useState(true);

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-white border-r border-zinc-200/80 shadow-2xs select-none">

      {/* Brand Header */}
      <div className="px-5 h-16 flex items-center justify-between shrink-0 border-b border-zinc-100">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-[12px] group-hover:bg-blue-600 transition-colors duration-200 shadow-2xs">
            ZM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[13.5px] font-extrabold text-zinc-950 leading-tight">Admin Console</p>
            </div>
            <p className="text-[10.5px] text-zinc-400 font-mono leading-tight">zairamundo.com</p>
          </div>
        </Link>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">

        {/* Overview */}
        <div>
          <p className="px-2 mb-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.14em]">
            Overview
          </p>
          <div className="space-y-1">
            {overviewItems.map((item, i) => (
              <NavLink key={item.href} item={item} exact={i === 0} unread={unread} />
            ))}
          </div>
        </div>

        {/* Content Management */}
        <div>
          <button
            type="button"
            onClick={() => setContentOpen((o) => !o)}
            className="w-full flex items-center justify-between px-2 mb-2 group focus:outline-none"
          >
            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.14em] group-hover:text-zinc-700 transition-colors">
              Content Management
            </p>
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              className={`text-zinc-400 group-hover:text-zinc-600 transition-transform duration-200 ${contentOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {contentOpen && (
            <div className="space-y-1">
              {contentItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <p className="px-2 mb-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.14em]">
            System &amp; Settings
          </p>
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

      </nav>

      {/* Footer Profile & Live Link */}
      <div className="shrink-0 px-3.5 pb-5 pt-3 border-t border-zinc-100 space-y-2.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-semibold text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 transition-colors duration-150 border border-transparent hover:border-zinc-200/60"
        >
          <span className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-zinc-400 shrink-0">
              <path d="M2 12L12 2M12 2H6M12 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Live Portfolio
          </span>
          <span className="text-[10px] font-mono text-zinc-400">↗</span>
        </Link>

        <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 shadow-2xs">
            <span className="text-[9.5px] font-extrabold text-white">ZM</span>
          </div>
          <Link href="/admin/profile" className="flex-1 min-w-0">
            <p className="text-[12.5px] font-bold text-zinc-950 truncate leading-tight">Zaira Mundo</p>
            <p className="text-[10.5px] text-zinc-500 truncate leading-tight">Administrator</p>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              title="Log out of Admin Portal"
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2.5M9 10l3-3-3-3M12 7H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}


