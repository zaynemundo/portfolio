/*
 * One normalised shape shared by everything that shows an invoice or a quote:
 * the admin view, the client-facing share page, and the PDF. Loading it in
 * one place keeps the three from drifting apart.
 */

import { prisma } from "@/app/lib/prisma";
import { invoiceTotals } from "@/app/lib/invoice-math";

export interface InvoiceLine {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoicePayment {
  id: string;
  date: Date;
  amount: number;
}

export interface InvoiceDocument {
  id: string;
  number: string;
  /** A quote is the same document one step before an invoice. */
  isQuote: boolean;
  status: string;
  /** "PROJECT", "HOURLY" or "MONTHLY". */
  billing: string;
  /** A monthly invoice that is still repeating: when its next draft copy is made. */
  nextRepeatAt: Date | null;
  repeatUntil: Date | null;
  /** On a draft made by a monthly invoice: that invoice. */
  repeatedFrom: { id: string; number: string } | null;
  issueDate: Date;
  /** For a quote, the date it is valid until. */
  dueDate: Date | null;
  currency: string;
  lines: InvoiceLine[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  payments: InvoicePayment[];
  notes: string | null;
  projectId: string | null;
  projectName: string | null;
  client: { name: string; company: string | null; email: string | null } | null;
  /** On an invoice: the quote it came from. On a quote: the invoice made from it. */
  linked: { id: string; number: string } | null;
  /** Who the document is from — the Settings → Invoice details fields. */
  sender: {
    name: string;
    email: string;
    phone: string;
    address: string | null;
    bankDetails: string | null;
    paymentTerms: string | null;
  };
  shareToken: string | null;
}

export function formatInvoiceDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toLines(items: unknown): InvoiceLine[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    const item = (raw ?? {}) as { description?: unknown; quantity?: unknown; rate?: unknown };
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return { description: String(item.description ?? ""), quantity, rate, amount: quantity * rate };
  });
}

async function load(where: { id: string } | { shareToken: string }): Promise<InvoiceDocument | null> {
  const [invoice, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where,
      include: {
        client: { include: { contacts: { orderBy: { sortOrder: "asc" } } } },
        project: true,
        payments: { orderBy: { date: "asc" } },
        quote: { select: { id: true, invoiceNumber: true } },
        createdInvoice: { select: { id: true, invoiceNumber: true } },
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  if (!invoice) return null;

  const repeatedFrom = invoice.repeatedFromId
    ? await prisma.invoice.findUnique({ where: { id: invoice.repeatedFromId }, select: { id: true, invoiceNumber: true } })
    : null;
  const isQuote = invoice.kind === "QUOTE";
  const linkedRow = isQuote ? invoice.createdInvoice : invoice.quote;
  return {
    id: invoice.id,
    number: invoice.invoiceNumber,
    isQuote,
    status: invoice.status,
    billing: invoice.billing,
    nextRepeatAt: invoice.nextRepeatAt,
    repeatUntil: invoice.repeatUntil,
    repeatedFrom: repeatedFrom ? { id: repeatedFrom.id, number: repeatedFrom.invoiceNumber } : null,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    lines: toLines(invoice.items),
    ...invoiceTotals(invoice),
    payments: invoice.payments.map((p) => ({ id: p.id, date: p.date, amount: p.amount })),
    notes: invoice.notes,
    projectId: invoice.projectId,
    projectName: invoice.project?.name ?? null,
    client: invoice.client
      ? {
          name: invoice.client.name,
          company: invoice.client.company,
          // Emails live on a client's contacts now; the old client-level field is only a fallback.
          email: invoice.client.contacts.find((c) => c.email)?.email ?? invoice.client.email,
        }
      : null,
    linked: linkedRow ? { id: linkedRow.id, number: linkedRow.invoiceNumber } : null,
    sender: {
      name: settings?.name || "Zaira Mundo",
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.invoiceAddress || null,
      bankDetails: settings?.invoiceBankDetails || null,
      paymentTerms: settings?.invoicePaymentTerms || null,
    },
    shareToken: invoice.shareToken,
  };
}

export function getInvoiceDocument(id: string) {
  return load({ id });
}

/** For the public share page — null when the link was never created or has been revoked. */
export function getSharedInvoiceDocument(token: string) {
  if (!token) return Promise.resolve(null);
  return load({ shareToken: token });
}
