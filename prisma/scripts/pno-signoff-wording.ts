import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

/*
 * P&O Marinas: "signed off" becomes "led QA and final acceptance", since
 * formal sign-off was the client's.
 *
 *   npx tsx prisma/scripts/pno-signoff-wording.ts           shows the change
 *   npx tsx prisma/scripts/pno-signoff-wording.ts --apply   writes it
 */

config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

type Phase = { title: string; bullets: { heading: string; body: string }[] };

async function main() {
  const row = await prisma.project.findUnique({ where: { slug: "pno-marinas" } });
  if (!row) throw new Error("P&O Marinas not found.");
  const rich = (row.richContent ?? {}) as Record<string, unknown>;
  const changes: string[] = [];

  const phases = ((rich.transformationSections as Phase[] | undefined) ?? []).map((p) => ({
    ...p,
    bullets: p.bullets.map((b) => {
      if (b.heading !== "Sign-off") return b;
      const next = { heading: "Final acceptance", body: "Led QA and final acceptance of the interactive system before deployment." };
      changes.push(`"${b.heading}: ${b.body}"  →  "${next.heading}: ${next.body}"`);
      return next;
    }),
  }));

  const why = ((rich.whyItWorked as string[] | undefined) ?? []).map((para) => {
    if (!para.includes("signing off on completion")) return para;
    changes.push(`"…and signing off on completion…"  →  "…and leading final acceptance…"`);
    return para.replace("signing off on completion", "leading final acceptance");
  });

  console.log(changes.length ? changes.join("\n") : "Nothing to change.");
  if (process.argv.includes("--apply") && changes.length) {
    await prisma.project.update({ where: { slug: "pno-marinas" }, data: { richContent: { ...rich, transformationSections: phases, whyItWorked: why } as object } });
    console.log("Done.");
  } else if (changes.length) console.log("Nothing written — run again with --apply.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
