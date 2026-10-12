import { getSharedInvoiceDocument } from "@/app/lib/invoice-document";
import { buildInvoicePdf, invoicePdfResponse } from "@/app/lib/invoice-pdf";

/** Client download — only works while the share link exists. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invoice = await getSharedInvoiceDocument(token);
  if (!invoice) return new Response("This link is no longer available.", { status: 404 });
  return invoicePdfResponse(await buildInvoicePdf(invoice), invoice.number);
}
