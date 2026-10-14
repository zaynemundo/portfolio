import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Same order as Next.js: .env.local wins over .env (dotenv never overwrites a
// value that is already set). On Vercel neither file exists and the real
// environment is used.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
