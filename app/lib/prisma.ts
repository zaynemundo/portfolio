import { env } from "cloudflare:workers";
import { PrismaClient } from "@/generated/prisma/client/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// Cloudflare D1 is the only database now: the Worker binding is read from
// `env.DB` and every request in an isolate shares this client.
type D1 = ConstructorParameters<typeof PrismaD1>[0];

function createClient(): PrismaClient {
  const adapter = new PrismaD1((env as unknown as { DB: D1 }).DB);
  return new PrismaClient({ adapter });
}

export const prisma = createClient();
