import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";
import { DeleteInvoiceButton } from "./DeleteInvoiceButton";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

function computeTotal(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return (items as InvoiceItem[]).reduce((sum, i) => sum + (i.quantity || 0) * (i.rate || 0), 0);
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-success/15 text-success",
  OVERDUE: "bg-destructive/15 text-destructive",
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { client: true },
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        actionHref={routes.invoices.new}
        actionLabel="+ New invoice"
      />

      {invoices.length === 0 ? (
        <EmptyState message="No invoices yet." />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Number</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Issued</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                  <td className="px-4 py-3">
                    <Link href={routes.invoices.item(inv.id)} className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{inv.client?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                    {inv.issueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[13.5px] font-medium text-foreground/90">
                    {computeTotal(inv.items).toLocaleString()} {inv.currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={routes.invoices.edit(inv.id)} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Edit
                      </Link>
                      <DeleteInvoiceButton id={inv.id} number={inv.invoiceNumber} />
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
