"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { uniqueClientSlug } from "@/app/lib/client-slug";
import { LeadStage } from "@/generated/prisma/client/client";

export interface LeadActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function invalidate() {
  revalidatePath("/inquiries");
  revalidatePath("/inquiries/[id]", "page");
  updateTag(CACHE_TAGS.inquiries);
}

const STAGES = Object.values(LeadStage) as string[];

/** Moves a lead along the pipeline. Anything past "New" has clearly been seen, so it stops counting as unread. */
export async function setLeadStage(id: string, stage: string): Promise<void> {
  await requireSession();
  if (!STAGES.includes(stage)) return;
  await prisma.inquiry.update({ where: { id }, data: { stage: stage as LeadStage, ...(stage === "NEW" ? {} : { read: true }) } });
  invalidate();
}

/** Saves the one-line note shown on a lead's card. */
export async function setLeadNote(id: string, note: string): Promise<void> {
  await requireSession();
  await prisma.inquiry.update({ where: { id }, data: { note: note.trim() || null } });
  invalidate();
}

/** A lead that didn't come through the website: a referral, a call, a message elsewhere. */
export async function addLead(data: { name: string; email: string; message: string }): Promise<LeadActionResult> {
  await requireSession();
  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const lead = await prisma.inquiry.create({
    // Typed in by hand, so there is nothing new to read.
    data: { name: data.name.trim(), email: data.email.trim(), message: data.message.trim(), read: true },
  });
  invalidate();
  return { ok: true, id: lead.id };
}

/**
 * Turns a lead into a client and a job, carrying the name, email and message
 * across, and marks the lead as won. Someone who already has a contact with
 * the same email gets the job added to their existing client instead of a
 * second client being made. Returns the new job's id.
 */
export async function createJobFromLead(id: string): Promise<LeadActionResult> {
  await requireSession();
  const lead = await prisma.inquiry.findUnique({ where: { id } });
  if (!lead) return { ok: false, error: "Lead not found." };
  if (lead.projectId) return { ok: true, id: lead.projectId };

  const email = lead.email.trim();
  const existing = email
    ? await prisma.contact.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { clientId: true } })
    : null;

  let clientId = existing?.clientId;
  if (!clientId) {
    const client = await prisma.client.create({
      data: {
        name: lead.name,
        slug: await uniqueClientSlug(lead.name),
        contacts: { create: { name: lead.name, email: email || null } },
      },
    });
    clientId = client.id;
  }

  const project = await prisma.freelanceProject.create({
    data: { name: `New job for ${lead.name}`, clientId, description: lead.message || null, nextAction: "Reply and agree the scope" },
  });
  await prisma.inquiry.update({ where: { id }, data: { stage: "WON", read: true, projectId: project.id } });

  invalidate();
  revalidatePath("/freelance");
  revalidatePath("/clients");
  updateTag(CACHE_TAGS.freelance);
  updateTag(CACHE_TAGS.clients);
  updateTag(CACHE_TAGS.contacts);
  return { ok: true, id: project.id };
}

export async function markInquiryRead(id: string, read: boolean): Promise<void> {
  await requireSession();
  await prisma.inquiry.update({ where: { id }, data: { read } });
  revalidatePath("/inquiries");
  updateTag(CACHE_TAGS.inquiries);
}

export async function deleteInquiry(id: string): Promise<void> {
  await requireSession();
  await prisma.inquiry.delete({ where: { id } }).catch(() => {});
  revalidatePath("/inquiries");
  updateTag(CACHE_TAGS.inquiries);
}
