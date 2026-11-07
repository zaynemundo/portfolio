import { Prisma } from "../../generated/prisma/client/client";
import { prisma } from "./seed-client";
import { aboutChapters } from "../../app/data/aboutChapters";
import { heroScenes } from "../../app/data/heroScenes";

const settings = {
  name: "Zayne Mundo",
  jobTitle: "Graphic Designer & Web Developer",
  email: "zayne.mayo@gmail.com",
  phone: "+971 50 805 9968",
  linkedinUrl: "",
  githubUrl: "",
  resumeUrl: "/docs/zayne-mundo-cv.pdf",
  portraitUrl: "/portrait.jpg",
  heroScenes: heroScenes as unknown as Prisma.InputJsonValue,
  aboutChapters: aboutChapters as unknown as Prisma.InputJsonValue,
};

async function main() {
  const row = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: settings,
    create: {
      id: "singleton",
      ...settings,
    },
  });
  console.log("Seeded site settings:", row.id);
  await prisma.$disconnect();
}

main();
