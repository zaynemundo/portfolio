import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Download, Repeat } from "lucide-react";
import { formatInvoiceDate, getInvoiceDocument } from "@/app/lib/invoice-document";
import { canEmailClients } from "@/app/lib/email";
import { InvoiceSheet } from "@/app/components/InvoiceSheet";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";
import { StatusSelect } from "../StatusSelect";
import { DeleteInvoiceButton } from "../DeleteInvoiceButton";
import { InvoiceShare } from "../InvoiceShare";
import { PaymentsPanel } from "../PaymentsPanel";
import { AcceptQuoteButton } from "../AcceptQuoteButton";
import { StopRepeatingButton } from "../StopRepeatingButton";

interface Props {
  params: Promise<{ id: string }>;
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

const pill = "rounded-full text-[11px] font-semibold px-2.5 py-1";

/** One page for both steps of the same document: a quote, and the invoice it becomes. */
export default async function InvoiceViewPage({ params }: Props) {
  const { id } = await params;
  const [invoice, origin] = await Promise.all([getInvoiceDocument(id), siteOrigin()]);
  if (!invoice) notFound();

  const { isQuote } = invoice;
  const isPaid = invoice.status === "PAID";
  const missingDetails = !isQuote && (!invoice.sender.address || !invoice.sender.bankDetails);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <BackLink href={`${routes.finance.list}?tab=${isQuote ? "quotes" : "invoices"}`} label="Finance" iconOnly />
          <div className="flex items-center gap-3 mt-3">
            <h1 className="text-[22px] font-semibold text-foreground">{invoice.number}</h1>
            {isPaid && <span className={`${pill} bg-positive/12 text-positive`}>Paid</span>}
            {invoice.status === "ACCEPTED" && <span className={`${pill} bg-positive/12 text-positive`}>Accepted</span>}
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            {isQuote ? "Quote" : "Invoice"}
            {invoice.projectId && invoice.projectName && (
              <>
                {" for "}
                <Link href={routes.projects.item(invoice.projectId)} className="font-medium text-primary hover:underline">
                  {invoice.projectName}
                </Link>
              </>
            )}
            {invoice.linked && (
              <>
                {" · "}
                {isQuote ? "invoiced as " : "from quote "}
                <Link href={routes.invoices.item(invoice.linked.id)} className="font-medium text-primary hover:underline">
                  {invoice.linked.number}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* A paid invoice and an accepted quote have reached their end state; the rest can still move. */}
          {!isPaid && invoice.status !== "ACCEPTED" && (
            <StatusSelect id={invoice.id} status={invoice.status} kind={isQuote ? "QUOTE" : "INVOICE"} />
          )}
          <Link href={routes.invoices.edit(invoice.id)} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            Edit
          </Link>
          <DeleteInvoiceButton id={invoice.id} number={invoice.number} />
          <a
            href={`${routes.invoices.item(invoice.id)}/pdf`}
            className="inline-flex items-center gap-2 rounded-lg border border-border text-foreground/80 text-[13.5px] font-medium px-4 py-2 hover:bg-card transition-colors"
          >
            <Download size={15} />
            Download PDF
          </a>
          {isQuote && !invoice.linked && <AcceptQuoteButton id={invoice.id} />}
        </div>
      </div>

      {/* Monthly invoices: when the next draft is made, or which invoice this draft was made from. */}
      {(invoice.nextRepeatAt || invoice.repeatedFrom) && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-3.5 text-[13px]">
          <Repeat size={15} className="text-primary" aria-hidden />
          {invoice.nextRepeatAt ? (
            <>
              <span className="text-foreground">
                Repeats monthly. Next draft on <span className="font-semibold">{formatInvoiceDate(invoice.nextRepeatAt)}</span>
                {invoice.repeatUntil && <span className="text-muted-foreground">, until {formatInvoiceDate(invoice.repeatUntil)}</span>}.
              </span>
              <span className="ml-auto">
                <StopRepeatingButton id={invoice.id} />
              </span>
            </>
          ) : (
            invoice.repeatedFrom && (
              <span className="text-foreground">
                Monthly draft made from{" "}
                <Link href={routes.invoices.item(invoice.repeatedFrom.id)} className="font-medium text-primary hover:underline">
                  {invoice.repeatedFrom.number}
                </Link>
                . Check it, then set it to Sent.
              </span>
            )
          )}
        </div>
      )}

      {!isQuote && (
        <PaymentsPanel
          invoiceId={invoice.id}
          currency={invoice.currency}
          total={invoice.total}
          paid={invoice.paid}
          balance={invoice.balance}
          today={new Date().toISOString().slice(0, 10)}
          payments={invoice.payments.map((p) => ({
            id: p.id,
            amount: p.amount,
            displayDate: p.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          }))}
        />
      )}

      <InvoiceShare
        invoiceId={invoice.id}
        invoiceNumber={invoice.number}
        noun={isQuote ? "quote" : "invoice"}
        senderName={invoice.sender.name}
        clientEmail={invoice.client?.email ?? null}
        origin={origin}
        initialToken={invoice.shareToken}
        canSendEmail={canEmailClients()}
      />

      {missingDetails && (
        <p className="rounded-lg border border-border bg-card px-4 py-3 mb-6 text-[12.5px] text-muted-foreground print:hidden">
          Your address or bank details are missing from this invoice.{" "}
          <Link href={routes.account} className="font-medium text-primary hover:underline">
            Add them in Settings
          </Link>{" "}
          and they will appear on every invoice.
        </p>
      )}

      <InvoiceSheet invoice={invoice} />
    </div>
  );
}
