"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { InvoiceStatus, Prisma } from "@/generated/prisma/client/client";

export interface InvoiceItemInput {
  description: string;
  quantity: string; // numeric string from the input
  rate: string; // numeric string from the input
}

export interface InvoiceFormData {
  clientId: string;
  projectId: string;
  status: string;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd or ""
  currency: string;
  notes: string;
  items: InvoiceItemInput[];
}

export interface InvoiceActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function validate(data: InvoiceFormData): string | null {
  if (!data.issueDate) return "Issue date is required.";
  const cleanItems = data.items.filter((i) => i.description.trim());
  if (cleanItems.length === 0) return "Add at least one line item.";
  for (const item of cleanItems) {
    if (!item.quantity || Number.isNaN(Number(item.quantity))) return "Each item needs a valid quantity.";
    if (!item.rate || Number.isNaN(Number(item.rate))) return "Each item needs a valid rate.";
  }
  return null;
}

function buildItems(data: InvoiceFormData) {
  return data.items
    .filter((i) => i.description.trim())
    .map((i) => ({
      description: i.description.trim(),
      quantity: Number(i.quantity),
      rate: Number(i.rate),
    }));
}

async function nextInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoice(data: InvoiceFormData): Promise<InvoiceActionResult> {
  await requireSession();
  const error = validate(data);
  if (error) return { ok: false, error };

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextInvoiceNumber(),
      clientId: data.clientId || null,
      projectId: data.projectId || null,
      status: data.status as InvoiceStatus,
      issueDate: parseDate(data.issueDate)!,
      dueDate: parseDate(data.dueDate),
      currency: data.currency.trim() || "AED",
      notes: data.notes.trim() || null,
      items: buildItems(data) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/invoices");
  updateTag(CACHE_TAGS.invoices);
  return { ok: true, id: invoice.id };
}

export async function updateInvoice(id: string, data: InvoiceFormData): Promise<InvoiceActionResult> {
  await requireSession();
  const error = validate(data);
  if (error) return { ok: false, error };

  await prisma.invoice.update({
    where: { id },
    data: {
      clientId: data.clientId || null,
      projectId: data.projectId || null,
      status: data.status as InvoiceStatus,
      issueDate: parseDate(data.issueDate)!,
      dueDate: parseDate(data.dueDate),
      currency: data.currency.trim() || "AED",
      notes: data.notes.trim() || null,
      items: buildItems(data) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  updateTag(CACHE_TAGS.invoices);
  return { ok: true, id };
}

export async function updateInvoiceStatus(id: string, status: string): Promise<void> {
  await requireSession();
  await prisma.invoice.update({ where: { id }, data: { status: status as InvoiceStatus } });
  revalidatePath("/finance");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  updateTag(CACHE_TAGS.invoices);
}

export async function deleteInvoice(id: string): Promise<void> {
  await requireSession();
  await prisma.invoice.delete({ where: { id } }).catch(() => {});
  revalidatePath("/finance");
  revalidatePath("/invoices");
  updateTag(CACHE_TAGS.invoices);
}
