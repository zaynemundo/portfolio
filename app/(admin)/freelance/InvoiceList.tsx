import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";

interface JobDocument {
  id: string;
  isQuote: boolean;
  invoiceNumber: string;
  status: string;
  total: number;
  /** What is still owed after payments. */
  balance: number;
  currency: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-success/15 text-success",
  OVERDUE: "bg-destructive/15 text-destructive",
  ACCEPTED: "bg-success/15 text-success",
  DECLINED: "bg-secondary text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

/** A job's quotes and invoices in one list, oldest step first. Read-only —
 *  each opens on its own page, where it is edited, shared and paid. */
export function InvoiceList({ projectId, documents }: { projectId: string; documents: JobDocument[] }) {
  // Quotes come before the invoices they turn into.
  const ordered = [...documents.filter((d) => d.isQuote), ...documents.filter((d) => !d.isQuote)];

  return (
    <section className="rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <h2 className="text-[13px] font-semibold text-foreground">Quotes &amp; invoices</h2>
        <div className="flex items-center gap-4 text-[12.5px] font-medium">
          <Link href={`${routes.invoices.new}?kind=quote&projectId=${projectId}`} className="text-primary hover:text-primary/80 transition-colors">
            + New quote
          </Link>
          <Link href={`${routes.invoices.new}?projectId=${projectId}`} className="text-primary hover:text-primary/80 transition-colors">
            + New invoice
          </Link>
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">Nothing yet. Start with a quote, or go straight to an invoice.</p>
      ) : (
        <div>
          <table className="w-full text-left">
            <tbody>
              {ordered.map((doc) => {
                const partPaid = !doc.isQuote && doc.balance > 0 && doc.balance < doc.total;
                return (
                  <tr key={doc.id} className="group relative border-b border-border/70 last:border-b-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-2.5 text-[13.5px] font-medium text-foreground/90 whitespace-nowrap">
                      <Link href={routes.invoices.item(doc.id)} className="absolute inset-0 z-0" aria-label={`Open ${doc.invoiceNumber}`} />
                      <span className="relative pointer-events-none">{doc.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-2.5 w-full">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded pointer-events-none ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.DRAFT}`}>
                        {STATUS_LABELS[doc.status] ?? doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right whitespace-nowrap tabular-nums pointer-events-none">
                      <span className="text-[13px] text-foreground/80">
                        {doc.currency} {doc.total.toLocaleString()}
                      </span>
                      {partPaid && <span className="block text-[11.5px] text-muted-foreground">{doc.balance.toLocaleString()} still owed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
