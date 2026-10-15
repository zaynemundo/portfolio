import { Check, CircleAlert, Minus } from "lucide-react";
import { cn } from "@/app/lib/utils";

/* Every status in the admin is one of three tones, and a tone always looks
   the same: green with a tick for positive, orange with a dash for neutral
   or waiting, red with an alert for bad. The icon is there so a status
   doesn't depend on colour alone. Violet is the admin's own colour and is
   never used to say something about the data. */

export type StatusTone = "positive" | "neutral" | "negative";

const TONE: Record<StatusTone, { className: string; Icon: typeof Check }> = {
  positive: { className: "bg-positive/12 text-positive", Icon: Check },
  neutral: { className: "bg-warning/15 text-warning", Icon: Minus },
  negative: { className: "bg-negative/12 text-negative", Icon: CircleAlert },
};

export function StatusPill({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  const { className: toneClass, Icon } = TONE[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0", toneClass, className)}>
      <Icon size={11} strokeWidth={2.5} aria-hidden="true" />
      {children}
    </span>
  );
}

/** Invoice and quote statuses, in the order they're offered as a filter. */
export const INVOICE_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  SENT: { label: "Sent", tone: "neutral" },
  PAID: { label: "Paid", tone: "positive" },
  OVERDUE: { label: "Overdue", tone: "negative" },
  ACCEPTED: { label: "Accepted", tone: "positive" },
  DECLINED: { label: "Declined", tone: "negative" },
};

export function InvoiceStatusPill({ status, className }: { status: string; className?: string }) {
  const known = INVOICE_STATUS[status] ?? { label: status, tone: "neutral" as const };
  return <StatusPill tone={known.tone} className={className}>{known.label}</StatusPill>;
}

/** Job statuses, in the order they're listed. */
export const JOB_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  ACTIVE: { label: "Active", tone: "positive" },
  ON_HOLD: { label: "On hold", tone: "neutral" },
  NOT_STARTED: { label: "Not started", tone: "neutral" },
  COMPLETED: { label: "Completed", tone: "positive" },
};
