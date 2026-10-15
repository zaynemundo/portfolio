import { prisma } from "@/app/lib/prisma";

/**
 * Next number in a series (INV-0001, QUO-0001). Continues from the highest
 * number ever used rather than counting rows, so deleting a document can
 * never cause the next one to reuse a number.
 */
export async function nextNumber(kind: string): Promise<string> {
  const prefix = kind === "QUOTE" ? "QUO-" : "INV-";
  const existing = await prisma.invoice.findMany({
    where: { invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  });
  const highest = existing.reduce((max, row) => {
    const n = Number.parseInt(row.invoiceNumber.slice(prefix.length), 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}
