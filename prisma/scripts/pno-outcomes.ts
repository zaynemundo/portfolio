import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

/*
 * P&O Marinas Results: "before → after" for each part of the problem, in
 * place of the Platform & Engagement figures (Organic · Live · 2), which were
 * facts about the project rather than outcomes. Also shows Instagram
 * followers as growth (1,335 → 1,750) rather than a total.
 *
 *   npx tsx prisma/scripts/pno-outcomes.ts           shows the change
 *   npx tsx prisma/scripts/pno-outcomes.ts --apply   writes it
 */

config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const OUTCOMES = [
  { area: "Core service", before: "Berth rental was buried in the site structure", after: "A dedicated berth page at the centre of the site" },
  { area: "Booking journey", before: "No berth page, onboarding flow or clear enquiry process", after: "A berth page and a step-by-step berth process page" },
  { area: "Berth availability", before: "No way to explore availability online", after: "An interactive berth map connected to live availability" },
  { area: "Brand experience", before: "Inconsistent layouts and visuals across the site", after: "One new brand system applied to every page" },
];

const FOLLOWERS = { value: "+31%", label: "Instagram followers — from 1,335 to 1,750" };

async function main() {
  const row = await prisma.project.findUnique({ where: { slug: "pno-marinas" } });
  if (!row) throw new Error("P&O Marinas not found.");
  const rich = (row.richContent ?? {}) as Record<string, unknown>;
  type Group = { label: string; metrics: { value: string; label: string }[] };
  const groups = ((rich.resultGroups as Group[] | undefined) ?? [])
    .filter((g) => g.label !== "Platform & Engagement")
    // Followers as growth over the period worked on: 1,335 → 1,750 is +31%.
    .map((g) => ({
      ...g,
      metrics: g.metrics.map((m) => (/instagram followers/i.test(m.label) ? FOLLOWERS : m)),
    }));

  for (const o of OUTCOMES) console.log(`${o.area.padEnd(20)} ${o.before}  →  ${o.after}`);
  console.log(`\nResult groups kept: ${groups.map((g) => `${g.label} (${g.metrics.map((m) => m.value).join(" · ")})`).join(", ") || "none"}`);

  if (process.argv.includes("--apply")) {
    await prisma.project.update({ where: { slug: "pno-marinas" }, data: { richContent: { ...rich, outcomes: OUTCOMES, resultGroups: groups } as object } });
    console.log("Done.");
  } else console.log("Nothing written — run again with --apply.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
