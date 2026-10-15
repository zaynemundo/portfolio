/*
 * The one place invoice arithmetic lives. Every screen that shows an invoice
 * amount (the invoice itself, the PDF, Finance, the job page, the overview)
 * goes through here, so a discount or a part-payment can never be counted on
 * one page and missed on another.
 */

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  /** Subtotal minus discount — what the client owes in full. */
  total: number;
  paid: number;
  /** Total minus what has been paid so far. Never negative. */
  balance: number;
}

function round(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function invoiceSubtotal(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return round(
    (items as { quantity?: unknown; rate?: unknown }[]).reduce(
      (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.rate) || 0),
      0,
    ),
  );
}

export function invoiceTotals(invoice: {
  items: unknown;
  discount?: number | null;
  payments?: { amount: number }[] | null;
}): InvoiceTotals {
  const subtotal = invoiceSubtotal(invoice.items);
  const discount = Math.min(Math.max(Number(invoice.discount) || 0, 0), subtotal);
  const total = round(subtotal - discount);
  const paid = round((invoice.payments ?? []).reduce((sum, p) => sum + p.amount, 0));
  return { subtotal, discount, total, paid, balance: Math.max(round(total - paid), 0) };
}

