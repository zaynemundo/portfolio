import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";
import { Card, CardFrame, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { PagedBody } from "@/app/(admin)/_components/ui/Paged";

/* Read-only panels on the job page. Each one is a window onto something
 * that's edited elsewhere (invoices, transactions, the client), so the job
 * page can show the whole picture without duplicating those editors. */

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export interface JobMoney {
  currency: string;
  /** The agreed price: the job's fixed rate, or failing that its accepted quote. */
  value: number | null;
  invoiced: number;
  paid: number;
  overdue: number;
  expenses: number;
  /** True when an invoice or transaction uses a different currency from the job, so it's left out of the totals. */
  mixedCurrencies: boolean;
}

/** Where the money stands on this job, at a glance. */
export function JobMoneyStrip({ money: m }: { money: JobMoney }) {
  const outstanding = m.invoiced - m.paid;
  const toInvoice = m.value !== null ? Math.max(m.value - m.invoiced, 0) : null;

  const cells: { label: string; value: string; note?: string; tone?: "bad" | "good" }[] = [
    {
      label: "Job value",
      value: m.value !== null ? money(m.value, m.currency) : "—",
      note: m.value !== null ? (toInvoice ? `${money(toInvoice, m.currency)} still to invoice` : "Fully invoiced") : "Set a fixed rate or get a quote accepted",
    },
    { label: "Invoiced", value: money(m.invoiced, m.currency), note: "Sent, paid and overdue invoices" },
    { label: "Paid", value: money(m.paid, m.currency), tone: m.paid > 0 ? "good" : undefined },
    {
      label: "Outstanding",
      value: money(outstanding, m.currency),
      note: m.overdue > 0 ? `${money(m.overdue, m.currency)} overdue` : m.expenses > 0 ? `Expenses: ${money(m.expenses, m.currency)}` : undefined,
      tone: m.overdue > 0 ? "bad" : undefined,
    },
  ];

  return (
    <div>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl border border-border bg-border overflow-hidden">
        {cells.map((cell) => (
          <div key={cell.label} className="px-4 py-3.5 bg-card">
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">{cell.label}</dt>
            <dd
              className={`text-[19px] font-semibold tabular-nums leading-tight mt-1 ${
                cell.tone === "bad" ? "text-destructive" : cell.tone === "good" ? "text-success" : "text-foreground"
              }`}
            >
              {cell.value}
            </dd>
            {cell.note && <dd className={`text-[11.5px] mt-0.5 ${cell.tone === "bad" ? "text-destructive" : "text-muted-foreground"}`}>{cell.note}</dd>}
          </div>
        ))}
      </dl>
      {m.mixedCurrencies && (
        <p className="text-[11.5px] text-muted-foreground mt-2">
          Some invoices or transactions on this job use a different currency and are left out of these totals.
        </p>
      )}
    </div>
  );
}

export interface JobTransaction {
  id: string;
  displayDate: string;
  type: string;
  amount: number;
  currency: string;
  label: string;
}

/** Income and expenses recorded against this job. */
export function JobTransactions({ projectId, clientId, transactions }: { projectId: string; clientId: string | null; transactions: JobTransaction[] }) {
  const newHref = `${routes.finance.new}?projectId=${projectId}${clientId ? `&clientId=${clientId}` : ""}`;
  return (
    <Card>
      <CardHeader
        title={<>Payments &amp; expenses</>}
        action={<Link href={newHref} className={cardActionClass}>+ Add</Link>}
      />

      {transactions.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-muted-foreground">Nothing recorded for this job yet.</p>
      ) : (
        <CardFrame>
          <table className="w-full text-left">
            <PagedBody>
              {transactions.map((t) => (
                <tr key={t.id} className="group relative border-b border-border/70 last:border-b-0 hover:bg-primary/[0.06] transition-colors">
                  <td className="px-5 py-2.5 text-[12.5px] text-muted-foreground whitespace-nowrap">
                    <Link href={routes.finance.item(t.id)} className="absolute inset-0 z-0" aria-label={`Open ${t.label}`} />
                    <span className="relative pointer-events-none">{t.displayDate}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-foreground/80 w-full pointer-events-none">{t.label}</td>
                  <td className={`px-5 py-2.5 text-[13px] font-medium text-right whitespace-nowrap tabular-nums pointer-events-none ${t.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                    {t.type === "INCOME" ? "+" : "−"}
                    {money(t.amount, t.currency)}
                  </td>
                </tr>
              ))}
            </PagedBody>
          </table>
        </CardFrame>
      )}
    </Card>
  );
}

export interface JobClient {
  id: string;
  slug: string | null;
  name: string;
  company: string | null;
  contacts: { id: string; name: string; role: string | null; email: string | null; phone: string | null }[];
}

/** Who the job is for, and who to talk to — contacts are edited on the client's own page. */
export function JobClientPanel({ client }: { client: JobClient | null }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-foreground">Client</h2>
        {client && (
          <Link href={routes.clients.item(client.slug ?? client.id)} className="text-[12.5px] font-medium text-primary hover:text-primary/80 transition-colors">
            Open client
          </Link>
        )}
      </div>

      {!client ? (
        <p className="text-[12.5px] text-muted-foreground/70">No client chosen yet. Pick one in the details above.</p>
      ) : (
        <>
          <p className="text-[14px] font-medium text-foreground">{client.name}</p>
          {client.company && <p className="text-[12.5px] text-muted-foreground">{client.company}</p>}

          {client.contacts.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground/70 mt-3">No contacts saved for this client yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {client.contacts.map((c) => (
                <li key={c.id} className="py-2">
                  <p className="text-[12.5px] text-foreground/90">
                    {c.name}
                    {c.role && <span className="text-muted-foreground"> · {c.role}</span>}
                  </p>
                  <p className="text-[12px] text-muted-foreground flex flex-wrap gap-x-3">
                    {c.email && <a href={`mailto:${c.email}`} className="hover:text-foreground transition-colors">{c.email}</a>}
                    {c.phone && <a href={`tel:${c.phone}`} className="hover:text-foreground transition-colors">{c.phone}</a>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
