"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  IdCard,
  Newspaper,
  Layers,
  Mail,
  UserCog,
  FolderKanban,
  Users,
  Contact,
  FileText,
  Wallet,
  Receipt,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { routes } from "@/app/(admin)/_routes";
import { CommandPalette } from "./CommandPalette";
import { ThemeContext } from "./ThemeContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const ICON_PROPS = { size: 16, strokeWidth: 1.75 };
const THEME_STORAGE_KEY = "zm-admin-theme";

const DASHBOARD_ITEM: NavItem = { href: routes.home, label: "Dashboard", icon: <LayoutDashboard {...ICON_PROPS} /> };
const ACCOUNT_ITEM: NavItem = { href: routes.account, label: "Settings", icon: <UserCog {...ICON_PROPS} /> };

function buildContentItems(unreadInquiries: number): NavItem[] {
  return [
    { href: routes.homepage, label: "Homepage", icon: <Home {...ICON_PROPS} /> },
    { href: routes.about, label: "About", icon: <IdCard {...ICON_PROPS} /> },
    { href: routes.blog.list, label: "Blog", icon: <Newspaper {...ICON_PROPS} /> },
    { href: routes.caseStudies.list, label: "Case Studies", icon: <Layers {...ICON_PROPS} /> },
    { href: routes.inquiries.list, label: "Inquiries", icon: <Mail {...ICON_PROPS} />, badge: unreadInquiries },
  ];
}

const FREELANCE_ITEMS: NavItem[] = [
  { href: routes.clients.list, label: "Clients", icon: <Users {...ICON_PROPS} /> },
  { href: routes.projects.list, label: "Projects", icon: <FolderKanban {...ICON_PROPS} /> },
  { href: routes.finance.list, label: "Finance", icon: <Wallet {...ICON_PROPS} /> },
  { href: routes.invoices.list, label: "Invoices", icon: <Receipt {...ICON_PROPS} /> },
  { href: routes.contacts.list, label: "Contacts", icon: <Contact {...ICON_PROPS} /> },
  { href: routes.documents.list, label: "Documents", icon: <FileText {...ICON_PROPS} /> },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Closes the mobile nav on navigation — adjusted during render (React's
  // documented pattern for resetting state on a prop change) rather than a
  // useEffect, which would trip react-hooks/set-state-in-effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const allNavItems: NavItem[] = [
    DASHBOARD_ITEM,
    ...contentItems,
    ...FREELANCE_ITEMS,
    ACCOUNT_ITEM,
  ];

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount; can't be derived during render without a server/client hydration mismatch.
      setIsDark(localStorage.getItem(THEME_STORAGE_KEY) === "dark");
    } catch {
      // localStorage unavailable — stay on the light default.
    }
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // ignore
      }
      return next;
    });
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
    <div className={`admin-root ${isDark ? "dark" : ""} min-h-screen bg-background flex print:bg-white`}>
      {/* Mobile hamburger — fixed top-left, hidden once the slide-in nav is open */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="md:hidden fixed top-3 left-3 z-40 h-9 w-9 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-foreground"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile sidebar — slides in, always full nav regardless of desktop collapse state */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[300px] bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarHeader onSearch={() => setSearchOpen(true)} onCollapse={() => setMobileOpen(false)} collapseIcon={<X size={18} />} collapseLabel="Close menu" />
        <SidebarNav contentItems={contentItems} pathname={pathname} />
        <SidebarFooter email={email} />
      </aside>

      {/* Desktop sidebar */}
      {sidebarOpen ? (
        <aside className="hidden md:flex w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex-col h-screen sticky top-0 print:hidden">
          <SidebarHeader onSearch={() => setSearchOpen(true)} onCollapse={() => setSidebarOpen(false)} collapseIcon={<PanelLeftClose size={16} />} collapseLabel="Collapse sidebar" />
          <SidebarNav contentItems={contentItems} pathname={pathname} />
          <SidebarFooter email={email} />
        </aside>
      ) : (
        <CollapsedRail
          items={allNavItems}
          pathname={pathname}
          email={email}
          onExpand={() => setSidebarOpen(true)}
          onSearch={() => setSearchOpen(true)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 min-w-0 print:bg-white">
          <div className="px-8 py-10 print:p-0">{children}</div>
        </main>
      </div>

      {searchOpen && <CommandPalette items={allNavItems} onClose={() => setSearchOpen(false)} />}
    </div>
    </ThemeContext.Provider>
  );
}

function SidebarHeader({
  onSearch, onCollapse, collapseIcon, collapseLabel,
}: {
  onSearch: () => void;
  onCollapse: () => void;
  collapseIcon: React.ReactNode;
  collapseLabel: string;
}) {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
      <Link href={routes.home} aria-label="Dashboard" className="text-[13px] font-extrabold tracking-tight text-sidebar-foreground">
        ZM
      </Link>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Search size={16} />
        </button>
        <button
          type="button"
          onClick={onCollapse}
          aria-label={collapseLabel}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapseIcon}
        </button>
      </div>
    </div>
  );
}

