"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
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
  KeyRound,
  Users,
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Menu,
  Plus,
  Power,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { routes } from "@/app/(admin)/_routes";
import { CommandPalette } from "./CommandPalette";
import { ThemeContext, readStoredTheme, useSystemDark, THEME_STORAGE_KEY, type ThemePreference } from "./ThemeContext";

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
  /** What the round "+" in the top bar offers to create while you're in this workspace. */
  quickAdd: { href: string; label: string }[];
}

const ICON_PROPS = { size: 16, strokeWidth: 1.75 };
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
        { href: routes.access.list, label: "Access", icon: <KeyRound {...ICON_PROPS} /> },
        // Invoices, income and expenses share one page (tabs), so invoice
        // routes count as part of Finance.
        { href: routes.finance.list, label: "Finance", icon: <Wallet {...ICON_PROPS} />, also: [routes.invoices.list] },
      ],
      // Contacts are edited on each client's page; their old list page still
      // exists but has no sidebar link.
      extraPaths: [routes.contacts.list],
      quickAdd: [
        { href: routes.projects.new, label: "New job" },
        { href: routes.clients.new, label: "New client" },
        { href: `${routes.invoices.new}?kind=quote`, label: "New quote" },
        { href: routes.invoices.new, label: "New invoice" },
        { href: routes.finance.new, label: "New income or expense" },
      ],
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
        { href: routes.caseStudies.list, label: "Work", icon: <Layers {...ICON_PROPS} />, also: [routes.workPage] },
        { href: routes.blog.list, label: "Blog", icon: <Newspaper {...ICON_PROPS} />, also: [routes.blogPage] },
      ],
      extraPaths: [],
      quickAdd: [
        { href: routes.blog.new, label: "New article" },
        { href: routes.caseStudies.new, label: "New case study" },
      ],
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
  children, unreadInquiries = 0,
}: {
  children: React.ReactNode;
  unreadInquiries?: number;
}) {
  const pathname = usePathname();
  const workspaces = buildWorkspaces(unreadInquiries);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemePreference>("light");
  const systemDark = useSystemDark();
  const isDark = theme === "dark" || (theme === "system" && systemDark);

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
      setThemeState(readStoredTheme());
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

  function setTheme(next: ThemePreference) {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
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
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
    {/* Three layers: the grey canvas (with the sidebar on it), the big rounded sheet the page sits on, and the white cards on the sheet. */}
    <div className={`admin-root ${isDark ? "dark" : ""} min-h-screen bg-canvas flex print:bg-white`}>
      {/* Mobile hamburger — fixed top-left, hidden once the slide-in nav is open */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="md:hidden fixed top-3 left-3 z-40 h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground print:hidden"
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
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[300px] bg-canvas flex flex-col p-3 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarHeader
          workspaces={workspaces}
          active={activeWorkspace}
          onCollapse={() => setMobileOpen(false)}
          collapseIcon={<X size={15} />}
          collapseLabel="Close menu"
        />
        <SidebarNav workspace={activeWorkspace} pathname={pathname} />
      </aside>

      {/* Desktop sidebar: open by default, with every link's name; it can be shrunk to icons. */}
      {sidebarOpen ? (
        <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0 p-3 print:hidden">
          <SidebarHeader
            workspaces={workspaces}
            active={activeWorkspace}
            onCollapse={() => setSidebarOpen(false)}
            collapseIcon={<ChevronLeft size={15} />}
            collapseLabel="Collapse sidebar to icons"
          />
          <SidebarNav workspace={activeWorkspace} pathname={pathname} />
        </aside>
      ) : (
        <CollapsedRail
          workspaces={workspaces}
          active={activeWorkspace}
          pathname={pathname}
          onExpand={() => setSidebarOpen(true)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-3 p-3 md:pl-0 print:p-0">
        <div className="flex items-center gap-3 pl-12 md:pl-0 print:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 h-10 w-full max-w-md rounded-full bg-card px-4 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search size={15} />
            <span className="flex-1 text-left truncate">Search pages…</span>
            <kbd className="hidden sm:inline text-[11px] font-medium text-muted-foreground/70">⌘K</kbd>
          </button>
          <QuickAdd workspace={activeWorkspace} />
        </div>

        <main className="flex-1 min-w-0 rounded-3xl bg-background print:rounded-none print:bg-white">
          <div className="px-5 md:px-8 py-8 print:p-0">{children}</div>
        </main>
      </div>

      {searchOpen && <CommandPalette items={allNavItems} onClose={() => setSearchOpen(false)} />}
    </div>
    </ThemeContext.Provider>
  );
}

/** Closes a popup when you click outside it or press Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `close` is a fresh closure each render; only `open` should re-arm the listeners.
  }, [open]);
  return ref;
}

/** The round "+" at the right of the top bar: the things you can create in the current workspace. */
function QuickAdd({ workspace }: { workspace: Workspace }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative ml-auto shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Create something new"
        title="Create something new"
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Plus size={18} className={`transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-border bg-popover shadow-lg p-1.5">
          {workspace.quickAdd.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-[13px] font-medium text-foreground/90 hover:bg-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkspaceMark({ workspace, size = 20 }: { workspace: Workspace; size?: number }) {
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

/**
 * The workspace dropdown at the top of the sidebar. It shows which workspace
 * you're in; picking another takes you to its first page, which is what swaps
 * the links underneath. A dropdown rather than a two-way switch, so a third
 * workspace is just another line in the list. `compact` is the collapsed
 * sidebar's version: a round button with the workspace's letter that opens
 * the same list.
 */
function WorkspaceSwitcher({ workspaces, active, compact }: { workspaces: Workspace[]; active: Workspace; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  // Something is waiting in a workspace you can't currently see, e.g. a new lead while you're writing.
  const elsewhere = workspaces.filter((ws) => ws.id !== active.id).reduce((sum, ws) => sum + ws.attention, 0);
  const label = `Workspace: ${active.label}. Change workspace${elsewhere > 0 ? ` (${elsewhere} new in another workspace)` : ""}`;

  return (
    <div ref={ref} className="relative">
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={label}
          title={`${active.label} — change workspace`}
          className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <WorkspaceMark workspace={active} />
          {elsewhere > 0 && <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-negative ring-2 ring-canvas" aria-hidden="true" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={label}
          className="w-full flex items-center gap-2.5 rounded-xl border border-border bg-card px-2.5 py-2 text-left hover:bg-muted/60 transition-colors"
        >
          <WorkspaceMark workspace={active} />
          <span className="flex-1 min-w-0 truncate text-[13px] font-semibold text-foreground">{active.label}</span>
          {elsewhere > 0 && <span className="h-2 w-2 rounded-full bg-negative shrink-0" aria-hidden="true" />}
          <ChevronDown size={14} className={`text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute z-50 rounded-2xl border border-border bg-popover shadow-lg p-1.5 ${compact ? "left-full top-0 ml-2 w-60" : "left-0 right-0 top-full mt-1.5"}`}
        >
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={ws.home}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors ${ws.id === active.id ? "bg-muted" : "hover:bg-muted"}`}
            >
              <WorkspaceMark workspace={ws} size={24} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-foreground">{ws.label}</span>
                <span className="block text-[11.5px] text-muted-foreground truncate">{ws.description}</span>
              </span>
              {ws.id !== active.id && ws.attention > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-negative text-white text-[10.5px] font-semibold flex items-center justify-center shrink-0">
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

/** "ZM" set like the favicon (bold, tight, no badge): opens the live site's homepage in a new tab. */
function Avatar() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener"
      aria-label="Open the website in a new tab"
      title="Open the website"
      className="h-10 w-10 flex items-center justify-center text-[17px] font-extrabold tracking-[-0.04em] text-foreground shrink-0 hover:opacity-70 transition-opacity"
    >
      ZM
    </a>
  );
}

/** Round sign-out button, next to the sidebar's collapse button (and near the bottom of the collapsed rail). */
function SignOutButton({ size = "h-7 w-7" }: { size?: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      aria-label="Sign out"
      title="Sign out"
      className={`${size} rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-50`}
    >
      <Power size={14} />
    </button>
  );
}

function SidebarHeader({
  workspaces, active, onCollapse, collapseIcon, collapseLabel,
}: {
  workspaces: Workspace[];
  active: Workspace;
  onCollapse: () => void;
  collapseIcon: React.ReactNode;
  collapseLabel: string;
}) {
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar />
        <span className="flex-1" />
        <SignOutButton />
        <button
          type="button"
          onClick={onCollapse}
          aria-label={collapseLabel}
          title={collapseLabel}
          className="h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {collapseIcon}
        </button>
      </div>
      <WorkspaceSwitcher workspaces={workspaces} active={active} />
    </div>
  );
}

/** The active workspace's links as one flat list, with Settings pinned to the
 *  bottom — it belongs to neither workspace, so it sits apart from both. */
function SidebarNav({ workspace, pathname }: { workspace: Workspace; pathname: string }) {
  return (
    <nav aria-label={`${workspace.label} navigation`} className="flex-1 overflow-y-auto pt-4 flex flex-col">
      <ul className="space-y-1">
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

/** The sidebar shrunk to icons: round buttons, the current page filled in
 *  violet, names on hover. The workspace dropdown stays at the top as a round
 *  button, so you can always change workspace from here too. */
function CollapsedRail({
  workspaces, active, pathname, onExpand,
}: {
  workspaces: Workspace[];
  active: Workspace;
  pathname: string;
  onExpand: () => void;
}) {
  return (
    <aside className="hidden md:flex w-16 shrink-0 flex-col items-center h-screen sticky top-0 py-3 gap-2 print:hidden">
      <Avatar />
      <WorkspaceSwitcher workspaces={workspaces} active={active} compact />

      <nav aria-label={`${active.label} navigation`} className="flex-1 flex flex-col items-center gap-2 pt-2 overflow-y-auto">
        {active.items.map((item) => (
          <RailLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <RailLink item={SETTINGS_ITEM} pathname={pathname} />
      <SignOutButton size="h-10 w-10" />
      <button
        type="button"
        onClick={onExpand}
        aria-label="Open sidebar"
        title="Open sidebar"
        className="h-10 w-10 shrink-0 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight size={16} />
      </button>
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
      className={`relative h-10 w-10 shrink-0 rounded-full flex items-center justify-center border transition-colors ${
        isActive ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {item.icon}
      {!!item.badge && <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-negative ring-2 ring-canvas" aria-hidden="true" />}
    </Link>
  );
}

/** A sidebar link: icon and name in a pill, filled violet for the page you're on. */
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = isNavActive(pathname, item);
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[13px] transition-colors ${
        isActive ? "bg-primary text-primary-foreground font-semibold" : "font-medium text-muted-foreground hover:bg-card hover:text-foreground"
      }`}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {!!item.badge && (
        <span
          className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-semibold flex items-center justify-center ${
            isActive ? "bg-white/25 text-white" : "bg-primary text-primary-foreground"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
