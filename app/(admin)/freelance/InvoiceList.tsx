import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";
import { Card, CardFrame, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { InvoiceStatusPill } from "@/app/(admin)/_components/ui/StatusPill";
import { PagedBody } from "@/app/(admin)/_components/ui/Paged";

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

/** A job's quotes and invoices in one list, oldest step first. Read-only —
 *  each opens on its own page, where it is edited, shared and paid. */
export function InvoiceList({ projectId, documents }: { projectId: string; documents: JobDocument[] }) {
  // Quotes come before the invoices they turn into.
  const ordered = [...documents.filter((d) => d.isQuote), ...documents.filter((d) => !d.isQuote)];

  return (
    <Card>
      <CardHeader
        title={<>Quotes &amp; invoices</>}
        action={
          <>
            <Link href={`${routes.invoices.new}?kind=quote&projectId=${projectId}`} className={cardActionClass}>
              + New quote
            </Link>
            <Link href={`${routes.invoices.new}?projectId=${projectId}`} className={cardActionClass}>
              + New invoice
            </Link>
          </>
        }
      />

      {ordered.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-muted-foreground">Nothing yet. Start with a quote, or go straight to an invoice.</p>
      ) : (
        <CardFrame>
          <table className="w-full text-left">
            <PagedBody>
              {ordered.map((doc) => {
                const partPaid = !doc.isQuote && doc.balance > 0 && doc.balance < doc.total;
                return (
                  <tr key={doc.id} className="group relative border-b border-border/70 last:border-b-0 hover:bg-primary/[0.06] transition-colors">
                    <td className="px-5 py-2.5 text-[13.5px] font-medium text-foreground/90 whitespace-nowrap">
                      <Link href={routes.invoices.item(doc.id)} className="absolute inset-0 z-0" aria-label={`Open ${doc.invoiceNumber}`} />
                      <span className="relative pointer-events-none">{doc.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-2.5 w-full">
                      <InvoiceStatusPill status={doc.status} className="pointer-events-none" />
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
            </PagedBody>
          </table>
        </CardFrame>
      )}
    </Card>
  );
}
