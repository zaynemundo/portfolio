import { employment, education } from "@/app/lib/experience";

export interface ExpEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string | null;
  current: boolean;
  description: string | null;
  type: string;
}

/* Static fallback used when DB is unreachable */
const STATIC_ENTRIES: ExpEntry[] = [
  ...employment.map((job, i) => ({
    id: `static-job-${i}`,
    company: job.company,
    role: job.role,
    period: job.period,
    location: job.location,
    current: job.current,
    description: job.responsibilities[0] ?? null,
    type: "employment",
  })),
  ...education.map((edu, i) => ({
    id: `static-edu-${i}`,
    company: edu.institution,
    role: edu.qualification,
    period: edu.period,
    location: null,
    current: false,
    description: edu.notes?.[0] ?? null,
    type: "education",
  })),
];

interface Props {
  entries: ExpEntry[];
}

export function ExperienceTimeline({ entries }: Props) {
  const items = entries.length > 0 ? entries : STATIC_ENTRIES;

  return (
    <div className="about-cv__timeline">
      {items.map((entry) => {
        const isEducation = entry.type === "education";
        const initials = entry.company
          ? entry.company.slice(0, 2).toUpperCase()
          : isEducation
            ? "ED"
            : "CT";

        return (
          <div key={entry.id} className="about-cv__timeline-entry">
            <div className="about-cv__timeline-marker" aria-hidden="true">
              <span className="about-cv__timeline-initials">{initials}</span>
            </div>
            <div className="about-cv__timeline-content">
              <div className="about-cv__timeline-header">
                <span className="about-cv__timeline-company">
                  {entry.company}
                </span>
                {entry.current && (
                  <span className="about-cv__badge about-cv__badge--current">
                    Current
                  </span>
                )}
                {isEducation && (
                  <span className="about-cv__badge about-cv__badge--edu">
                    Education
                  </span>
                )}
              </div>
              <p className="about-cv__timeline-role">{entry.role}</p>
              <p className="about-cv__timeline-meta">
                {entry.period}
                {entry.location ? ` · ${entry.location}` : ""}
              </p>
              {entry.description && (
                <p className="about-cv__timeline-desc">{entry.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
