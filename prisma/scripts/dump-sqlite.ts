import Database from "better-sqlite3";
import { writeFileSync } from "node:fs";

/**
 * Dumps the local seed database to a SQL file that can be loaded into D1 with
 * `wrangler d1 execute portfolio-db --remote --file=prisma/d1/seed.sql`.
 */
const source = process.env.SEED_DATABASE_PATH ?? "prisma/seed.db";
const output = process.env.SEED_SQL_OUTPUT ?? "prisma/d1/seed.sql";

const db = new Database(source, { readonly: true });

const tables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name",
  )
  .all() as { name: string }[];

function quote(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  if (value instanceof Uint8Array) return `X'${Buffer.from(value).toString("hex")}'`;
  const text = String(value).replace(/'/g, "''");
  return `'${text}'`;
}

const lines: string[] = [];

for (const { name } of tables) {
  const columns = (db.prepare(`PRAGMA table_info("${name}")`).all() as { name: string }[]).map((c) => c.name);
  const rows = db.prepare(`SELECT * FROM "${name}"`).all() as Record<string, unknown>[];
  if (!rows.length) continue;

  const columnList = columns.map((c) => `"${c}"`).join(", ");
  for (const row of rows) {
    const values = columns.map((c) => quote(row[c])).join(", ");
    lines.push(`INSERT OR REPLACE INTO "${name}" (${columnList}) VALUES (${values});`);
  }
}

writeFileSync(output, lines.join("\n"), "utf8");
console.log(`Wrote ${tables.length} tables to ${output}`);
