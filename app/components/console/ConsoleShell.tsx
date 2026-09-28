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
  Settings,
  FolderKanban,
  Users,
  Contact,
  FileText,
  Wallet,
  Briefcase,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { LogoutButton } from "@/app/(admin)/_components/LogoutButton";
import { Switch } from "@/app/(admin)/_components/ui/Switch";
import { routes } from "@/app/(admin)/_routes";
import { CommandPalette } from "./CommandPalette";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const ICON_PROPS = { size: 16, strokeWidth: 1.75 };
const THEME_STORAGE_KEY = "zm-admin-theme";

const DASHBOARD_ITEM: NavItem = { href: routes.home, label: "Dashboard", icon: <LayoutDashboard {...ICON_PROPS} /> };

function buildContentItems(unreadInquiries: number): NavItem[] {
  return [
    { href: routes.homepage, label: "Homepage", icon: <Home {...ICON_PROPS} /> },
    { href: routes.cv, label: "CV", icon: <IdCard {...ICON_PROPS} /> },
    { href: routes.blog.list, label: "Blog", icon: <Newspaper {...ICON_PROPS} /> },
    { href: routes.caseStudies.list, label: "Case Studies", icon: <Layers {...ICON_PROPS} /> },
    { href: routes.inquiries.list, label: "Inquiries", icon: <Mail {...ICON_PROPS} />, badge: unreadInquiries },
    { href: routes.settings, label: "Site Settings", icon: <Settings {...ICON_PROPS} /> },
  ];
}

const FREELANCE_DROPDOWN_ITEMS: NavItem[] = [
  { href: routes.clients.list, label: "Clients", icon: <Users {...ICON_PROPS} /> },
  { href: routes.projects.list, label: "Projects", icon: <FolderKanban {...ICON_PROPS} /> },
  { href: routes.finance.list, label: "Finance", icon: <Wallet {...ICON_PROPS} /> },
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
    ...FREELANCE_DROPDOWN_ITEMS,
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
        <SidebarFooter email={email} isDark={isDark} onToggleTheme={toggleTheme} />
      </aside>

      {/* Desktop sidebar */}
      {sidebarOpen ? (
        <aside className="hidden md:flex w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex-col h-screen sticky top-0 print:hidden">
          <SidebarHeader onSearch={() => setSearchOpen(true)} onCollapse={() => setSidebarOpen(false)} collapseIcon={<PanelLeftClose size={16} />} collapseLabel="Collapse sidebar" />
          <SidebarNav contentItems={contentItems} pathname={pathname} />
          <SidebarFooter email={email} isDark={isDark} onToggleTheme={toggleTheme} />
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
          <div className="max-w-[1100px] mx-auto px-8 py-10 print:max-w-none print:p-0">{children}</div>
        </main>
      </div>

      {searchOpen && <CommandPalette items={allNavItems} onClose={() => setSearchOpen(false)} />}
    </div>
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

function SidebarNav({ contentItems, pathname }: { contentItems: NavItem[]; pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
      <DashboardLink item={DASHBOARD_ITEM} pathname={pathname} />
      <NavGroup label="Content" accent="primary" items={contentItems} pathname={pathname} />
      <div>
        <p className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Hub
        </p>
        <ul className="space-y-0.5">
          <li>
            <FreelanceDropdown items={FREELANCE_DROPDOWN_ITEMS} pathname={pathname} />
          </li>
        </ul>
      </div>
    </nav>
  );
}

function SidebarFooter({
  email, isDark, onToggleTheme,
}: {
  email: string;
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className="p-3 border-t border-sidebar-border shrink-0">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 mb-2">
        <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[12px] font-semibold shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-foreground font-medium truncate">{email}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <Link href={routes.account} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Change password
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-medium text-muted-foreground">
        <span className="flex items-center gap-2">
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
          {isDark ? "Dark mode" : "Light mode"}
        </span>
        <Switch checked={isDark} onCheckedChange={onToggleTheme} aria-label="Toggle dark mode" />
      </div>
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

function NavLink({ item, pathname, activeClasses }: { item: NavItem; pathname: string; activeClasses: string }) {
  const isActive = isNavActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
        isActive ? activeClasses : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

/** Dashboard sits above the Content/Hub groups, ungrouped — it's the main landing page, not "content". */
function DashboardLink({ item, pathname }: { item: NavItem; pathname: string }) {
  return (
    <div className="pb-2">
      <NavLink item={item} pathname={pathname} activeClasses="bg-foreground/10 text-foreground" />
    </div>
  );
}

/** Groups Clients/Projects/Finance/Contacts/Documents under one collapsible
 *  "Freelance" item — these all revolve around the same freelance work, so
 *  they don't need five separate top-level Hub entries. Auto-expands when
 *  any sub-page is active. */
function FreelanceDropdown({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const hasActiveChild = items.some((item) => isNavActive(pathname, item.href));
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? hasActiveChild;

  return (
    <div>
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
          hasActiveChild ? "bg-success/10 text-success" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Briefcase {...ICON_PROPS} />
        <span className="flex-1 text-left">Freelance</span>
        <ChevronRight size={12} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <ul className="mt-0.5 ml-2 pl-3 space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} activeClasses="bg-success/10 text-success" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NavGroup({
  label, accent, items, pathname,
}: {
  label: string;
  accent: "primary" | "success";
  items: NavItem[];
  pathname: string;
}) {
  const activeClasses = accent === "primary" ? "bg-primary/10 text-primary" : "bg-success/10 text-success";
  const dotClasses = accent === "primary" ? "bg-primary" : "bg-success";

  return (
    <div>
      <p className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClasses}`} aria-hidden="true" />
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} activeClasses={activeClasses} />
          </li>
        ))}
      </ul>
    </div>
  );
}
