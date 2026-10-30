import { randomBytes, scryptSync } from "node:crypto";
import { prisma } from "./seed-client";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx prisma/scripts/seed-user.ts <email> [password]");
    process.exit(1);
  }

  const password = process.argv[3] ?? randomBytes(9).toString("base64url");

  const passwordHash = hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`User ready: ${user.email}`);
  console.log(`Password: ${password}`);

  await prisma.$disconnect();
}

main();
