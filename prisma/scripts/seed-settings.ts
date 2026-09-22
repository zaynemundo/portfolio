import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      email: "mzaira.mundo@gmail.com",
      phone: "+971 50 562 8417",
      linkedinUrl: "https://linkedin.com/in/zaira-mundo/",
      githubUrl: "https://github.com/mzaira",
      resumeUrl: "/docs/zaira-mundo-cv.pdf",
      portraitUrl: "/portrait.jpg",
    },
  });
  console.log("Seeded site settings:", settings.id);
  await prisma.$disconnect();
}

main();
