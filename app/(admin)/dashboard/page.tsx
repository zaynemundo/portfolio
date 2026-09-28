import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { getSiteSettings } from "@/app/lib/settings-db";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { routes } from "@/app/(admin)/_routes";

const getDashboardData = unstable_cache(
  async (monthKey: string) => {
    const [year, month] = monthKey.split("-").map(Number);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    return Promise.all([
      getSiteSettings(),
      prisma.blogPost.findMany({ orderBy: { date: "desc" }, take: 5 }),
      prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.inquiry.count({ where: { read: false } }),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.project.count({ where: { published: true } }),
      prisma.freelanceProject.count({ where: { archived: false } }),
      prisma.inquiry.count(),
      prisma.transaction.findMany({ where: { date: { gte: monthStart, lt: monthEnd } } }),
      prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 5, include: { client: true } }),
    ]);
  },
  ["dashboard-data"],
  {
    tags: [
      CACHE_TAGS.blog, CACHE_TAGS.caseStudies, CACHE_TAGS.inquiries,
      CACHE_TAGS.freelance, CACHE_TAGS.transactions, CACHE_TAGS.settings,
    ],
    revalidate: 60,
  }
);

export default async function DashboardPage() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const [
    settings,
    posts, inquiries, projects, unreadCount,
    publishedArticles, publishedCaseStudies, activeProjects, totalInquiries,
    monthTransactions, recentTransactions,
  ] = await getDashboardData(monthKey);

  const monthIncome = monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const monthNet = monthIncome - monthExpense;
  const currency = monthTransactions[0]?.currency ?? "AED";
  const firstName = settings.name.split(" ")[0];
  const todayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-zinc-900/40 px-7 py-8 mb-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-purple-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <p className="text-[12.5px] text-purple-300/80 font-medium mb-1.5">{todayLabel}</p>
          <h1 className="text-[26px] font-bold text-zinc-100 mb-1.5">Hi, {firstName}!</h1>
          <p className="text-[13.5px] text-zinc-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread inquir${unreadCount === 1 ? "y" : "ies"} waiting.`
              : "You're all caught up on inquiries."}
            {" "}This month&rsquo;s net is {monthNet >= 0 ? "+" : ""}{monthNet.toLocaleString()} {currency}.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <StatCard href={routes.blog.list} value={publishedArticles} label="Published articles" icon={<StatBlogIcon />} accent="purple" />
        <StatCard href={routes.caseStudies.list} value={publishedCaseStudies} label="Case studies" icon={<StatCaseIcon />} accent="purple" />
        <StatCard href={routes.inquiries.list} value={totalInquiries} label="Inquiries" sublabel={unreadCount > 0 ? `${unreadCount} unread` : undefined} icon={<StatInquiryIcon />} accent="purple" />
        <StatCard href={routes.projects.list} value={activeProjects} label="Active projects" icon={<StatProjectsIcon />} accent="emerald" />
        <StatCard
          href={routes.finance.list}
          value={`${monthNet >= 0 ? "+" : ""}${monthNet.toLocaleString()}`}
          label={`This month (${currency})`}
          icon={<StatFinanceIcon />}
          accent={monthNet >= 0 ? "emerald" : "red"}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        <QuickAction href={routes.blog.new} label="New article" accent="purple" />
        <QuickAction href={routes.caseStudies.new} label="New case study" accent="purple" />
        <QuickAction href={routes.projects.new} label="New freelance project" accent="emerald" />
        <QuickAction href={routes.finance.new} label="New transaction" accent="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RecentCard title="Recent articles" emptyLabel="No articles yet.">
          {posts.map((p) => (
            <RecentRow key={p.id} href={routes.blog.item(p.id)} primary={p.title} secondary={p.dateFormatted} />
          ))}
        </RecentCard>

        <RecentCard
          title="Recent inquiries"
          emptyLabel="No inquiries yet."
          badge={unreadCount > 0 ? unreadCount : undefined}
        >
          {inquiries.map((i) => (
            <RecentRow
              key={i.id}
              href={routes.inquiries.item(i.id)}
              primary={i.name}
              secondary={i.message.slice(0, 60)}
              unread={!i.read}
            />
          ))}
        </RecentCard>

        <RecentCard title="Recent freelance projects" emptyLabel="No freelance projects yet.">
          {projects.map((p) => (
            <RecentRow key={p.id} href={routes.projects.item(p.id)} primary={p.name} secondary={p.status.replace("_", " ")} />
          ))}
        </RecentCard>

        <RecentCard title="Recent transactions" emptyLabel="No transactions yet.">
          {recentTransactions.map((t) => (
            <RecentRow
              key={t.id}
              href={routes.finance.item(t.id)}
              primary={t.description || t.category || t.client?.name || "—"}
              secondary={`${t.type === "INCOME" ? "+" : "-"}${t.amount.toLocaleString()} ${t.currency}`}
            />
          ))}
        </RecentCard>
      </div>
    </div>
  );
}

