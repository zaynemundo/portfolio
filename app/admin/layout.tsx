import type { Metadata } from "next";
import { AdminNav } from "./AdminNav";
import { prisma } from "../lib/prisma";

export const metadata: Metadata = { title: { default: "Admin Console", template: "%s — Admin Console" } };

async function getUnread() {
  try {
    return await prisma.contactSubmission.count({ where: { read: false } });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const unread = await getUnread();
  return (
    <div className="h-screen overflow-hidden flex bg-[#f8f9fb] antialiased text-zinc-900">
      <AdminNav unread={unread} />

      {/* Right column: topbar + scrollable content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar with backdrop blur */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 flex items-center px-6 md:px-8 gap-4 shrink-0 shadow-2xs z-10">
          <div className="flex-1 max-w-md">
            <div className="relative flex items-center">
              <svg className="absolute left-3.5 text-zinc-400 pointer-events-none" width="14" height="14" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                type="search"
                placeholder="Search works, articles, inquiries..."
                className="w-full pl-9 pr-12 py-2 text-[13px] bg-zinc-50/80 border border-zinc-200/90 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-zinc-400 font-medium"
              />
              <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3.5 ml-auto">
            {/* System Performance Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11.5px] font-semibold text-emerald-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Core Web Vitals Optimal · 100%</span>
            </div>

            {/* Quick Link to Add Work */}
            <a
              href="/admin/projects/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-white text-[12.5px] font-semibold hover:bg-blue-600 transition-colors shadow-2xs"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              New Work
            </a>

            {/* Inquiries Notification Trigger */}
            <a
              href="/admin/inquiries"
              className="relative p-2.5 rounded-xl hover:bg-zinc-100/80 text-zinc-600 transition-colors border border-transparent hover:border-zinc-200/80"
              title={unread > 0 ? `${unread} unread inquiry${unread > 1 ? "ies" : "y"}` : "Inquiries"}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3.5" width="16" height="12" rx="2" stroke={unread > 0 ? "#2563eb" : "#52525b"} strokeWidth="1.4"/>
                <path d="M1 6.5l8 5 8-5" stroke={unread > 0 ? "#2563eb" : "#52525b"} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-2xs">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </a>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


