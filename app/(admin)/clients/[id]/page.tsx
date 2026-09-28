import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ClientForm } from "../ClientForm";
import { ContactList } from "../ContactList";
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
    },
  });
  if (!client) notFound();

  const totalIncome = client.transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = client.transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <BackLink href={routes.clients.list} label="Clients" iconOnly />

      <div className="grid grid-cols-[1fr_320px] gap-10 mt-4">
        <ClientForm
          clientId={client.id}
          initial={{
            name: client.name,
            type: client.type ?? "",
            email: client.email ?? "",
            phone: client.phone ?? "",
            company: client.company ?? "",
          }}
        />

        <div className="space-y-5">
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

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">Lifetime totals</h2>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Income</span>
                <span className="text-emerald-400 font-medium">+{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Expenses</span>
                <span className="text-red-400 font-medium">-{totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">Projects</h2>
            {client.projects.length === 0 ? (
              <p className="text-[12.5px] text-zinc-600">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {client.projects.map((p) => (
                  <Link key={p.id} href={routes.projects.item(p.id)} className="block text-[13px] text-zinc-300 hover:text-zinc-100 transition-colors truncate">
                    {p.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-[13px] font-semibold text-zinc-100 mb-3">Recent transactions</h2>
            {client.transactions.length === 0 ? (
              <p className="text-[12.5px] text-zinc-600">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {client.transactions.slice(0, 5).map((t) => (
                  <Link key={t.id} href={routes.finance.item(t.id)} className="flex items-center justify-between gap-2 group">
                    <span className="text-[12.5px] text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">{t.description ?? t.category ?? "—"}</span>
                    <span className={`text-[12.5px] font-medium shrink-0 ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                      {t.type === "INCOME" ? "+" : "-"}{t.amount.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
