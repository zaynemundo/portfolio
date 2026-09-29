import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-success/15 text-success",
  OVERDUE: "bg-destructive/15 text-destructive",
};

/** Read-only list — editing/creating an invoice happens on its own
 *  standalone page (full line-item editor), linked to from here. */
export function InvoiceList({ projectId, invoices }: { projectId: string; invoices: Invoice[] }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13.5px] font-semibold text-foreground">Invoices</h2>
        <Link href={`${routes.invoices.new}?projectId=${projectId}`} className="text-[12.5px] font-medium text-primary hover:text-primary transition-colors">
          + New invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="text-[13px] text-muted-foreground/70">No invoices for this project yet.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Invoice #</th>
                <th className="px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="group relative border-b border-border/70 last:border-b-0 hover:bg-card/40">
                  <td className="px-4 py-2.5 text-[13.5px] font-medium text-foreground/90">
                    <Link href={routes.invoices.item(inv.id)} className="absolute inset-0 z-0" aria-label={`Open ${inv.invoiceNumber}`} />
                    <span className="relative pointer-events-none">{inv.invoiceNumber}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded pointer-events-none ${STATUS_STYLES[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-foreground/70">{inv.total.toLocaleString()} {inv.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
