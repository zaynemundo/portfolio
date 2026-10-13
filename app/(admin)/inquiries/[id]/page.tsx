import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";
import { DeleteInquiryButton } from "../DeleteInquiryButton";
import { ReadToggle } from "./ReadToggle";
import { LeadPanel } from "./LeadPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id }, include: { project: { select: { name: true } } } });
  if (!inquiry) notFound();

  if (!inquiry.read) {
    await prisma.inquiry.update({ where: { id }, data: { read: true } });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <BackLink href={routes.inquiries.list} label="Leads" iconOnly />
          <h1 className="text-[22px] font-semibold text-foreground mt-3">{inquiry.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ReadToggle id={inquiry.id} read={true} />
          <DeleteInquiryButton id={inquiry.id} name={inquiry.name} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
      <div className="flex-1 min-w-0">
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between text-[13px] text-muted-foreground">
          {inquiry.email ? (
            <a href={`mailto:${inquiry.email}`} className="text-primary hover:text-primary transition-colors">
              {inquiry.email}
            </a>
          ) : (
            <span>No email</span>
          )}
          <span>
            {inquiry.createdAt.toLocaleString("en-GB", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-[14.5px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
      </div>

      {inquiry.email && (
      <a
        href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your inquiry`)}`}
        className="inline-block mt-6 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
      >
        Reply by email
      </a>
      )}
      </div>

      <LeadPanel id={inquiry.id} stage={inquiry.stage} note={inquiry.note ?? ""} projectId={inquiry.projectId} projectName={inquiry.project?.name ?? null} />
      </div>
    </div>
  );
}
