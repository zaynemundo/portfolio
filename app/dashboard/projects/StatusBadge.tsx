const LABELS: Record<string, string> = {
  NOT_STARTED: "Not started",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

const CLASSES: Record<string, string> = {
  NOT_STARTED: "bg-zinc-800 text-zinc-400",
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  ON_HOLD: "bg-amber-500/15 text-amber-400",
  COMPLETED: "bg-purple-500/15 text-purple-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${CLASSES[status] ?? CLASSES.NOT_STARTED}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
