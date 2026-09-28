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
        <div className="space-y-2">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={routes.invoices.item(inv.id)}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5 hover:border-border transition-colors"
            >
              <span className="text-[13.5px] font-medium text-foreground/90">{inv.invoiceNumber}</span>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[inv.status]}`}>{inv.status}</span>
                <span className="text-[13px] text-foreground/70">{inv.total.toLocaleString()} {inv.currency}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
