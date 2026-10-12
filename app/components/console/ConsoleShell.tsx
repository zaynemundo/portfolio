"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  FileText,
  Users,
  Wallet,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Check,
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
  /** Other route prefixes that should light this link up, e.g. invoice pages under Finance. */
  also?: string[];
}

type WorkspaceId = "freelance" | "website";
const WORKSPACE_IDS: WorkspaceId[] = ["freelance", "website"];

/** One side of the admin. The sidebar only ever shows the active
 *  workspace's links, so the freelance back office and the website editor
 *  stop competing for the same list. Each workspace opens on its own
 *  overview — there is deliberately no page that mixes the two. */
interface Workspace {
  id: WorkspaceId;
  label: string;
  description: string;
  /** Where the switcher sends you when you pick this workspace. */
  home: string;
  /** Things waiting for you in this workspace — shown on the switcher while you're in the other one. */
  attention: number;
  items: NavItem[];
  /** Routes that belong to this workspace but have no sidebar link of their own. */
  extraPaths: string[];
}

const ICON_PROPS = { size: 16, strokeWidth: 1.75 };
const THEME_STORAGE_KEY = "zm-admin-theme";
const WORKSPACE_STORAGE_KEY = "zm-admin-workspace";

const SETTINGS_ITEM: NavItem = { href: routes.account, label: "Settings", icon: <Settings {...ICON_PROPS} /> };

function buildWorkspaces(unreadInquiries: number): Workspace[] {
  return [
    {
      id: "freelance",
      label: "Freelance",
      description: "Leads, jobs, clients and invoices",
      home: routes.home,
      attention: unreadInquiries,
      items: [
        { href: routes.home, label: "Overview", icon: <LayoutDashboard {...ICON_PROPS} /> },
        { href: routes.inquiries.list, label: "Leads", icon: <Mail {...ICON_PROPS} />, badge: unreadInquiries },
        { href: routes.projects.list, label: "Jobs", icon: <FolderKanban {...ICON_PROPS} /> },
        { href: routes.clients.list, label: "Clients", icon: <Users {...ICON_PROPS} /> },
        { href: routes.documents.list, label: "Documents", icon: <FileText {...ICON_PROPS} /> },
        // Invoices, income and expenses share one page (tabs), so invoice
        // routes count as part of Finance.
        { href: routes.finance.list, label: "Finance", icon: <Wallet {...ICON_PROPS} />, also: [routes.invoices.list] },
      ],
      // Contacts are edited on each client's page; their old list page still
      // exists but has no sidebar link.
      extraPaths: [routes.contacts.list],
    },
    {
      id: "website",
      label: "Website",
      description: "Pages, case studies and blog",
      home: routes.website,
      attention: 0,
      items: [
        { href: routes.website, label: "Overview", icon: <LayoutDashboard {...ICON_PROPS} /> },
        { href: routes.homepage, label: "Home", icon: <Home {...ICON_PROPS} /> },
        { href: routes.about, label: "About", icon: <IdCard {...ICON_PROPS} /> },
        { href: routes.caseStudies.list, label: "Work", icon: <Layers {...ICON_PROPS} /> },
        { href: routes.blog.list, label: "Blog", icon: <Newspaper {...ICON_PROPS} /> },
      ],
      extraPaths: [routes.workPage, routes.blogPage],
    },
  ];
}

function matchesPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function isNavActive(pathname: string, item: NavItem): boolean {
  return [item.href, ...(item.also ?? [])].some((href) => matchesPath(pathname, href));
}

/** The workspace the current page belongs to, or null for shared pages like Settings. */
function workspaceForPath(workspaces: Workspace[], pathname: string): WorkspaceId | null {
  const match = workspaces.find(
    (ws) => ws.items.some((item) => isNavActive(pathname, item)) || ws.extraPaths.some((href) => matchesPath(pathname, href)),
  );
  return match?.id ?? null;
}

