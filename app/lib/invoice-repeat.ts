import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client/client";
import { nextNumber } from "@/app/lib/invoice-number";

/* Monthly (retainer) invoices. The invoice you make is the first month; on
 * the same day each following month a draft copy is made, with the next
 * number and that month's dates, for you to check and send. Copies don't
 * repeat themselves. Run daily by app/api/cron/invoices and whenever Finance
 * is opened, so a missed day catches up. */

const DAY = 24 * 60 * 60 * 1000;

/** The same day of the month, `months` later; the 31st becomes the month's last day where needed. */
export function addMonths(date: Date, months: number, day = date.getUTCDate()): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, last)));
}

/** When a monthly invoice issued on `issueDate` makes its first copy. */
export function firstRepeat(issueDate: Date): Date {
  return addMonths(issueDate, 1);
}

/** Makes every draft copy that's due. Returns how many were made. */
export async function makeDueRepeats(now = new Date()): Promise<number> {
  const due = await prisma.invoice.findMany({
    where: { kind: "INVOICE", billing: "MONTHLY", nextRepeatAt: { not: null, lte: now } },
  });

  let made = 0;
  for (const source of due) {
    const day = source.issueDate.getUTCDate();
    const termDays = source.dueDate ? Math.round((source.dueDate.getTime() - source.issueDate.getTime()) / DAY) : null;
    let next = source.nextRepeatAt!;
    // Catch up on any missed months, at most a year at a time.
    for (let i = 0; i < 12 && next <= now; i++) {
      if (source.repeatUntil && next > source.repeatUntil) break;
      await prisma.invoice.create({
        data: {
          invoiceNumber: await nextNumber("INVOICE"),
          kind: "INVOICE",
          billing: "MONTHLY",
          status: "DRAFT",
          clientId: source.clientId,
          projectId: source.projectId,
          issueDate: next,
          dueDate: termDays !== null ? new Date(next.getTime() + termDays * DAY) : null,
          currency: source.currency,
          discount: source.discount,
          notes: source.notes,
          items: source.items as Prisma.InputJsonValue,
          repeatedFromId: source.id,
        },
      });
      made++;
      next = addMonths(next, 1, day);
    }
    const finished = source.repeatUntil !== null && next > source.repeatUntil;
    await prisma.invoice.update({ where: { id: source.id }, data: { nextRepeatAt: finished ? null : next } });
  }
  return made;
}
