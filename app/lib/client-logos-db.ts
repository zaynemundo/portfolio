import { prisma } from "@/app/lib/prisma";
import { STATIC_CLIENT_LOGOS, type ClientLogoData } from "@/app/lib/client-logos";

export type { ClientLogoData };
export { STATIC_CLIENT_LOGOS };

export async function getClientLogos(): Promise<ClientLogoData[]> {
  const rows = await prisma.clientLogo.findMany({ orderBy: { sortOrder: "asc" } });
  if (rows.length === 0) return STATIC_CLIENT_LOGOS;
  return rows.map((r) => ({ id: r.id, name: r.name, initials: r.initials, bg: r.bg, light: r.light }));
}
