import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

/*
 * Applies the case study tidy-up plan to the stored content:
 *
 *   1. Each number is said once: Results drops any figure the top stats already show.
 *   3. Execution tags name the work rather than repeat a figure.
 *   4. The image notes copied from the written document are no longer used as captions.
 *
 * (Rule 2, no Results chapter without results, is handled by the page itself.)
 *
 *   npx tsx prisma/scripts/tidy-case-studies.ts           lists what would change
 *   npx tsx prisma/scripts/tidy-case-studies.ts --apply   writes it
 *
 * Only the parts named above are touched. Uploaded images and every other
 * chapter stay as they are. Safe to run twice.
 */

config({ path: [".env.local", ".env"] });

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

type Metric = { value: string; label: string };
type Group = { label: string; metrics: Metric[] };
type Discipline = { name: string; items: string[]; visual?: string; image?: string };
type Rich = Record<string, unknown>;

const m = (value: string, label: string): Metric => ({ value, label });

/** Changes that are specific to one case study, made before the shared rules run. */
const SPECIFIC: Record<string, (rich: Rich) => void> = {
  "pno-marinas": (rich) => {
    // Leads with scope: the audience, the new pages, the map.
    rich.heroMetrics = [
      m("8K", "Total users, with organic traffic as the dominant source"),
      m("4", "New core pages: Berth · Berth Process · Cruise Terminal · Mina Rashid Lifestyle"),
      m("1", "Custom interactive berth map"),
    ];
    replaceGroup(rich, "Platform & Engagement", [
      m("Organic", "Primary acquisition channel"),
      m("Live", "Berth map connected to live berth availability"),
      m("2", "Execution phases: revamp → full rebuild"),
    ]);
    renameTag(rich, "481 Posts", "Post Design");
  },
  "scandinavian-physio": (rich) => renameTag(rich, "8 Homepage Drafts", "Homepage Drafts"),
  "vijit-pillai-art": (rich) => dropHero(rich, "1"),
  "rocky-real-estate": (rich) => {
    dropHero(rich, "4 years");
    // What is left of Traffic & Conversion joins the infrastructure group.
    const groups = (rich.resultGroups as Group[] | undefined) ?? [];
    const traffic = groups.find((g) => g.label === "Traffic & Conversion");
    const platform = groups.find((g) => g.label === "Platform & SEO Infrastructure");
    const tracked = traffic?.metrics.find((x) => x.value === "Tracked");
    if (traffic && platform && tracked) {
      platform.metrics = [tracked, ...platform.metrics.filter((x) => x.value !== "Tracked")];
      rich.resultGroups = groups.filter((g) => g !== traffic);
    }
  },
  "monili-jewellers": (rich) => {
    // Shows the scale figures that were stored but never displayed.
    const stored = ((rich.metricGroups as Group[] | undefined) ?? []).find((g) => g.label === "Platform Scale");
    const groups = (rich.resultGroups as Group[] | undefined) ?? [];
    if (stored && !groups.some((g) => g.label === stored.label)) rich.resultGroups = [...groups, stored];
    // Unused data, including a "481 assets" figure that belongs to P&O Marinas.
    delete rich.metricGroups;
    delete rich.disciplines;
  },
};

function replaceGroup(rich: Rich, label: string, metrics: Metric[]) {
  const groups = (rich.resultGroups as Group[] | undefined) ?? [];
  if (groups.some((g) => g.label === label)) rich.resultGroups = groups.map((g) => (g.label === label ? { label, metrics } : g));
}

function renameTag(rich: Rich, from: string, to: string) {
  const list = rich.executionDisciplines as Discipline[] | undefined;
  if (list) rich.executionDisciplines = list.map((d) => ({ ...d, items: d.items.map((item) => (item === from ? to : item)) }));
}

function dropHero(rich: Rich, value: string) {
  const hero = rich.heroMetrics as Metric[] | undefined;
  if (hero && hero.length > 3) rich.heroMetrics = hero.filter((x) => x.value !== value);
}

/** The rules every case study follows. */
function shared(rich: Rich) {
  // Rule 1: Results does not repeat a top stat.
  const top = new Set(((rich.heroMetrics as Metric[] | undefined) ?? []).map((x) => x.value));
  const groups = rich.resultGroups as Group[] | undefined;
  if (groups) {
    const kept = groups
      .map((g) => ({ ...g, metrics: g.metrics.filter((x) => !top.has(x.value)) }))
      .filter((g) => g.metrics.length > 0);
    if (kept.length) rich.resultGroups = kept;
    else delete rich.resultGroups;
  }
  // Rule 4: the image notes are not captions.
  const list = rich.executionDisciplines as Discipline[] | undefined;
  if (list) rich.executionDisciplines = list.map((d) => { const { visual, ...rest } = d; void visual; return rest; });
}

const stats = (list: unknown) => ((list as Metric[] | undefined) ?? []).map((x) => x.value).join(" · ") || "none";
const results = (rich: Rich) => ((rich.resultGroups as Group[] | undefined) ?? []).map((g) => `${g.label}: ${stats(g.metrics)}`).join("  |  ") || "none";

async function main() {
  const rows = await prisma.project.findMany({ orderBy: { sortOrder: "asc" } });
  const ops = [];

  for (const row of rows) {
    const before = (row.richContent ?? {}) as Rich;
    const after = structuredClone(before);
    SPECIFIC[row.slug]?.(after);
    shared(after);
    if (JSON.stringify(before) === JSON.stringify(after)) { console.log(`\n${row.name}: nothing to change`); continue; }

    console.log(`\n${row.name}`);
    if (stats(before.heroMetrics) !== stats(after.heroMetrics)) console.log(`  top stats  ${stats(before.heroMetrics)}  →  ${stats(after.heroMetrics)}`);
    if (results(before) !== results(after)) console.log(`  results    ${results(before)}\n          →  ${results(after)}`);
    const captions = ((before.executionDisciplines as Discipline[] | undefined) ?? []).filter((d) => d.visual).length;
    if (captions) console.log(`  captions   ${captions} image note(s) removed`);
    ops.push(prisma.project.update({ where: { id: row.id }, data: { richContent: after as object } }));
  }

  if (!APPLY) console.log(`\nNothing written. ${ops.length} case studies would change — run again with --apply.`);
  else if (ops.length) {
    const file = `case-studies-backup-${Date.now()}.json`;
    writeFileSync(file, JSON.stringify(rows, null, 2));
    await prisma.$transaction(ops);
    console.log(`\nDone: ${ops.length} case studies updated. The content as it was is saved in ${file}.`);
  } else console.log("\nNothing to do.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
