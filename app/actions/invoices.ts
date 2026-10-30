"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { Resend } from "resend";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import type { InvoiceStatus } from "@/app/lib/enums";
import { Prisma } from "@/generated/prisma/client/client";
import { canEmailClients, emailFrom } from "@/app/lib/email";
import { emailButton, emailShell, escapeHtml } from "@/app/lib/email-template";
import { getInvoiceDocument, formatInvoiceDate, formatMoney } from "@/app/lib/invoice-document";
import { invoiceTotals } from "@/app/lib/invoice-math";
import { settleInvoice } from "@/app/lib/invoice-settle";
import { nextNumber } from "@/app/lib/invoice-number";
import { addMonths, firstRepeat, makeDueRepeats } from "@/app/lib/invoice-repeat";

export interface InvoiceItemInput {
  description: string;
  quantity: string; // numeric string from the input
  rate: string; // numeric string from the input
}

export interface InvoiceFormData {
  /** "INVOICE" or "QUOTE" — fixed when the document is created. */
  kind: string;
  clientId: string;
  projectId: string;
  status: string;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd or "" — for a quote this is "valid until"
  currency: string;
  discount: string; // numeric string from the input, "" for none
  notes: string;
  items: InvoiceItemInput[];
  /** "PROJECT", "HOURLY" or "MONTHLY". */
  billing: string;
  /** Monthly invoices: keep making a draft copy each month. */
  repeats: boolean;
  /** Monthly invoices: the last date a copy may be made, yyyy-mm-dd or "". */
  repeatUntil: string;
}

const BILLING = ["PROJECT", "HOURLY", "MONTHLY"];

/** A quote can be project or hourly; only invoices repeat monthly. */
function cleanBilling(kind: string, billing: string): string {
  if (!BILLING.includes(billing)) return "PROJECT";
  return kind === "QUOTE" && billing === "MONTHLY" ? "PROJECT" : billing;
}

/** When a monthly invoice should next make its copy: the same day next month, never in the past. */
function repeatFrom(issueDate: Date, existing: Date | null): Date {
  if (existing) return existing;
  let next = firstRepeat(issueDate);
  while (next <= new Date()) next = addMonths(next, 1, issueDate.getUTCDate());
  return next;
}

/** The repeat fields to store, given the form. */
function repeatFields(kind: string, data: InvoiceFormData, existing: Date | null) {
  const monthly = kind === "INVOICE" && cleanBilling(kind, data.billing) === "MONTHLY" && data.repeats;
  return {
    nextRepeatAt: monthly ? repeatFrom(parseDate(data.issueDate)!, existing) : null,
    repeatUntil: monthly ? parseDate(data.repeatUntil) : null,
  };
}

export interface InvoiceActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function validate(data: InvoiceFormData): string | null {
  if (!data.issueDate) return "Issue date is required.";
  const cleanItems = data.items.filter((i) => i.description.trim());
  if (cleanItems.length === 0) return "Add at least one line item.";
  for (const item of cleanItems) {
    const hourly = data.billing === "HOURLY";
    if (!item.quantity || Number.isNaN(Number(item.quantity))) return hourly ? "Each line needs its hours." : "Each item needs a valid quantity.";
    if (!item.rate || Number.isNaN(Number(item.rate))) return hourly ? "Each line needs an hourly rate." : "Each line needs an amount.";
  }
  const discount = Number(data.discount || 0);
  if (Number.isNaN(discount) || discount < 0) return "Discount must be zero or more.";
  const subtotal = cleanItems.reduce((sum, i) => sum + Number(i.quantity) * Number(i.rate), 0);
  if (discount > subtotal) return "Discount can't be more than the subtotal.";
  return null;
}

function buildItems(data: InvoiceFormData) {
  return data.items
    .filter((i) => i.description.trim())
    .map((i) => ({
      description: i.description.trim(),
      quantity: Number(i.quantity),
      rate: Number(i.rate),
    }));
}

