import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

/*
 * P&O Marinas: puts the inquiries figure at the top of the page, in place of
 * the "1 custom interactive berth map" count (the map is still covered in
 * Results and in What I did).
 *
 *   npx tsx prisma/scripts/pno-inquiries-stat.ts           shows the change
 *   npx tsx prisma/scripts/pno-inquiries-stat.ts --apply   writes it
 */

config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const TOP_STATS = [
  { value: "100+", label: "More inquiries: across the whole website" },
  { value: "8K", label: "Total users: up since the rebuild, with organic traffic as the dominant source" },
  { value: "4", label: "New core pages: Berth · Berth Process · Cruise Terminal · Mina Rashid Lifestyle" },
];

async function main() {
  const row = await prisma.project.findUnique({ where: { slug: "pno-marinas" } });
  if (!row) throw new Error("P&O Marinas not found.");
  const rich = (row.richContent ?? {}) as Record<string, unknown>;
  const now = ((rich.heroMetrics as { value: string }[] | undefined) ?? []).map((m) => m.value).join(" · ");
  console.log(`Top stats: ${now}  →  ${TOP_STATS.map((m) => m.value).join(" · ")}`);

  if (process.argv.includes("--apply")) {
    await prisma.project.update({ where: { slug: "pno-marinas" }, data: { richContent: { ...rich, heroMetrics: TOP_STATS } as object } });
    console.log("Done.");
  } else console.log("Nothing written — run again with --apply.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
