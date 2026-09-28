"use client";

import { useRouter } from "next/navigation";

export function MonthFilter({ month }: { month: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={(e) => router.push(`/finance?month=${e.target.value}`)}
      className="rounded-lg bg-card border border-border px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring transition-colors"
    />
  );
}
