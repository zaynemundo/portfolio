"use client";

import { useRouter } from "next/navigation";

export function MonthFilter({ month }: { month: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={(e) => router.push(`/finance?month=${e.target.value}`)}
      className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
    />
  );
}
