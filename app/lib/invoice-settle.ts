import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { invoiceTotals } from "@/app/lib/invoice-math";

/**
 * Brings an invoice back in step with its payments. "Paid" is never typed in:
 * an invoice is paid exactly when its payments cover its total, so this is
 * called after anything that could change either side — a payment recorded,
 * edited or deleted, or the invoice's own lines or discount changed.
 *
 * It also keeps each payment pointing at the invoice's current client and
 * job, so the job page and client page always show the money in the right place.
 *
 * Not a server action: callers are responsible for the session check.
 */
export async function settleInvoice(id: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice || invoice.kind === "QUOTE") return;

  if (invoice.payments.length > 0) {
    await prisma.transaction.updateMany({
      where: { invoiceId: id },
      data: { clientId: invoice.clientId, projectId: invoice.projectId },
    });
  }

  const totals = invoiceTotals(invoice);
  const fullyPaid = totals.total > 0 && totals.balance === 0;
  let status = invoice.status;
  if (fullyPaid) status = "PAID";
  else if (invoice.status === "PAID") status = "SENT";
  if (status !== invoice.status) {
    await prisma.invoice.update({ where: { id }, data: { status } });
  }

  revalidatePath("/finance");
  revalidatePath(`/invoices/${id}`);
  if (invoice.projectId) revalidatePath(`/freelance/${invoice.projectId}`);
  if (invoice.clientId) revalidatePath("/clients/[id]", "page");
  updateTag(CACHE_TAGS.invoices);
  updateTag(CACHE_TAGS.transactions);
  updateTag(CACHE_TAGS.freelance);
}
