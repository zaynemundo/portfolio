import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { BackLink } from "@/app/dashboard/components/BackLink";
import { routes } from "@/app/dashboard/routes";
import { DeleteInquiryButton } from "../DeleteInquiryButton";
import { ReadToggle } from "./ReadToggle";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) notFound();

  if (!inquiry.read) {
    await prisma.inquiry.update({ where: { id }, data: { read: true } });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <BackLink href={routes.inquiries.list} label="Inquiries" />
          <h1 className="text-[22px] font-semibold text-zinc-100 mt-1">{inquiry.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ReadToggle id={inquiry.id} read={true} />
          <DeleteInquiryButton id={inquiry.id} name={inquiry.name} />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between text-[13px] text-zinc-500">
          <a href={`mailto:${inquiry.email}`} className="text-purple-400 hover:text-purple-300 transition-colors">
            {inquiry.email}
          </a>
          <span>
            {inquiry.createdAt.toLocaleString("en-GB", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-[14.5px] text-zinc-200 leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
      </div>

      <a
        href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your inquiry`)}`}
        className="inline-block mt-6 rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
      >
        Reply by email
      </a>
    </div>
  );
}
