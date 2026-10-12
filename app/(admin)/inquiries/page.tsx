import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { DeleteInquiryButton } from "./DeleteInquiryButton";
import { routes } from "@/app/(admin)/_routes";

const getInquiries = unstable_cache(
  () => prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ["inquiries-list"],
  { tags: [CACHE_TAGS.inquiries], revalidate: 30 }
);

export default async function InquiriesPage() {
  const inquiries = await getInquiries();
  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${inquiries.length} total${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
      />

      {inquiries.length === 0 ? (
        <EmptyState message="No leads yet. Messages from your website's contact form will show up here." />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">From</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Message</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Received</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className={`border-b border-border/70 last:border-b-0 hover:bg-card/40 ${inquiry.read ? "" : "bg-primary/[0.03]"}`}>
                  <td className="px-4 py-3">
                    <Link
                      href={routes.inquiries.item(inquiry.id)}
                      className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {inquiry.name}
                    </Link>
                    {!inquiry.read && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary align-middle">
                        New
                      </span>
                    )}
                    <p className="text-[12px] text-muted-foreground">{inquiry.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground max-w-[360px] truncate">{inquiry.message}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                    {new Date(inquiry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={routes.inquiries.item(inquiry.id)}
                        className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View
                      </Link>
                      <DeleteInquiryButton id={inquiry.id} name={inquiry.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
