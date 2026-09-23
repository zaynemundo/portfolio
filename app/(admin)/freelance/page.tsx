import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { FreelanceClient } from "./FreelanceClient";

const STATUS_ORDER = ["ACTIVE", "ON_HOLD", "NOT_STARTED", "COMPLETED"];

const getFreelanceData = unstable_cache(
  () =>
    Promise.all([
      prisma.freelanceProject.findMany({
        where: { archived: false },
        include: { tasks: { orderBy: { sortOrder: "asc" } }, clientRecord: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]),
  ["freelance-data"],
  { tags: [CACHE_TAGS.freelance, CACHE_TAGS.clients], revalidate: 60 }
);

export default async function FreelanceProjectsPage() {
  const [projects, clients] = await getFreelanceData();

  const sorted = [...projects].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  const now = new Date();

  return (
    <FreelanceClient
      clients={clients}
      projects={sorted.map((p) => {
        // unstable_cache round-trips through JSON, so Date fields come back as strings.
        const deadline = p.deadline ? new Date(p.deadline) : null;
        return {
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
          deadline: deadline ? deadline.toISOString().slice(0, 10) : "",
          displayDeadline: deadline ? deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
          isOverdue: !!(deadline && deadline < now && p.status !== "COMPLETED"),
          archived: p.archived,
          tasks: p.tasks.map((t) => ({ id: t.id, title: t.title, done: t.done })),
        };
      })}
    />
  );
}
