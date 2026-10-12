import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatInvoiceDate, formatMoney, type InvoiceDocument } from "@/app/lib/invoice-document";

/* A4 in points. */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(0.07, 0.07, 0.09);
const MUTED = rgb(0.42, 0.42, 0.46);
const RULE = rgb(0.89, 0.89, 0.91);
const BRAND = rgb(0.47, 0.37, 0.97);

/** The built-in PDF fonts only cover Latin-1; anything else would make pdf-lib throw. */
function safe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/ /g, " ")
    .replace(/[^\x20-\x7E\xA1-\xFF\n]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const paragraph of safe(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        out.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    out.push(line);
  }
  return out;
}

export async function buildInvoicePdf(invoice: InvoiceDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const noun = invoice.isQuote ? "Quote" : "Invoice";
  pdf.setTitle(`${noun} ${invoice.number}`);
  pdf.setAuthor(safe(invoice.sender.name));

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  /** Starts a new page when fewer than `needed` points are left. */
  const ensure = (needed: number) => {
    if (y - needed >= MARGIN) return;
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const text = (
    value: string,
    x: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; right?: boolean } = {},
  ) => {
    const size = opts.size ?? 10;
    const font = opts.font ?? regular;
    const str = safe(value);
    const drawX = opts.right ? x - font.widthOfTextAtSize(str, size) : x;
    page.drawText(str, { x: drawX, y, size, font, color: opts.color ?? INK });
  };

  const rule = () => {
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: RULE });
  };

  const label = (value: string, x: number) => text(value.toUpperCase(), x, { size: 7.5, font: bold, color: MUTED });

  /** A labelled block of wrapped lines; returns nothing, advances `y`. */
  const block = (title: string, body: string, x: number, width: number) => {
    label(title, x);
    y -= 14;
    for (const line of wrap(body, regular, 10, width)) {
      ensure(14);
      text(line, x, { color: INK });
      y -= 14;
    }
  };

  /* ── Header: sender on the left, invoice meta on the right ── */
  const right = PAGE_W - MARGIN;
  const headerTop = y;

  text(invoice.sender.name, MARGIN, { size: 18, font: bold });
  y -= 18;
  const senderLines = [
    ...(invoice.sender.address ? wrap(invoice.sender.address, regular, 9.5, 250) : []),
    invoice.sender.email,
    invoice.sender.phone,
  ].filter(Boolean);
  for (const line of senderLines) {
    text(line, MARGIN, { size: 9.5, color: MUTED });
    y -= 13;
  }
  const leftBottom = y;

  y = headerTop;
  text(noun.toUpperCase(), right, { size: 18, font: bold, color: BRAND, right: true });
  y -= 18;
  text(invoice.number, right, { size: 11, font: bold, right: true });
  y -= 15;
  text(`Issued ${formatInvoiceDate(invoice.issueDate)}`, right, { size: 9.5, color: MUTED, right: true });
  y -= 13;
  if (invoice.dueDate) {
    text(`${invoice.isQuote ? "Valid until" : "Due"} ${formatInvoiceDate(invoice.dueDate)}`, right, { size: 9.5, color: MUTED, right: true });
    y -= 13;
  }
  if (invoice.status === "PAID" || invoice.status === "ACCEPTED") {
    text(invoice.status, right, { size: 9.5, font: bold, color: rgb(0.08, 0.5, 0.24), right: true });
    y -= 13;
  }

  y = Math.min(leftBottom, y) - 12;
  rule();
  y -= 24;

  /* ── Billed to ── */
  if (invoice.client || invoice.projectName) {
    label("Billed to", MARGIN);
    y -= 15;
    if (invoice.client) {
      text(invoice.client.name, MARGIN, { size: 11, font: bold });
      y -= 14;
      for (const line of [invoice.client.company, invoice.client.email]) {
        if (!line) continue;
        text(line, MARGIN, { size: 9.5, color: MUTED });
        y -= 13;
      }
    }
    if (invoice.projectName) {
      text(`Project: ${invoice.projectName}`, MARGIN, { size: 9.5, color: MUTED });
      y -= 13;
    }
    y -= 14;
  }

  /* ── Line items ── */
  const colQty = MARGIN + CONTENT_W - 190;
  const colRate = MARGIN + CONTENT_W - 100;
  const descWidth = colQty - MARGIN - 50;

  const tableHead = () => {
    label("Description", MARGIN);
    text("QTY", colQty, { size: 7.5, font: bold, color: MUTED, right: true });
    text("RATE", colRate, { size: 7.5, font: bold, color: MUTED, right: true });
    text("AMOUNT", right, { size: 7.5, font: bold, color: MUTED, right: true });
    y -= 8;
    rule();
    y -= 16;
  };
  tableHead();

  for (const line of invoice.lines) {
    const descLines = wrap(line.description, regular, 10, descWidth);
    const rowHeight = descLines.length * 14 + 10;
    if (y - rowHeight < MARGIN) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      tableHead();
    }
    const rowTop = y;
    for (const descLine of descLines) {
      text(descLine, MARGIN);
      y -= 14;
    }
    const rowBottom = y;
    y = rowTop;
    text(String(line.quantity), colQty, { color: MUTED, right: true });
    text(line.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), colRate, { color: MUTED, right: true });
    text(line.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), right, { right: true });
    y = rowBottom - 4;
    rule();
    y -= 16;
  }

  /* ── Totals ── */
  ensure(110);
  y -= 2;
  const totalRow = (labelText: string, amount: string, emphasis = false) => {
    text(labelText, colRate, emphasis ? { size: 11, font: bold, right: true } : { size: 9.5, color: MUTED, right: true });
    text(amount, right, emphasis ? { size: 13, font: bold, right: true } : { size: 9.5, right: true });
    y -= emphasis ? 22 : 16;
  };
  totalRow("Subtotal", formatMoney(invoice.subtotal, invoice.currency));
  if (invoice.discount > 0) totalRow("Discount", `-${formatMoney(invoice.discount, invoice.currency)}`);
  if (!invoice.isQuote && invoice.paid > 0) {
    totalRow("Total", formatMoney(invoice.total, invoice.currency));
    totalRow("Paid", `-${formatMoney(invoice.paid, invoice.currency)}`);
    y -= 4;
    totalRow("Balance due", formatMoney(invoice.balance, invoice.currency), true);
  } else {
    y -= 4;
    totalRow(invoice.isQuote ? "Total" : "Total due", formatMoney(invoice.total, invoice.currency), true);
  }
  y -= 12;

  /* ── Payment details, terms, notes ── */
  const extras: [string, string | null][] = [
    ["Payment details", invoice.isQuote ? null : invoice.sender.bankDetails],
    ["Payment terms", invoice.isQuote ? null : invoice.sender.paymentTerms],
    ["Notes", invoice.notes],
  ];
  for (const [title, body] of extras) {
    if (!body?.trim()) continue;
    ensure(48);
    block(title, body, MARGIN, CONTENT_W);
    y -= 12;
  }

  return pdf.save();
}

export function invoicePdfResponse(bytes: Uint8Array, invoiceNumber: string): Response {
  const filename = `${invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "") || "invoice"}.pdf`;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