/** Content and Freelance are visually separate, collapsible sections under a
 *  plain uppercase label — no colored dots, no border dividers, same single
 *  accent color throughout, so it still reads as one system rather than the
 *  old two-tone Content/Hub split. Each section collapses independently
 *  (e.g. hide Freelance while doing a stretch of pure CMS work) — auto-opens
 *  when one of its own pages is active, like the old Freelance dropdown did,
 *  but now both sections behave the same way instead of just one. */
function SidebarNav({ contentItems, pathname }: { contentItems: NavItem[]; pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      <ul className="space-y-0.5">
        <li>
          <NavLink item={DASHBOARD_ITEM} pathname={pathname} />
        </li>
      </ul>

      <NavSection title="Content" items={contentItems} pathname={pathname} />
      <NavSection title="Freelance" items={FREELANCE_ITEMS} pathname={pathname} />

      <ul className="space-y-0.5 pt-5">
        <li>
          <NavLink item={ACCOUNT_ITEM} pathname={pathname} />
        </li>
      </ul>
    </nav>
  );
}

/** A labeled, collapsible group of nav items. `manualOpen: boolean | null` —
 *  `null` means "no manual choice persisted yet, follow whether a child
 *  route is active" (`open = manualOpen ?? hasActiveChild`); once the user
 *  clicks the header, their choice is written to localStorage (keyed by
 *  section title) and read back on mount, so it survives a hard refresh or
 *  a fresh visit — not just useState, which would reset every reload. */
function NavSection({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  const hasActiveChild = items.some((item) => isNavActive(pathname, item.href));
  const storageKey = `zm-admin-nav-open:${title}`;
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount; can't be derived during render without a server/client hydration mismatch.
      if (stored !== null) setManualOpen(stored === "true");
    } catch {
      // localStorage unavailable — fall back to the active-route default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- storageKey is derived from the title prop, which never changes for a mounted section.
  }, []);

  const open = manualOpen ?? hasActiveChild;

  function toggle() {
    const next = !open;
    setManualOpen(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-1 px-2.5 pt-5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <span className="flex-1 text-left">{title}</span>
        <ChevronRight size={11} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Just an avatar + email, linking to the Settings page — everything else
 *  (change password, sign out, theme toggle) moved onto that page itself so
 *  the sidebar doesn't carry a whole account card at the bottom. */
function SidebarFooter({ email }: { email: string }) {
  return (
    <div className="p-3 border-t border-sidebar-border shrink-0">
      <Link href={routes.account} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-muted transition-colors">
        <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[12px] font-semibold shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
        <p className="min-w-0 flex-1 text-[12px] text-foreground font-medium truncate">{email}</p>
      </Link>
    </div>
  );
}

/** Collapsed state of the sidebar — a narrow icon-only rail (like ChatGPT's
 *  collapsed sidebar), not a fully hidden nav. Every top-level destination
 *  stays one click away, just without labels; hover/aria-label carries the name. */
function CollapsedRail({
  items, pathname, email, onExpand, onSearch,
}: {
  items: NavItem[];
  pathname: string;
  email: string;
  onExpand: () => void;
  onSearch: () => void;
}) {
  return (
    <aside className="hidden md:flex w-14 shrink-0 border-r border-sidebar-border bg-sidebar flex-col items-center h-screen sticky top-0 print:hidden py-3 gap-1">
      <button
        type="button"
        onClick={onExpand}
        aria-label="Expand sidebar"
        className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <PanelLeftOpen size={16} />
      </button>
      <button
        type="button"
        onClick={onSearch}
        aria-label="Search"
        className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search size={16} />
      </button>

      <div className="w-6 h-px bg-border my-1.5" aria-hidden="true" />

      <nav className="flex-1 flex flex-col items-center gap-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`relative h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {!!item.badge && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href={routes.account}
        title={email}
        aria-label="Account"
        className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[12px] font-semibold shrink-0 mb-1"
      >
        {email.charAt(0).toUpperCase()}
      </Link>
    </aside>
  );
}

function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Editorial left-accent-bar active state instead of a filled pill — a
 *  transparent 2px left border reserves the space so nothing shifts when a
 *  route becomes active. */
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isNavActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 pl-2.5 pr-2.5 py-2 -ml-px border-l-2 rounded-r-md text-[13px] font-medium transition-colors ${
        isActive
          ? "border-primary bg-primary/5 text-primary"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {!!item.badge && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10.5px] font-semibold flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

