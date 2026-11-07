interface Props {
  /** e.g. "(01)" */
  index: string;
  label: string;
  className?: string;
}

/** The small mono rule + numbering that opens every homepage section. */
export function SectionHead({ index, label, className = "" }: Props) {
  return (
    <div className={`site-mono flex items-center gap-4 text-ink-soft ${className}`}>
      <span className="text-brand">{index}</span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
