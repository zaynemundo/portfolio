"use client";

import { useRouter } from "next/navigation";
import { DateField } from "@/app/(admin)/_components/ui/DateField";

export function MonthFilter({ month }: { month: string }) {
  const router = useRouter();

  return (
    <DateField
      granularity="month"
      required
      fullWidth={false}
      value={month}
      onChange={(value) => router.push(`/finance?month=${value}`)}
      aria-label="Month"
      className="rounded-lg bg-card border border-border px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring transition-colors"
    />
  );
}
