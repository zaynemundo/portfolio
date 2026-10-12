import { prisma } from "@/app/lib/prisma";

/**
 * The readable part of a client's address, e.g. "DavaoLease.ph" → "davaolease".
 * A website ending such as ".ph" or ".com" is dropped so the address reads as the name.
 */
export function slugifyClientName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\.[a-z]{2,4}$/, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "client";
}

/** A slug for this name that no other client uses: "acme", then "acme-2", "acme-3"… */
export async function uniqueClientSlug(name: string, exceptClientId?: string): Promise<string> {
  const base = slugifyClientName(name);
  const taken = new Set(
    (
      await prisma.client.findMany({
        where: { slug: { startsWith: base }, ...(exceptClientId ? { id: { not: exceptClientId } } : {}) },
        select: { slug: true },
      })
    ).map((c) => c.slug),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