/** Quotes can't be paid, and invoices can't be accepted or declined. */
function cleanStatus(kind: string, status: string): InvoiceStatus {
  const allowed = kind === "QUOTE" ? ["DRAFT", "SENT", "ACCEPTED", "DECLINED"] : ["DRAFT", "SENT", "PAID", "OVERDUE"];
  return (allowed.includes(status) ? status : "DRAFT") as InvoiceStatus;
}

/** Records one payment against an invoice. Not exported: callers check the session and settle afterwards. */
async function addPayment(invoiceId: string, amount: number, date: Date): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;
  await prisma.transaction.create({
    data: {
      invoiceId,
      type: "INCOME",
      category: "Invoice",
      amount,
      currency: invoice.currency,
      date,
      clientId: invoice.clientId,
      projectId: invoice.projectId,
      description: `Invoice ${invoice.invoiceNumber}`,
    },
  });
}

/** Pays off whatever is still owed, e.g. when an invoice is saved or marked as paid. */
async function payRemaining(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice || invoice.kind === "QUOTE") return;
  const { balance } = invoiceTotals(invoice);
  if (balance > 0) await addPayment(invoiceId, balance, new Date());
}

function revalidateLists(id?: string) {
  revalidatePath("/finance");
  revalidatePath("/invoices");
  if (id) revalidatePath(`/invoices/${id}`);
  updateTag(CACHE_TAGS.invoices);
  updateTag(CACHE_TAGS.freelance);
}

export async function createInvoice(data: InvoiceFormData): Promise<InvoiceActionResult> {
  await requireSession();
  const error = validate(data);
  if (error) return { ok: false, error };

  const kind = data.kind === "QUOTE" ? "QUOTE" : "INVOICE";
  const status = cleanStatus(kind, data.status);
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextNumber(kind),
      kind,
      billing: cleanBilling(kind, data.billing),
      ...repeatFields(kind, data, null),
      clientId: data.clientId || null,
      projectId: data.projectId || null,
      // "Paid" is reached by recording the payment below, not stored directly.
      status: status === "PAID" ? "SENT" : status,
      issueDate: parseDate(data.issueDate)!,
      dueDate: parseDate(data.dueDate),
      currency: data.currency.trim() || "AED",
      discount: Number(data.discount || 0),
      notes: data.notes.trim() || null,
      items: buildItems(data) as Prisma.InputJsonValue,
    },
  });

  if (status === "PAID") await payRemaining(invoice.id);
  await settleInvoice(invoice.id);
  revalidateLists();
  return { ok: true, id: invoice.id };
}

export async function updateInvoice(id: string, data: InvoiceFormData): Promise<InvoiceActionResult> {
  await requireSession();
  const error = validate(data);
  if (error) return { ok: false, error };

  const existing = await prisma.invoice.findUnique({ where: { id }, select: { kind: true, nextRepeatAt: true } });
  if (!existing) return { ok: false, error: "Not found." };
  const status = cleanStatus(existing.kind, data.status);

  await prisma.invoice.update({
    where: { id },
    data: {
      billing: cleanBilling(existing.kind, data.billing),
      ...repeatFields(existing.kind, data, existing.nextRepeatAt),
      clientId: data.clientId || null,
      projectId: data.projectId || null,
      status: status === "PAID" ? "SENT" : status,
      issueDate: parseDate(data.issueDate)!,
      dueDate: parseDate(data.dueDate),
      currency: data.currency.trim() || "AED",
      discount: Number(data.discount || 0),
      notes: data.notes.trim() || null,
      items: buildItems(data) as Prisma.InputJsonValue,
    },
  });

  if (status === "PAID") await payRemaining(id);
  await settleInvoice(id);
  revalidateLists(id);
  return { ok: true, id };
}

