import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

/*
 * P&O Marinas: total users went from around 1K–2K before the rebuild to 8K.
 * Puts the starting point on the 8K top stat, and adds it as a before → after
 * row in Results.
 *
 *   npx tsx prisma/scripts/pno-users-growth.ts           shows the change
 *   npx tsx prisma/scripts/pno-users-growth.ts --apply   writes it
 */

config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const USERS_STAT = { value: "8K", label: "Total users: up from around 1K–2K before the rebuild, with organic traffic as the dominant source" };
const USERS_OUTCOME = { area: "Audience", before: "Around 1K–2K total users", after: "8K total users, with organic traffic as the dominant source" };

type Metric = { value: string; label: string };
type Outcome = { area: string; before: string; after: string };

async function main() {
  const row = await prisma.project.findUnique({ where: { slug: "pno-marinas" } });
  if (!row) throw new Error("P&O Marinas not found.");
  const rich = (row.richContent ?? {}) as Record<string, unknown>;

  const stats = (rich.heroMetrics as Metric[] | undefined) ?? [];
  const heroMetrics = stats.map((m) => (m.value === "8K" ? USERS_STAT : m));
  const outcomes = [...((rich.outcomes as Outcome[] | undefined) ?? []).filter((o) => o.area !== USERS_OUTCOME.area), USERS_OUTCOME];

  console.log("Top stat now:   ", stats.find((m) => m.value === "8K")?.label ?? "(no 8K stat found)");
  console.log("Top stat after: ", USERS_STAT.label);
  console.log("\nResults, before → after:");
  for (const o of outcomes) console.log(`  ${o.area.padEnd(20)} ${o.before}  →  ${o.after}`);
  // Anything else that mentions users, so a figure elsewhere doesn't contradict the new one.
  const mentions = JSON.stringify({ ...rich, heroMetrics: undefined, outcomes: undefined }).match(/[^"]{0,60}\b(users|8K)\b[^"]{0,60}/gi);
  console.log("\nOther mentions of users:", mentions ?? "none");

  if (process.argv.includes("--apply")) {
    await prisma.project.update({ where: { slug: "pno-marinas" }, data: { richContent: { ...rich, heroMetrics, outcomes } as object } });
    console.log("Done.");
  } else console.log("\nNothing written — run again with --apply.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