export function ConsoleShell({
  email, children, unreadInquiries = 0,
}: {
  email: string;
  children: React.ReactNode;
  unreadInquiries?: number;
}) {
  const pathname = usePathname();
  const workspaces = buildWorkspaces(unreadInquiries);
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

  // The page decides the workspace whenever it belongs to one. Shared pages
  // (Settings) keep showing whichever workspace you were last in, which is
  // remembered across reloads.
  const routeWorkspace = workspaceForPath(workspaces, pathname);
  const [lastWorkspace, setLastWorkspace] = useState<WorkspaceId>("freelance");
  if (routeWorkspace && routeWorkspace !== lastWorkspace) {
    setLastWorkspace(routeWorkspace);
  }
  const activeWorkspace = workspaces.find((ws) => ws.id === (routeWorkspace ?? lastWorkspace)) ?? workspaces[0];

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount; can't be derived during render without a server/client hydration mismatch.
      setIsDark(localStorage.getItem(THEME_STORAGE_KEY) === "dark");
      const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (!routeWorkspace && WORKSPACE_IDS.includes(stored as WorkspaceId)) setLastWorkspace(stored as WorkspaceId);
    } catch {
      // localStorage unavailable — stay on the defaults.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only read; later route changes are handled during render above.
  }, []);

  useEffect(() => {
    if (!routeWorkspace) return;
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, routeWorkspace);
    } catch {
      // ignore
    }
  }, [routeWorkspace]);

  const allNavItems: NavItem[] = [...workspaces.flatMap((ws) => ws.items), SETTINGS_ITEM];

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
        <SidebarHeader
          workspaces={workspaces}
          active={activeWorkspace}
          onSearch={() => setSearchOpen(true)}
          onCollapse={() => setMobileOpen(false)}
          collapseIcon={<X size={18} />}
          collapseLabel="Close menu"
        />
        <SidebarNav workspace={activeWorkspace} pathname={pathname} />
        <SidebarFooter email={email} />
      </aside>

      {/* Desktop sidebar */}
      {sidebarOpen ? (
        <aside className="hidden md:flex w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex-col h-screen sticky top-0 print:hidden">
          <SidebarHeader
            workspaces={workspaces}
            active={activeWorkspace}
            onSearch={() => setSearchOpen(true)}
            onCollapse={() => setSidebarOpen(false)}
            collapseIcon={<PanelLeftClose size={16} />}
            collapseLabel="Collapse sidebar"
          />
          <SidebarNav workspace={activeWorkspace} pathname={pathname} />
          <SidebarFooter email={email} />
        </aside>
      ) : (
        <CollapsedRail
          workspaces={workspaces}
          active={activeWorkspace}
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

function WorkspaceMark({ workspace, size = 22 }: { workspace: Workspace; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {workspace.label.charAt(0)}
    </span>
  );
}

/** The workspace switcher doubles as the sidebar's title — picking the other
 *  workspace takes you to its first page, which is what swaps the sidebar. */
function WorkspaceSwitcher({ workspaces, active }: { workspaces: Workspace[]; active: Workspace }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Something is waiting in a workspace you can't currently see, e.g. a new lead while you're writing.
  const elsewhere = workspaces.filter((ws) => ws.id !== active.id).reduce((sum, ws) => sum + ws.attention, 0);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Workspace: ${active.label}. Switch workspace${elsewhere > 0 ? ` (${elsewhere} new in another workspace)` : ""}`}
        className="w-full flex items-center gap-2 rounded-lg px-1.5 py-1.5 -ml-1.5 text-left hover:bg-muted transition-colors"
      >
        <WorkspaceMark workspace={active} />
        <span className="flex-1 min-w-0 truncate text-[13.5px] font-semibold text-sidebar-foreground">{active.label}</span>
        {elsewhere > 0 && <span className="h-2 w-2 rounded-full bg-destructive shrink-0" aria-hidden="true" />}
        <ChevronsUpDown size={13} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div role="menu" className="absolute left-0 top-full mt-1.5 z-50 w-56 rounded-xl border border-border bg-popover shadow-lg p-1">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={ws.home}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted transition-colors"
            >
              <WorkspaceMark workspace={ws} size={26} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-foreground">{ws.label}</span>
                <span className="block text-[11.5px] text-muted-foreground truncate">{ws.description}</span>
              </span>
              {ws.id !== active.id && ws.attention > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10.5px] font-semibold flex items-center justify-center shrink-0">
                  {ws.attention}
                </span>
              )}
              {ws.id === active.id && <Check size={14} className="text-primary shrink-0" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarHeader({
  workspaces, active, onSearch, onCollapse, collapseIcon, collapseLabel,
}: {
  workspaces: Workspace[];
  active: Workspace;
  onSearch: () => void;
  onCollapse: () => void;
  collapseIcon: React.ReactNode;
  collapseLabel: string;
}) {
  return (
    <div className="h-14 flex items-center gap-1 px-4 border-b border-sidebar-border shrink-0">
      <WorkspaceSwitcher workspaces={workspaces} active={active} />
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

/** The active workspace's links as one flat list, with Settings pinned to the
 *  bottom — it belongs to neither workspace, so it sits apart from both. */
function SidebarNav({ workspace, pathname }: { workspace: Workspace; pathname: string }) {
  return (
    <nav aria-label={`${workspace.label} navigation`} className="flex-1 overflow-y-auto px-3 py-4 flex flex-col">
      <ul className="space-y-0.5">
        {workspace.items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} />
          </li>
        ))}
      </ul>


      <ul className="mt-auto pt-4">
        <li>
          <NavLink item={SETTINGS_ITEM} pathname={pathname} />
        </li>
      </ul>
    </nav>
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
 *  collapsed sidebar), not a fully hidden nav. The active workspace's
 *  destinations stay one click away, just without labels; hover/aria-label
 *  carries the name. The mark at the top jumps to the other workspace. */
function CollapsedRail({
  workspaces, active, pathname, email, onExpand, onSearch,
}: {
  workspaces: Workspace[];
  active: Workspace;
  pathname: string;
  email: string;
  onExpand: () => void;
  onSearch: () => void;
}) {
  const other = workspaces.find((ws) => ws.id !== active.id) ?? active;
  const railButton = "h-9 w-9 rounded-lg flex items-center justify-center transition-colors";
  const railIdle = "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <aside className="hidden md:flex w-14 shrink-0 border-r border-sidebar-border bg-sidebar flex-col items-center h-screen sticky top-0 print:hidden py-3 gap-1">
      <Link
        href={other.home}
        title={`${active.label} (switch to ${other.label})`}
        aria-label={`Workspace: ${active.label}. Switch to ${other.label}`}
        className={`${railButton} hover:bg-muted`}
      >
        <WorkspaceMark workspace={active} />
      </Link>
      <button type="button" onClick={onExpand} aria-label="Expand sidebar" className={`${railButton} ${railIdle}`}>
        <PanelLeftOpen size={16} />
      </button>
      <button type="button" onClick={onSearch} aria-label="Search" className={`${railButton} ${railIdle}`}>
        <Search size={16} />
      </button>

      <div className="w-6 h-px bg-border my-1.5" aria-hidden="true" />

      <nav aria-label={`${active.label} navigation`} className="flex-1 flex flex-col items-center gap-1 overflow-y-auto">
        {active.items.map((item) => (
          <RailLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <RailLink item={SETTINGS_ITEM} pathname={pathname} />
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

function RailLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isNavActive(pathname, item);
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-label={item.label}
      className={`relative h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {item.icon}
      {!!item.badge && (
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
      )}
    </Link>
  );
}

/** Editorial left-accent-bar active state instead of a filled pill — a
 *  transparent 2px left border reserves the space so nothing shifts when a
 *  route becomes active. */
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isNavActive(pathname, item);
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
