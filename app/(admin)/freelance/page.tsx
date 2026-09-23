import { prisma } from "@/app/lib/prisma";
import { FreelanceClient } from "./FreelanceClient";

const STATUS_ORDER = ["ACTIVE", "ON_HOLD", "NOT_STARTED", "COMPLETED"];

export default async function FreelanceProjectsPage() {
  const [projects, clients] = await Promise.all([
    prisma.freelanceProject.findMany({
      where: { archived: false },
      include: { tasks: { orderBy: { sortOrder: "asc" } }, clientRecord: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const sorted = [...projects].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  const now = new Date();

  return (
    <FreelanceClient
      clients={clients}
      projects={sorted.map((p) => ({
        id: p.id,
        name: p.name,
        clientId: p.clientId ?? "",
        clientName: p.clientRecord?.name ?? null,
        status: p.status,
        description: p.description ?? "",
        rateAmount: p.rateAmount != null ? String(p.rateAmount) : "",
        rateCurrency: p.rateCurrency ?? "AED",
        rateType: p.rateType ?? "",
        attachmentUrl: p.attachmentUrl ?? "",
        deadline: p.deadline ? p.deadline.toISOString().slice(0, 10) : "",
        displayDeadline: p.deadline ? p.deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
        isOverdue: !!(p.deadline && p.deadline < now && p.status !== "COMPLETED"),
        archived: p.archived,
        tasks: p.tasks.map((t) => ({ id: t.id, title: t.title, done: t.done })),
      }))}
    />
  );
}
