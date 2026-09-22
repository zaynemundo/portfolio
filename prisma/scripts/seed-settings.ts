import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../../generated/prisma/client/client";
import { aboutChapters } from "../../app/data/aboutChapters";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const heroScenes = [
  {
    heading: "Zaira Mundo",
    description:
      "Digital Designer and Developer building standards-compliant, accessible digital platforms for institutional, commercial, and global audiences — across React, WordPress, Shopify, and custom systems.",
    start: 0,
    end: 0.28,
  },
  {
    heading: "Websites that work as hard as they look",
    description:
      "Institutional platforms, healthcare portals, and commercial digital services — designed and engineered to international accessibility standards, optimised for performance, and built for long-term organizational use.",
    start: 0.26,
    end: 0.52,
  },
  {
    heading: "Every detail is a decision",
    description:
      "Thoughtful visual design paired with WCAG 2.1 AA compliance, sub-second load times, and semantic information architecture — the rigour behind every pixel and every line of code.",
    start: 0.5,
    end: 0.74,
  },
  {
    heading: "Let’s build something that lasts.",
    ctaLabel: "Get in touch",
    ctaHref: "#contact",
    start: 0.72,
    end: 0.9,
  },
];

async function main() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      name: "Zaira Mundo",
      jobTitle: "Digital Designer & Developer",
      heroScenes: heroScenes as Prisma.InputJsonValue,
      aboutChapters: aboutChapters as unknown as Prisma.InputJsonValue,
    },
    create: {
      id: "singleton",
      name: "Zaira Mundo",
      jobTitle: "Digital Designer & Developer",
      email: "mzaira.mundo@gmail.com",
      phone: "+971 50 562 8417",
      linkedinUrl: "https://linkedin.com/in/zaira-mundo/",
      githubUrl: "https://github.com/mzaira",
      resumeUrl: "/docs/zaira-mundo-cv.pdf",
      portraitUrl: "/portrait.jpg",
      heroScenes: heroScenes as Prisma.InputJsonValue,
      aboutChapters: aboutChapters as unknown as Prisma.InputJsonValue,
    },
  });
  console.log("Seeded site settings:", settings.id);
  await prisma.$disconnect();
}

main();