/**
 * Changes a document's status. Choosing "Paid" records a payment for whatever
 * is still owed; an invoice that already has full payment stays paid until a
 * payment is removed, because paid always follows the money.
 */
export async function updateInvoiceStatus(id: string, status: string): Promise<void> {
  await requireSession();
  const invoice = await prisma.invoice.findUnique({ where: { id }, select: { kind: true } });
  if (!invoice) return;

  const next = cleanStatus(invoice.kind, status);
  if (next === "PAID") {
    await payRemaining(id);
  } else {
    await prisma.invoice.update({ where: { id }, data: { status: next } });
  }
  await settleInvoice(id);
  revalidateLists(id);
}

export interface PaymentResult {
  ok: boolean;
  error?: string;
}

/** Records a deposit or part-payment. The invoice becomes paid once payments cover its total. */
export async function recordInvoicePayment(id: string, amount: string, date: string): Promise<PaymentResult> {
  await requireSession();

  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice || invoice.kind === "QUOTE") return { ok: false, error: "Invoice not found." };

  const value = Math.round(Number(amount) * 100) / 100;
  if (!amount.trim() || Number.isNaN(value) || value <= 0) return { ok: false, error: "Enter an amount greater than zero." };
  const { balance } = invoiceTotals(invoice);
  if (value > balance) return { ok: false, error: `That's more than the ${balance.toLocaleString()} ${invoice.currency} still owed.` };

  await addPayment(id, value, parseDate(date) ?? new Date());
  if (invoice.status === "DRAFT") await prisma.invoice.update({ where: { id }, data: { status: "SENT" } });
  await settleInvoice(id);
  revalidateLists(id);
  return { ok: true };
}

/** Removes one payment — the way to undo "paid". */
export async function deleteInvoicePayment(invoiceId: string, paymentId: string): Promise<void> {
  await requireSession();
  await prisma.transaction.deleteMany({ where: { id: paymentId, invoiceId } });
  await settleInvoice(invoiceId);
  revalidateLists(invoiceId);
}

/** Makes any monthly drafts that are due — the safety net for a day the scheduled run missed. Returns how many. */
export async function catchUpRepeats(): Promise<number> {
  await requireSession();
  const made = await makeDueRepeats();
  if (made > 0) revalidateLists();
  return made;
}

/** Stops a monthly invoice making new copies. The copies already made stay. */
export async function stopRepeating(id: string): Promise<void> {
  await requireSession();
  await prisma.invoice.update({ where: { id }, data: { nextRepeatAt: null } });
  revalidateLists(id);
}

/**
 * The client said yes: creates a draft invoice with the quote's lines and
 * marks the quote accepted. Calling it again returns the invoice that
 * already exists rather than making a second one.
 */
export async function acceptQuote(id: string): Promise<InvoiceActionResult> {
  await requireSession();

  const quote = await prisma.invoice.findUnique({ where: { id }, include: { createdInvoice: true } });
  if (!quote || quote.kind !== "QUOTE") return { ok: false, error: "Quote not found." };
  if (quote.createdInvoice) return { ok: true, id: quote.createdInvoice.id };

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextNumber("INVOICE"),
      kind: "INVOICE",
      billing: quote.billing,
      quoteId: quote.id,
      clientId: quote.clientId,
      projectId: quote.projectId,
      status: "DRAFT",
      issueDate: new Date(),
      currency: quote.currency,
      discount: quote.discount,
      notes: quote.notes,
      items: quote.items as Prisma.InputJsonValue,
    },
  });
  await prisma.invoice.update({ where: { id }, data: { status: "ACCEPTED" } });

  if (quote.projectId) revalidatePath(`/freelance/${quote.projectId}`);
  revalidateLists(id);
  return { ok: true, id: invoice.id };
}

export async function deleteInvoice(id: string): Promise<void> {
  await requireSession();
  // Payments recorded against the invoice are removed with it by the database.
  await prisma.invoice.delete({ where: { id } }).catch(() => {});
  updateTag(CACHE_TAGS.transactions);
  revalidateLists();
}

