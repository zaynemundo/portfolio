import Link from "next/link";
import { Eye } from "lucide-react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { DeleteInquiryButton } from "./DeleteInquiryButton";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { routes } from "@/app/(admin)/_routes";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { cardClass } from "@/app/(admin)/_components/ui/Card";

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
        <div className={`${cardClass} p-5`}>
          <DataTable
            inset={false}
            toolbar="always"
            searchPlaceholder="Search by name, email or message…"
            filters={[{ key: "read", label: "Read", options: [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }] }]}
            columns={[{ label: "From" }, { label: "Message" }, { label: "Received" }, { className: "w-12" }]}
            rows={inquiries.map((inquiry) => ({
              id: inquiry.id,
              href: routes.inquiries.item(inquiry.id),
              className: inquiry.read ? "" : "bg-primary/[0.03]",
              search: `${inquiry.name} ${inquiry.email} ${inquiry.message}`,
              sort: [inquiry.name, undefined, new Date(inquiry.createdAt).getTime(), undefined],
              filters: { read: inquiry.read ? "read" : "unread" },
              cells: (
                <>
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
                  <RowMenu>
                    <RowMenuItem href={routes.inquiries.item(inquiry.id)} icon={<Eye size={14} />}>
                      View
                    </RowMenuItem>
                    <DeleteInquiryButton id={inquiry.id} name={inquiry.name} menu />
                  </RowMenu>
                </td>
                </>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
