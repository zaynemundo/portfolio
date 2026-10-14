import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

/*
 * P&O Marinas: moves the three pictures from the old "areas of work" cards
 * onto the phases of "What I did", now that the two are one chapter.
 *
 *   npx tsx prisma/scripts/pno-phase-images.ts           shows the pairing
 *   npx tsx prisma/scripts/pno-phase-images.ts --apply   writes it
 *
 * A phase that already has its own picture is left alone.
 */

config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/** Which area's picture goes on which phase. */
const PAIRS: Record<string, string> = {
  "Social Media Design": "2023: Revamp",
  "Web & UX Design": "Brand Implementation",
  "Interactive Berth Map": "Interactive Berth Map — Product Ownership",
};

type Area = { name: string; image?: string };
type Phase = { title: string; image?: string };

async function main() {
  const row = await prisma.project.findUnique({ where: { slug: "pno-marinas" } });
  if (!row) throw new Error("P&O Marinas not found.");
  const rich = (row.richContent ?? {}) as Record<string, unknown>;
  const areas = (rich.executionDisciplines as Area[] | undefined) ?? [];
  const phases = ((rich.transformationSections as Phase[] | undefined) ?? []).map((p) => ({ ...p }));

  let moved = 0;
  for (const area of areas) {
    const phase = phases.find((p) => p.title === PAIRS[area.name]);
    if (!area.image) console.log(`skip   ${area.name} (no picture)`);
    else if (!phase) console.log(`skip   ${area.name} (phase "${PAIRS[area.name]}" not found)`);
    else if (phase.image) console.log(`skip   ${area.name} (the phase already has a picture)`);
    else { phase.image = area.image; moved++; console.log(`move   ${area.name}  →  ${phase.title}`); }
  }

  if (process.argv.includes("--apply") && moved) {
    await prisma.project.update({ where: { slug: "pno-marinas" }, data: { richContent: { ...rich, transformationSections: phases } as object } });
    console.log("Done.");
  } else console.log(moved ? "Nothing written — run again with --apply." : "Nothing to do.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