function StatCard({
  href, value, label, sublabel, icon, accent,
}: {
  href: string;
  value: number | string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  accent: "purple" | "emerald" | "red";
}) {
  const accentClasses = accent === "purple"
    ? "hover:border-purple-500/50 hover:bg-purple-500/[0.04]"
    : accent === "emerald"
    ? "hover:border-emerald-500/50 hover:bg-emerald-500/[0.04]"
    : "hover:border-red-500/50 hover:bg-red-500/[0.04]";
  const iconBg = accent === "purple" ? "bg-purple-500/10 text-purple-400" : accent === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400";
  return (
    <Link
      href={href}
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-4 transition-colors ${accentClasses}`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        {icon}
      </div>
      <div className="text-[22px] font-semibold text-zinc-100 leading-none mb-1.5">{value}</div>
      <div className="text-[12px] text-zinc-500">{label}</div>
      {sublabel && <div className="text-[11px] text-red-400 font-medium mt-0.5">{sublabel}</div>}
    </Link>
  );
}

function QuickAction({ href, label, accent }: { href: string; label: string; accent: "purple" | "emerald" }) {
  const accentClasses = accent === "purple"
    ? "hover:border-purple-500/50 hover:bg-purple-500/[0.04]"
    : "hover:border-emerald-500/50 hover:bg-emerald-500/[0.04]";
  return (
    <Link
      href={href}
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5 text-[13px] font-medium text-zinc-200 transition-colors ${accentClasses}`}
    >
      + {label}
    </Link>
  );
}

function RecentCard({
  title, emptyLabel, badge, children,
}: {
  title: string;
  emptyLabel: string;
  badge?: number;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[13.5px] font-semibold text-zinc-100">{title}</h2>
        {!!badge && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10.5px] font-semibold flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      {hasChildren ? (
        <div className="space-y-2.5">{children}</div>
      ) : (
        <p className="text-[12.5px] text-zinc-600">{emptyLabel}</p>
      )}
    </div>
  );
}

function RecentRow({
  href, primary, secondary, unread,
}: {
  href: string;
  primary: string;
  secondary: string;
  unread?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 group">
      <span className="text-[13px] text-zinc-300 group-hover:text-zinc-100 transition-colors truncate">
        {unread && <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400 mr-1.5 align-middle" aria-hidden="true" />}
        {primary}
      </span>
      <span className="text-[11.5px] text-zinc-600 shrink-0">{secondary}</span>
    </Link>
  );
}

function statIconProps() {
  return { width: 15, height: 15, viewBox: "0 0 20 20", fill: "none" as const, "aria-hidden": true };
}
function StatBlogIcon() {
  return (
    <svg {...statIconProps()}>
      <path d="M4 3.5h9l3 3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 8.5h6M7 11.5h6M7 14.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function StatCaseIcon() {
  return (
    <svg {...statIconProps()}>
      <rect x="2.5" y="5.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 5.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 4v1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function StatInquiryIcon() {
  return (
    <svg {...statIconProps()}>
      <path d="M3 5.5h14v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3 5.5 10 11l7-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function StatProjectsIcon() {
  return (
    <svg {...statIconProps()}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3l1.5 2h6.5A1.5 1.5 0 0 1 17 8.5v6A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5v-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function StatFinanceIcon() {
  return (
    <svg {...statIconProps()}>
      <path d="M3 15V8l4-3 3 2 3-2 4 3v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 7v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 15.5h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
