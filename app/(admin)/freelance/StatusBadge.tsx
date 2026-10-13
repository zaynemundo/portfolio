import { JOB_STATUS, StatusPill } from "@/app/(admin)/_components/ui/StatusPill";

export function StatusBadge({ status }: { status: string }) {
  const known = JOB_STATUS[status] ?? { label: status, tone: "neutral" as const };
  return <StatusPill tone={known.tone}>{known.label}</StatusPill>;
}
