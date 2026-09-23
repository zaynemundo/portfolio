import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { routes } from "@/app/(admin)/_routes";

export default async function DashboardPage() {
  const [
    posts, inquiries, notes, projects, unreadCount,
    publishedArticles, publishedCaseStudies, notesCount, activeProjects, totalInquiries,
  ] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { date: "desc" }, take: 5 }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.note.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.inquiry.count({ where: { read: false } }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.project.count({ where: { published: true } }),
    prisma.note.count(),
    prisma.freelanceProject.count({ where: { archived: false } }),
    prisma.inquiry.count(),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Dashboard</h1>
      <p className="text-[13px] text-zinc-500 mb-8">An overview of your site and workspace.</p>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <StatCard href={routes.blog.list} value={publishedArticles} label="Published articles" accent="purple" />
        <StatCard href={routes.caseStudies.list} value={publishedCaseStudies} label="Case studies" accent="purple" />
        <StatCard href={routes.inquiries.list} value={totalInquiries} label="Inquiries" sublabel={unreadCount > 0 ? `${unreadCount} unread` : undefined} accent="purple" />
        <StatCard href={routes.notes.list} value={notesCount} label="Notes" accent="emerald" />
        <StatCard href={routes.projects.list} value={activeProjects} label="Active projects" accent="emerald" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        <QuickAction href={routes.blog.new} label="New article" accent="purple" />
        <QuickAction href={routes.caseStudies.new} label="New case study" accent="purple" />
        <QuickAction href={routes.notes.new} label="New note" accent="emerald" />
        <QuickAction href={routes.projects.new} label="New freelance project" accent="emerald" />
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

        <RecentCard title="Recent notes" emptyLabel="No notes yet.">
          {notes.map((n) => (
            <RecentRow
              key={n.id}
              href={routes.notes.item(n.id)}
              primary={n.title}
              secondary={n.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            />
          ))}
        </RecentCard>

        <RecentCard title="Recent freelance projects" emptyLabel="No freelance projects yet.">
          {projects.map((p) => (
            <RecentRow key={p.id} href={routes.projects.item(p.id)} primary={p.name} secondary={p.status.replace("_", " ")} />
          ))}
        </RecentCard>
      </div>
    </div>
  );
}

function StatCard({
  href, value, label, sublabel, accent,
}: {
  href: string;
  value: number;
  label: string;
  sublabel?: string;
  accent: "purple" | "emerald";
}) {
  const accentClasses = accent === "purple"
    ? "hover:border-purple-500/50 hover:bg-purple-500/[0.04]"
    : "hover:border-emerald-500/50 hover:bg-emerald-500/[0.04]";
  return (
    <Link
      href={href}
      className={`rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5 transition-colors ${accentClasses}`}
    >
      <div className="text-[24px] font-semibold text-zinc-100 leading-none mb-1.5">{value}</div>
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
      className={`rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5 text-[13px] font-medium text-zinc-200 transition-colors ${accentClasses}`}
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
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
