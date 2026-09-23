import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/dashboard/components/PageHeader";
import { EmptyState } from "@/app/dashboard/components/EmptyState";
import { DeleteInquiryButton } from "./DeleteInquiryButton";
import { routes } from "@/app/dashboard/routes";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <div>
      <PageHeader
        title="Inquiries"
        subtitle={`${inquiries.length} total${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
      />

      {inquiries.length === 0 ? (
        <EmptyState message="No inquiries yet — messages from the contact form will show up here." />
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">From</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Message</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Received</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className={`border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40 ${inquiry.read ? "" : "bg-purple-500/[0.03]"}`}>
                  <td className="px-4 py-3">
                    <Link
                      href={routes.inquiries.item(inquiry.id)}
                      className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors"
                    >
                      {inquiry.name}
                    </Link>
                    {!inquiry.read && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 align-middle">
                        New
                      </span>
                    )}
                    <p className="text-[12px] text-zinc-500">{inquiry.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400 max-w-[360px] truncate">{inquiry.message}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400 whitespace-nowrap">
                    {inquiry.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={routes.inquiries.item(inquiry.id)}
                        className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
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
