import type { Project } from "@/app/lib/projects";

/**
 * Client logo tile used on project cards and the track-record section.
 *
 * Renders an uploaded logo when one exists, otherwise a tinted tile with the
 * client's initials. Falling back to initials keeps every card looking
 * deliberate while logo files are still being collected.
 */
interface Props {
  name: string;
  logo?: Project["logo"];
  size?: number;
  radius?: number;
  className?: string;
}

export function ProjectLogo({ name, logo, size = 32, radius = 8, className = "" }: Props) {
  const initials = logo?.initials ?? name.slice(0, 2).toUpperCase();
  const bg = logo?.bg ?? "#e4e4e7";

  return (
    <div
      className={`flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg }}
    >
      {logo?.src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logo.src}
          alt={`${name} logo`}
          className="w-full h-full object-contain"
          style={{ padding: Math.round(size * 0.16) }}
        />
      ) : (
        <span
          className="font-bold tracking-tight leading-none select-none"
          style={{
            fontSize: Math.max(8, Math.round(size * 0.28)),
            color: logo?.light ? "rgba(255,255,255,0.78)" : "rgba(63,63,70,0.8)",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
