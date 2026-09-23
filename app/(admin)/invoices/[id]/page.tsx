import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getSiteSettings } from "@/app/lib/settings-db";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";
import { PrintButton } from "../PrintButton";
import { StatusSelect } from "../StatusSelect";
import { DeleteInvoiceButton } from "../DeleteInvoiceButton";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceViewPage({ params }: Props) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { client: true, project: true } }),
    getSiteSettings(),
  ]);
  if (!invoice) notFound();

  const items = (invoice.items as unknown as InvoiceItem[]) ?? [];
  const total = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.rate || 0), 0);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <BackLink href={routes.invoices.list} label="Invoices" />
          <h1 className="text-[22px] font-semibold text-zinc-100 mt-1">{invoice.invoiceNumber}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelect id={invoice.id} status={invoice.status} />
          <Link href={routes.invoices.edit(invoice.id)} className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
            Edit
          </Link>
          <DeleteInvoiceButton id={invoice.id} number={invoice.invoiceNumber} />
          <PrintButton />
        </div>
      </div>

      {/* Printable invoice */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 print:border-0 print:bg-white print:text-black print:p-0">
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-zinc-800 print:border-zinc-300">
          <div>
            <h2 className="text-[20px] font-bold text-zinc-100 print:text-black mb-1">{settings.name}</h2>
            <p className="text-[13px] text-zinc-500 print:text-zinc-600">{settings.email}</p>
            <p className="text-[13px] text-zinc-500 print:text-zinc-600">{settings.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[16px] font-bold text-zinc-100 print:text-black mb-1">Invoice {invoice.invoiceNumber}</h3>
            <p className="text-[12.5px] text-zinc-500 print:text-zinc-600">
              Issued {invoice.issueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            {invoice.dueDate && (
              <p className="text-[12.5px] text-zinc-500 print:text-zinc-600">
                Due {invoice.dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {(invoice.client || invoice.project) && (
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 print:text-zinc-500 mb-1.5">Billed to</p>
            {invoice.client && <p className="text-[14px] text-zinc-200 print:text-black font-medium">{invoice.client.name}</p>}
            {invoice.client?.company && <p className="text-[13px] text-zinc-500 print:text-zinc-600">{invoice.client.company}</p>}
            {invoice.client?.email && <p className="text-[13px] text-zinc-500 print:text-zinc-600">{invoice.client.email}</p>}
            {invoice.project && <p className="text-[13px] text-zinc-500 print:text-zinc-600 mt-1">Project: {invoice.project.name}</p>}
          </div>
        )}

        <table className="w-full text-left mb-6">
          <thead>
            <tr className="border-b border-zinc-800 print:border-zinc-300">
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Description</th>
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Qty</th>
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Rate</th>
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-zinc-800/70 print:border-zinc-200">
                <td className="py-2.5 text-[13.5px] text-zinc-200 print:text-black">{item.description}</td>
                <td className="py-2.5 text-[13.5px] text-zinc-400 print:text-zinc-600 text-right">{item.quantity}</td>
                <td className="py-2.5 text-[13.5px] text-zinc-400 print:text-zinc-600 text-right">{item.rate.toLocaleString()}</td>
                <td className="py-2.5 text-[13.5px] text-zinc-200 print:text-black text-right">{(item.quantity * item.rate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="text-right">
            <p className="text-[12px] text-zinc-500 print:text-zinc-600 mb-1">Total</p>
            <p className="text-[22px] font-bold text-zinc-100 print:text-black">{total.toLocaleString()} {invoice.currency}</p>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-6 border-t border-zinc-800 print:border-zinc-300">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Notes</p>
            <p className="text-[13px] text-zinc-400 print:text-zinc-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
