/**
 * A single case-study visual slot.
 *
 * Renders the real screenshot when `src` is supplied, otherwise a labelled
 * placeholder using the same dotted treatment as CaseStudyImageSlider so
 * unfinished case studies still read as intentional layout rather than gaps.
 */
interface Props {
  label: string;
  caption?: string;
  src?: string;
  alt?: string;
  bg?: string;
  dark?: boolean;
  /** Tailwind aspect ratio class, e.g. "aspect-[16/10]" */
  aspect?: string;
}

export function CaseStudyImage({
  label,
  caption,
  src,
  alt,
  bg = "#f4f4f5",
  dark = false,
  aspect = "aspect-[16/10]",
}: Props) {
  return (
    <figure className="m-0">
      <div
        className={`${aspect} rounded-xl overflow-hidden border flex items-center justify-center`}
        style={{
          backgroundColor: bg,
          borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundImage: dark
            ? "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)"
            : "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt={alt ?? label} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="text-center px-6">
            <p
              className="text-[11px] font-medium mb-1"
              style={{ color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)" }}
            >
              {label}
            </p>
            <p
              className="text-[10px]"
              style={{ color: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" }}
            >
              Screenshot to be added
            </p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed">{caption}</figcaption>
      )}
    </figure>
  );
}
