import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";
import { existing, fresh } from "./case-studies-content.mjs";

/*
 * Fills the case study pages from the write-ups in case-studies-content.mjs.
 *
 *   npx tsx prisma/scripts/import-case-studies.ts           lists what would change
 *   npx tsx prisma/scripts/import-case-studies.ts --apply   writes it
 *
 * Safe to run twice: a case study that already has a write-up is left alone,
 * and a field is only replaced while it still holds the placeholder text.
 * Before writing, the current rows are saved to case-studies-backup.json.
 */

config({ path: [".env.local", ".env"] });

const APPLY = process.argv.includes("--apply");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Content = { shortDescription: string; challenge: string; approach: string; outcome: string; client?: string; rich: Record<string, unknown> };

/** `disciplines` and `metricGroups` are not shown anywhere on the site, so they are not stored. */
function shown(rich: Record<string, unknown>) {
  const { disciplines, metricGroups, ...rest } = rich;
  void disciplines;
  void metricGroups;
  return rest as object;
}

async function main() {
  const ops = [];

  for (const [slug, c] of Object.entries(existing) as [string, Content][]) {
    const row = await prisma.project.findUnique({ where: { slug } });
    if (!row) { console.log(`skip    ${slug} (not found)`); continue; }
    if (Object.keys((row.richContent ?? {}) as object).length) { console.log(`skip    ${slug} (already has a write-up)`); continue; }

    const placeholder = (v: string) => v.startsWith("PLACEHOLDER");
    ops.push(prisma.project.update({
      where: { slug },
      data: {
        richContent: shown(c.rich),
        ...(row.shortDescription === row.tagline ? { shortDescription: c.shortDescription } : {}),
        ...(placeholder(row.challenge) ? { challenge: c.challenge } : {}),
        ...(placeholder(row.approach) ? { approach: c.approach } : {}),
        ...(placeholder(row.outcome) ? { outcome: c.outcome } : {}),
        ...(c.client && !row.client ? { client: c.client } : {}),
      },
    }));
    console.log(`update  ${slug}`);
  }

  const max = await prisma.project.aggregate({ _max: { sortOrder: true } });
  let order = (max._max.sortOrder ?? -1) + 1;
  for (const f of fresh) {
    if (await prisma.project.findUnique({ where: { slug: f.slug } })) { console.log(`skip    ${f.slug} (exists)`); continue; }
    const { rich, ...scalars } = f;
    ops.push(prisma.project.create({
      data: { ...scalars, highlights: [], imageLabels: [], richContent: shown(rich), featured: false, published: false, sortOrder: order++ },
    }));
    console.log(`create  ${f.slug} (as a draft)`);
  }

  if (!APPLY) {
    console.log(`\nNothing written. ${ops.length} change(s) would be made — run again with --apply.`);
  } else if (ops.length) {
    writeFileSync("case-studies-backup.json", JSON.stringify(await prisma.project.findMany(), null, 2));
    await prisma.$transaction(ops);
    console.log(`\nDone: ${ops.length} case studies written. The rows as they were are in case-studies-backup.json.`);
  } else {
    console.log("\nNothing to do.");
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
