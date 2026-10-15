import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { routes } from "@/app/(admin)/_routes";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { ArchivedLeads } from "./ArchivedLeads";

/* Lost leads, out of the board but kept: one can be brought back to any stage. */

const getLostLeads = unstable_cache(
  () => prisma.inquiry.findMany({ where: { stage: "LOST" }, orderBy: { createdAt: "desc" } }),
  ["inquiries-archive"],
  { tags: [CACHE_TAGS.inquiries], revalidate: 30 }
);

export default async function LeadArchivePage() {
  const leads = await getLostLeads();

  return (
    <div>
      <BackLink href={routes.inquiries.list} label="Leads" iconOnly />
      <div className="mt-6">
        <PageHeader title="Archive" subtitle={`${leads.length} lost lead${leads.length === 1 ? "" : "s"}`} />
        {leads.length === 0 ? (
          <EmptyState message="Nothing archived. Leads you mark as lost land here, and can be brought back from here." />
        ) : (
          <ArchivedLeads
            leads={leads.map((lead) => ({
              id: lead.id,
              name: lead.name,
              email: lead.email,
              summary: lead.note || lead.message || "",
              received: new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              receivedAt: new Date(lead.createdAt).getTime(),
            }))}
          />
        )}
      </div>
    </div>
  );
}
