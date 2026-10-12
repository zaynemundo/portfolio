/** Cancel + submit row at the bottom of a form inside a Modal. */
export function DialogActions({ onCancel, pending, submitLabel }: { onCancel: () => void; pending: boolean; submitLabel: string }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-border text-foreground/80 text-[13px] font-medium px-3.5 py-2 hover:bg-background transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
