"use server";

import { settleInvoice } from "@/app/lib/invoice-settle";
import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { TransactionType } from "@/generated/prisma/client/client";
import type { UploadResult } from "@/app/actions/settings";

export interface TransactionFormData {
  date: string; // yyyy-mm-dd
  type: string; // "INCOME" | "EXPENSE"
  amount: string; // numeric string from the input
  currency: string;
  category: string;
  description: string;
  clientId: string;
  projectId: string;
  attachmentUrl: string;
}

export interface TransactionActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function buildData(data: TransactionFormData) {
  const amount = Number(data.amount);
  return {
    date: new Date(data.date),
    type: data.type as TransactionType,
    amount,
    currency: data.currency.trim() || "AED",
    category: data.category.trim() || null,
    description: data.description.trim() || null,
    clientId: data.clientId || null,
    projectId: data.projectId || null,
    attachmentUrl: data.attachmentUrl.trim() || null,
  };
}

function validate(data: TransactionFormData): string | null {
  if (!data.date) return "Date is required.";
  if (data.type !== "INCOME" && data.type !== "EXPENSE") return "Invalid type.";
  if (!data.amount || Number.isNaN(Number(data.amount)) || Number(data.amount) <= 0) return "Enter a valid amount.";
  return null;
}

export async function createTransaction(data: TransactionFormData): Promise<TransactionActionResult> {
  await requireSession();
  const error = validate(data);
  if (error) return { ok: false, error };

  const transaction = await prisma.transaction.create({ data: buildData(data) });

  revalidatePath("/finance");
  updateTag(CACHE_TAGS.transactions);
  return { ok: true, id: transaction.id };
}

export async function updateTransaction(id: string, data: TransactionFormData): Promise<TransactionActionResult> {
  await requireSession();
  const error = validate(data);
  if (error) return { ok: false, error };

  const updated = await prisma.transaction.update({ where: { id }, data: buildData(data) });
  if (updated.invoiceId) await settleInvoice(updated.invoiceId);

  revalidatePath("/finance");
  revalidatePath(`/finance/${id}`);
  updateTag(CACHE_TAGS.transactions);
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<void> {
  await requireSession();
  const deleted = await prisma.transaction.delete({ where: { id } }).catch(() => null);
  if (deleted?.invoiceId) await settleInvoice(deleted.invoiceId);
  revalidatePath("/finance");
  updateTag(CACHE_TAGS.transactions);
}

export async function uploadTransactionAttachment(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: "File is too large (max 15MB)." };

  const blob = await put(`transaction-attachment/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { ok: true, url: blob.url };
}
