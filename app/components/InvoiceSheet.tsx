import { formatInvoiceDate, formatMoney, type InvoiceDocument } from "@/app/lib/invoice-document";

const label = "text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5";

/**
 * The invoice (or quote) as a sheet of paper — always dark ink on white, whatever theme
 * surrounds it, because it's a document for the client rather than a piece
 * of the admin UI. Used by the admin invoice page and the public share page.
 */
export function InvoiceSheet({ invoice }: { invoice: InvoiceDocument }) {
  const { sender, isQuote } = invoice;
  const showPayment = !isQuote;
  // Services billed one price per line need no quantity or rate columns.
  const hourly = invoice.billing === "HOURLY";
  const servicesOnly = !hourly && invoice.lines.every((line) => line.quantity === 1);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white text-zinc-900 p-6 sm:p-10 print:border-0 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-6 mb-8 pb-6 border-b border-zinc-200">
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold mb-1">{sender.name}</h2>
          {sender.address && <p className="text-[13px] text-zinc-500 whitespace-pre-line">{sender.address}</p>}
          {sender.email && <p className="text-[13px] text-zinc-500">{sender.email}</p>}
          {sender.phone && <p className="text-[13px] text-zinc-500">{sender.phone}</p>}
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#785EF7] mb-1">{isQuote ? "Quote" : "Invoice"}</p>
          <h3 className="text-[16px] font-bold mb-1">{invoice.number}</h3>
          <p className="text-[12.5px] text-zinc-500">Issued {formatInvoiceDate(invoice.issueDate)}</p>
          {invoice.dueDate && (
            <p className="text-[12.5px] text-zinc-500">
              {isQuote ? "Valid until" : "Due"} {formatInvoiceDate(invoice.dueDate)}
            </p>
          )}
          {invoice.status === "PAID" && <p className="text-[12.5px] font-semibold text-green-700 mt-1">Paid</p>}
          {invoice.status === "ACCEPTED" && <p className="text-[12.5px] font-semibold text-green-700 mt-1">Accepted</p>}
        </div>
      </div>

      {(invoice.client || invoice.projectName) && (
        <div className="mb-8">
          <p className={label}>Billed to</p>
          {invoice.client && <p className="text-[14px] font-medium">{invoice.client.name}</p>}
          {invoice.client?.company && <p className="text-[13px] text-zinc-500">{invoice.client.company}</p>}
          {invoice.client?.email && <p className="text-[13px] text-zinc-500">{invoice.client.email}</p>}
          {invoice.projectName && <p className="text-[13px] text-zinc-500 mt-1">Project: {invoice.projectName}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left mb-6">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Description</th>
              {!servicesOnly && <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">{hourly ? "Hours" : "Qty"}</th>}
              {!servicesOnly && <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Rate</th>}
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {invoice.lines.map((line, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-2.5 pr-4 text-[13.5px]">{line.description}</td>
                {!servicesOnly && <td className="py-2.5 text-[13.5px] text-zinc-500 text-right">{line.quantity}</td>}
                {!servicesOnly && <td className="py-2.5 text-[13.5px] text-zinc-500 text-right">{line.rate.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>}
                <td className="py-2.5 text-[13.5px] text-right">{line.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <dl className="w-full max-w-[260px] tabular-nums">
          <div className="flex justify-between py-1 text-[13px] text-zinc-500">
            <dt>Subtotal</dt>
            <dd>{formatMoney(invoice.subtotal, invoice.currency)}</dd>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1 text-[13px] text-zinc-500">
              <dt>Discount</dt>
              <dd>−{formatMoney(invoice.discount, invoice.currency)}</dd>
            </div>
          )}
          {showPayment && invoice.paid > 0 ? (
            <>
              <div className="flex justify-between py-1 text-[13px] text-zinc-500 border-t border-zinc-200 mt-1 pt-2">
                <dt>Total</dt>
                <dd>{formatMoney(invoice.total, invoice.currency)}</dd>
              </div>
              <div className="flex justify-between py-1 text-[13px] text-zinc-500">
                <dt>Paid</dt>
                <dd>−{formatMoney(invoice.paid, invoice.currency)}</dd>
              </div>
              <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-zinc-200">
                <dt className="text-[13px] font-semibold">Balance due</dt>
                <dd className="text-[20px] font-bold">{formatMoney(invoice.balance, invoice.currency)}</dd>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-zinc-200">
              <dt className="text-[13px] font-semibold">{isQuote ? "Total" : "Total due"}</dt>
              <dd className="text-[20px] font-bold">{formatMoney(invoice.total, invoice.currency)}</dd>
            </div>
          )}
        </dl>
      </div>

      {((showPayment && (sender.bankDetails || sender.paymentTerms)) || invoice.notes) && (
        <div className="pt-6 border-t border-zinc-200 grid gap-6 sm:grid-cols-2">
          {showPayment && sender.bankDetails && (
            <div>
              <p className={label}>Payment details</p>
              <p className="text-[13px] text-zinc-600 whitespace-pre-line">{sender.bankDetails}</p>
            </div>
          )}
          {showPayment && sender.paymentTerms && (
            <div>
              <p className={label}>Payment terms</p>
              <p className="text-[13px] text-zinc-600 whitespace-pre-line">{sender.paymentTerms}</p>
            </div>
          )}
          {invoice.notes && (
            <div className="sm:col-span-2">
              <p className={label}>Notes</p>
              <p className="text-[13px] text-zinc-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
