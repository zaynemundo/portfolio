import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { AddLeadButton, LeadBoard } from "./LeadBoard";

const getInquiries = unstable_cache(
  () => prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ["inquiries-list"],
  { tags: [CACHE_TAGS.inquiries], revalidate: 30 }
);

export default async function InquiriesPage() {
  const inquiries = await getInquiries();
  const unreadCount = inquiries.filter((i) => !i.read).length;
  const open = inquiries.filter((i) => i.stage !== "WON" && i.stage !== "LOST").length;

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${open} open${unreadCount > 0 ? ` · ${unreadCount} unread` : ""} · ${inquiries.length} in total`}
        secondary={<AddLeadButton />}
      />

      {inquiries.length === 0 ? (
        <EmptyState message="No leads yet. Messages from your website's contact form will show up here, or add one yourself." />
      ) : (
        <LeadBoard
          leads={inquiries.map((inquiry) => ({
            id: inquiry.id,
            name: inquiry.name,
            email: inquiry.email,
            message: inquiry.message,
            note: inquiry.note,
            stage: inquiry.stage,
            read: inquiry.read,
            received: new Date(inquiry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
            projectId: inquiry.projectId,
          }))}
        />
      )}
    </div>
  );
}
