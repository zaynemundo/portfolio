"use server";

import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { routes } from "@/app/(admin)/_routes";

export interface SearchResult {
  href: string;
  label: string;
  category: string;
}

const RESULTS_PER_CATEGORY = 5;

/** Search across every content type in the admin — used by the top-bar CommandPalette. */
export async function searchAll(query: string): Promise<SearchResult[]> {
  await requireSession();

  const q = query.trim();
  if (q.length < 2) return [];

  const insensitive = { contains: q, mode: "insensitive" as const };

  const [posts, projects, clients, freelanceProjects, invoices, inquiries] = await Promise.all([
    prisma.blogPost.findMany({ where: { title: insensitive }, take: RESULTS_PER_CATEGORY, select: { id: true, title: true } }),
    prisma.project.findMany({ where: { name: insensitive }, take: RESULTS_PER_CATEGORY, select: { id: true, name: true } }),
    prisma.client.findMany({ where: { name: insensitive }, take: RESULTS_PER_CATEGORY, select: { id: true, name: true } }),
    prisma.freelanceProject.findMany({ where: { name: insensitive }, take: RESULTS_PER_CATEGORY, select: { id: true, name: true } }),
    prisma.invoice.findMany({ where: { invoiceNumber: insensitive }, take: RESULTS_PER_CATEGORY, select: { id: true, invoiceNumber: true } }),
    prisma.inquiry.findMany({ where: { name: insensitive }, take: RESULTS_PER_CATEGORY, select: { id: true, name: true } }),
  ]);

  return [
    ...posts.map((p) => ({ href: routes.blog.item(p.id), label: p.title, category: "Blog" })),
    ...projects.map((p) => ({ href: routes.caseStudies.item(p.id), label: p.name, category: "Case Studies" })),
    ...clients.map((c) => ({ href: routes.clients.item(c.id), label: c.name, category: "Clients" })),
    ...freelanceProjects.map((p) => ({ href: routes.projects.item(p.id), label: p.name, category: "Freelance Projects" })),
    ...invoices.map((i) => ({ href: routes.invoices.item(i.id), label: i.invoiceNumber, category: "Invoices" })),
    ...inquiries.map((i) => ({ href: routes.inquiries.item(i.id), label: i.name, category: "Inquiries" })),
  ];
}
