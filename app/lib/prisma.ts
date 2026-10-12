import { statSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
  var __prismaGeneratedAt: number | undefined;
}

// Opening a connection to the database costs well over a second (TLS plus
// authentication across regions), while a query on an open one takes a
// fraction of that. The pool default drops connections after 10 idle seconds,
// which meant almost every page load paid the connection cost again — so
// connections are kept for five minutes instead.
function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 5 * 60 * 1000,
    keepAlive: true,
  });
  return new PrismaClient({ adapter });
}

/** When the generated client was last written — it changes every time `prisma generate` runs. */
function generatedAt(): number {
  try {
    return statSync(join(process.cwd(), "generated", "prisma", "client", "client.ts")).mtimeMs;
  } catch {
    return 0;
  }
}

function devClient(): PrismaClient {
  // In development one client is kept across hot reloads so connections are
  // reused. After a schema change that kept client is out of date and fails
  // with "Unknown argument …", so it is replaced whenever the generated
  // client has been rewritten — no dev-server restart needed.
  const stamp = generatedAt();
  if (!global.__prisma || global.__prismaGeneratedAt !== stamp) {
    void global.__prisma?.$disconnect().catch(() => {});
    global.__prisma = createClient();
    global.__prismaGeneratedAt = stamp;
  }
  return global.__prisma;
}

export const prisma = process.env.NODE_ENV === "production" ? createClient() : devClient();
