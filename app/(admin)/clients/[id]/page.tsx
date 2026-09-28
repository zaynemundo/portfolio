import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ClientForm } from "../ClientForm";
import { ContactList } from "../ContactList";
import { DocumentList } from "@/app/(admin)/_components/DocumentList";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { updatedAt: "desc" } },
      transactions: { orderBy: { date: "desc" } },
      contacts: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!client) notFound();

  const totalIncome = client.transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = client.transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <BackLink href={routes.clients.list} label="Clients" iconOnly />

      <div className="mt-4 max-w-xl">
        <ClientForm
          clientId={client.id}
          initial={{
            name: client.name,
            type: client.type ?? "",
            phone: client.phone ?? "",
            company: client.company ?? "",
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mt-10">
        <ContactList
          clientId={client.id}
          contacts={client.contacts.map((c) => ({
            id: c.id,
            name: c.name,
            role: c.role ?? "",
            email: c.email ?? "",
            phone: c.phone ?? "",
          }))}
        />

        <DocumentList
          clientId={client.id}
          documents={client.documents.map((d) => ({ id: d.id, name: d.name, fileUrl: d.fileUrl }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="rounded-xl border border-border bg-card/40 px-4 py-3.5">
          <div className="text-[22px] font-semibold text-success leading-none mb-1.5">+{totalIncome.toLocaleString()}</div>
          <div className="text-[12px] text-muted-foreground">Lifetime income</div>
        </div>
        <div className="rounded-xl border border-border bg-card/40 px-4 py-3.5">
          <div className="text-[22px] font-semibold text-destructive leading-none mb-1.5">-{totalExpense.toLocaleString()}</div>
          <div className="text-[12px] text-muted-foreground">Lifetime expenses</div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-foreground">Projects</h2>
          <Link
            href={`${routes.projects.new}?clientId=${client.id}`}
            className="text-[12.5px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            + New project
          </Link>
        </div>
        {client.projects.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/70">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {client.projects.map((p) => (
              <Link
                key={p.id}
                href={routes.projects.item(p.id)}
                className="rounded-xl border border-border bg-card/40 px-4 py-3 text-[13.5px] text-foreground/80 hover:text-foreground hover:border-ring transition-colors truncate"
              >
                {p.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-foreground">Recent transactions</h2>
          <Link
            href={`${routes.finance.new}?clientId=${client.id}`}
            className="text-[12.5px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            + New transaction
          </Link>
        </div>
        {client.transactions.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/70">No transactions yet.</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {client.transactions.slice(0, 8).map((t) => (
              <Link
                key={t.id}
                href={routes.finance.item(t.id)}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-card/40 transition-colors"
              >
                <span className="text-[13px] text-foreground/80 truncate">{t.description ?? t.category ?? "—"}</span>
                <span className={`text-[13px] font-medium shrink-0 ${t.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                  {t.type === "INCOME" ? "+" : "-"}{t.amount.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
