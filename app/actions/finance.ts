"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { TransactionType } from "@/generated/prisma/client/client";

export interface TransactionFormData {
  date: string; // yyyy-mm-dd
  type: string; // "INCOME" | "EXPENSE"
  amount: string; // numeric string from the input
  currency: string;
  category: string;
  description: string;
  clientId: string;
  projectId: string;
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

  await prisma.transaction.update({ where: { id }, data: buildData(data) });

  revalidatePath("/finance");
  revalidatePath(`/finance/${id}`);
  updateTag(CACHE_TAGS.transactions);
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<void> {
  await requireSession();
  await prisma.transaction.delete({ where: { id } }).catch(() => {});
  revalidatePath("/finance");
  updateTag(CACHE_TAGS.transactions);
}
