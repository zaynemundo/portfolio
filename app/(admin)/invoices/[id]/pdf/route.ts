import { requireSession } from "@/app/lib/session";
import { getInvoiceDocument } from "@/app/lib/invoice-document";
import { buildInvoicePdf, invoicePdfResponse } from "@/app/lib/invoice-pdf";

/** Admin download — any invoice, shared or not. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const invoice = await getInvoiceDocument(id);
  if (!invoice) return new Response("Invoice not found.", { status: 404 });
  return invoicePdfResponse(await buildInvoicePdf(invoice), invoice.number);
}
