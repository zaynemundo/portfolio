import { PrismaClient } from "../../generated/prisma/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Local SQLite client for the seed scripts. The data is written to a file,
 * dumped to SQL and then loaded into the remote D1 database.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.SEED_DATABASE_URL ?? "file:./prisma/seed.db",
  }),
});