/**
 * Turns on the client-facing link for an invoice or quote (/invoice/<token>).
 * The token is long and random, so the link can't be guessed from the
 * document number. Calling this again returns the link that already exists.
 */
export async function createInvoiceShareLink(id: string): Promise<{ token: string }> {
  await requireSession();
  const existing = await prisma.invoice.findUnique({ where: { id }, select: { shareToken: true } });
  if (existing?.shareToken) return { token: existing.shareToken };

  const token = randomBytes(24).toString("base64url");
  await prisma.invoice.update({ where: { id }, data: { shareToken: token } });
  revalidatePath(`/invoices/${id}`);
  return { token };
}

/** Switches the client-facing link off. The old link stops working immediately. */
export async function revokeInvoiceShareLink(id: string): Promise<void> {
  await requireSession();
  await prisma.invoice.update({ where: { id }, data: { shareToken: null } });
  revalidatePath(`/invoices/${id}`);
}

export interface SendInvoiceResult {
  ok: boolean;
  error?: string;
  /** The share token the email links to — created on the fly if the document wasn't shared yet. */
  token?: string;
}

/**
 * Emails the client a link to their invoice or quote. Only available once a
 * sending domain is set up (EMAIL_FROM) — Resend's test sender can't deliver
 * to anyone but the account owner.
 */
export async function sendInvoiceEmail(id: string): Promise<SendInvoiceResult> {
  await requireSession();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !canEmailClients()) return { ok: false, error: "Email sending isn't set up yet." };

  const invoice = await getInvoiceDocument(id);
  if (!invoice) return { ok: false, error: "Not found." };
  if (!invoice.client?.email) return { ok: false, error: "This client has no contact with an email address." };

  const { token } = await createInvoiceShareLink(id);
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const url = `${origin}/invoice/${token}`;
  const noun = invoice.isQuote ? "Quote" : "Invoice";
  const amount = formatMoney(invoice.isQuote ? invoice.total : invoice.balance, invoice.currency);
  const dateLine = invoice.dueDate
    ? invoice.isQuote
      ? ` It is valid until ${formatInvoiceDate(invoice.dueDate)}.`
      : ` It is due on ${formatInvoiceDate(invoice.dueDate)}.`
    : "";

  const { error } = await new Resend(apiKey).emails.send({
    from: emailFrom(),
    to: invoice.client.email,
    replyTo: invoice.sender.email || undefined,
    subject: `${noun} ${invoice.number} from ${invoice.sender.name}`,
    text: `Hi ${invoice.client.name},\n\n${noun} ${invoice.number} for ${amount} is ready.${dateLine}\n\nView it and download the PDF here:\n${url}\n\nThank you,\n${invoice.sender.name}`,
    html: emailShell({
      preheader: `${noun} ${invoice.number} for ${amount} is ready to view.`,
      badge: noun,
      title: `${noun} ${escapeHtml(invoice.number)}`,
      body: `<p style="margin:0 0 8px;font-size:14px;color:#3f3f46;line-height:1.7">Hi ${escapeHtml(invoice.client.name)},</p>
          <p style="margin:0 0 24px;font-size:14px;color:#3f3f46;line-height:1.7">${noun} ${escapeHtml(invoice.number)} for <strong style="color:#09090b">${escapeHtml(amount)}</strong> is ready.${escapeHtml(dateLine)} You can view it and download a PDF using the button below.</p>
          ${emailButton(url, `View ${noun.toLowerCase()} →`)}`,
      footer: `Sent by ${escapeHtml(invoice.sender.name)}. Reply to this email if you have any questions.`,
    }),
  });

  if (error) {
    console.error("[invoices] Send error:", error);
    return { ok: false, error: "The email couldn't be sent. Check the sending domain in Resend.", token };
  }
  return { ok: true, token };
}
