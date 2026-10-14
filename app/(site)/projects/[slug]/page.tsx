import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity, ArrowRight, BarChart3, Boxes, BriefcaseBusiness, CalendarRange, LayoutPanelTop, Map as MapIcon, MessagesSquare, Check, CircleAlert, CircleCheck, FileText, Gauge, Hammer, Lightbulb,
  PackageCheck, PenTool, Scale, Target, TrendingUp, Users, Workflow, X, Megaphone, ArrowUpRight, Wrench, type LucideIcon,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getPublishedProject, getPublishedProjectIndex } from "@/app/lib/projects-db";
import type { Project } from "@/app/lib/projects";
import { CaseStudyImageSlider } from "@/app/components/CaseStudyImageSlider";
import type { SliderImage } from "@/app/components/CaseStudyImageSlider";
import { CaseStudyImage } from "@/app/components/CaseStudyImage";
import { BeforeAfterSlider } from "@/app/components/BeforeAfterSlider";
import { Reveal } from "@/app/components/Reveal";
import { ReadingProgress } from "@/app/components/ReadingProgress";
import { CaseStudyChapterNav } from "@/app/components/work/CaseStudyChapterNav";
import type { Chapter } from "@/app/components/work/CaseStudyChapterNav";
import { AnimatedMetric } from "@/app/components/work/AnimatedMetric";
import { ProcessTimeline } from "@/app/components/work/ProcessTimeline";
import { BackToTop } from "@/app/components/BackToTop";

interface Props {
  params: Promise<{ slug: string }>;
}

const DEFAULT_THEME = { bg: "#f4f4f5", dark: false };

/* Images only show where one has been uploaded: no placeholder frames, and
   no borrowing a gallery screenshot for an empty slot. */
function buildSlides(project: Project): SliderImage[] {
  const all = (project.images ?? []).map((src, i) => ({ src, caption: project.imageLabels?.[i] }));
  // The first screenshot is the cover: the thumbnail on the Work page and the
  // picture in the hero above. The gallery carries on from the second.
  const shown = all.slice(1);
  return shown.map(({ src, caption }, i) => {
    const label = caption ?? `Screen ${i + 1}`;
    return { src, label, alt: `${project.name} — ${label}` };
  });
}

/** Columns for a row of result tiles, by how many figures the group has. */
const RESULT_COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-2",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-3",
};

/** The icon beside each chapter's name. */
const CHAPTER_ICONS: Record<string, LucideIcon> = {
  "The problem": CircleAlert,
  "The results": TrendingUp,
  "The performance": Gauge,
  "Competitive Analysis": Scale,
  "User Research & Feedback": Users,
  "Wireframes & Iterations": PenTool,
  "User Flow & Architecture": Workflow,
  "The work": Hammer,
  "What was built": PackageCheck,
};

const DASHED_LINE = "repeating-linear-gradient(to bottom, #e4e4e7 0, #e4e4e7 4px, transparent 4px, transparent 9px)";

/** Columns for the headline figure cards. */
const STAT_COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1 max-w-sm",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4 max-w-[1040px]",
};

/** An icon for a headline figure, picked from what it counts. */
function statIcon(label: string, value: string): LucideIcon {
  const text = label.toLowerCase();
  if (/inquir|enquir|lead|message/.test(text)) return MessagesSquare;
  if (/user|visitor|follower|audience|customer/.test(text)) return Users;
  if (/page|screen|interface|storefront/.test(text)) return LayoutPanelTop;
  if (/map/.test(text)) return MapIcon;
  if (/session|traffic|view|event|engagement/.test(text)) return Activity;
  if (/conversion|sale|order/.test(text)) return Target;
  if (/product|categor|platform|brand|system/.test(text)) return Boxes;
  if (/month|year|season|phase/.test(text)) return CalendarRange;
  return metricIcon(value);
}

/** A figure that went up, a plain count, or a word such as "Live". */
function metricIcon(value: string): LucideIcon {
  if (/^[+↑]|%/.test(value)) return TrendingUp;
  if (/\d/.test(value)) return BarChart3;
  return CircleCheck;
}


export async function generateStaticParams() {
  return (await getPublishedProjectIndex()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.name,
    description: project.shortDescription,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: `${project.name} | Zaira Mundo`,
      description: project.shortDescription,
      url: `/projects/${slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const [project, index] = await Promise.all([
    getPublishedProject(slug),
    getPublishedProjectIndex(),
  ]);
  if (!project) notFound();

  const currentIndex = index.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? index[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < index.length - 1 ? index[currentIndex + 1] : null;

  const theme = { ...DEFAULT_THEME, ...(project.theme ?? {}) };
  const images = buildSlides(project);
  const cover = project.images?.[0];

  const isRich = Boolean(
    project.heroMetrics ||
      project.problemSections?.length ||
      project.transformationSections?.length ||
      project.executionDisciplines?.length ||
      project.whyItWorked?.length ||
      project.takeaway,
  );

  // A before/after comparison needs both pictures.
  const compare = project.compare?.beforeImage && project.compare.afterImage ? project.compare : undefined;
  // Results has its own figures, a closing note or a comparison — it never
  // repeats the numbers already shown at the top of the page.
  const outcomes = project.outcomes ?? [];
  const hasResults = Boolean(outcomes.length || project.resultGroups?.length || project.resultsNote || compare);

  const stats = project.heroMetrics ?? [];

  const hasPhases = Boolean(project.transformationSections?.length);

  // "Why it worked": its first sentence becomes the headline, the rest become numbered reasons.
  const thinking = (() => {
    const paras = project.whyItWorked ?? [];
    if (!paras.length) return null;
    const match = paras[0].match(/^(.+?[.!?])\s+([\s\S]+)$/);
    const lead = match ? match[1] : paras[0];
    const reasons = [...(match ? [match[2]] : []), ...paras.slice(1)];
    return { lead, reasons };
  })();

  const chapters: Chapter[] = isRich
    ? [
        ...(project.problemSections?.length        ? [{ label: "The problem",     id: "section-the-problem"                  }] : []),
        ...(hasPhases                              ? [{ label: "The work",        id: "section-the-work"                     }] : []),
        ...(hasResults                             ? [{ label: "The results",     id: "section-the-results"                  }] : []),
        ...(project.whyItWorked?.length            ? [{ label: "Why it worked",   id: "section-the-thinking"                 }] : []),
      ]
    : [];

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />
      <BackToTop />
      {chapters.length >= 2 && <CaseStudyChapterNav chapters={chapters} />}

      {/* ── Hero ───────────────────────────────────────────────────────────────
          A cover: the name and one-line summary centred, the first screenshot
          large beneath them, and the headline figures as cards that sit across
          the cover's lower edge, where the dark band meets the page. */}
      <div className="relative">
        {/* The dark band stops part-way down the cover so the picture bridges into the page. */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 bg-zinc-950 overflow-hidden ${cover ? "bottom-[22%] md:bottom-[26%]" : stats.length ? "bottom-24" : "bottom-0"}`}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 55% at 50% 100%, rgba(139,92,246,0.38), transparent 70%), radial-gradient(35% 40% at 0% 0%, rgba(139,92,246,0.14), transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(60% 70% at 50% 100%, #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(60% 70% at 50% 100%, #000, transparent 75%)",
            }}
          />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 pt-32">
          <Reveal>
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-[12px] text-zinc-600 mb-8">
              <Link href="/work" className="hover:text-zinc-400 transition-colors duration-150">Work</Link>
              <span aria-hidden="true" className="text-zinc-700">/</span>
              <span className="text-zinc-500">{project.name}</span>
            </nav>
          </Reveal>

          <div className="mx-auto max-w-4xl text-center">
            <Reveal delay={40}>
              <ul className="flex flex-wrap justify-center gap-2 mb-7" aria-label="Project details">
                {[project.category, project.year].filter(Boolean).map((tag, i) => (
                  <li
                    key={tag}
                    className={
                      i === 0
                        ? "rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 px-3.5 py-1 text-[12px] font-semibold text-[#c4b5fd]"
                        : "rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[12px] font-medium text-zinc-400"
                    }
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="font-extrabold text-white tracking-tight leading-[0.95] text-balance"
                style={{ fontSize: "clamp(2.75rem, 8vw, 6rem)", letterSpacing: "-0.045em" }}
              >
                {project.name}
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mx-auto mt-7 max-w-2xl text-[17px] md:text-[18px] text-zinc-300 leading-relaxed text-balance">
                {project.shortDescription}
              </p>
            </Reveal>
          </div>

          {cover && (
            <Reveal delay={160}>
              <div className="relative mx-auto mt-14 max-w-[1040px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt={project.imageAlt}
                  className="block w-full aspect-[1000/544] object-cover object-top rounded-3xl border border-white/15 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)]"
                />
              </div>
            </Reveal>
          )}

          {/* Headline figures: one card each, overlapping the cover's lower edge */}
          {stats.length > 0 && (
            <div
              className={`relative mx-auto grid max-w-[940px] gap-3 sm:gap-4 ${STAT_COLUMNS[Math.min(stats.length, 4)]} ${cover ? "-mt-10 md:-mt-16 px-3 md:px-0" : "mt-14"}`}
            >
              {stats.map((m, i) => {
                // "New core pages: Berth · …" → what is being counted, then the detail.
                const [lead, ...rest] = m.label.split(/: |, | — /);
                const StatIcon = statIcon(lead, m.value);
                return (
                  <div key={m.label} className="rounded-2xl bg-white p-5 md:p-6 shadow-[0_24px_50px_-20px_rgba(24,24,27,0.35)] ring-1 ring-zinc-950/5">
                    <Reveal delay={220 + i * 90}>
                      <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6]/12 text-[#7c3aed]">
                        <StatIcon size={17} aria-hidden="true" />
                      </span>
                      <p
                        className="font-extrabold text-zinc-950 leading-none tracking-tight tabular-nums whitespace-nowrap"
                        style={{ fontSize: stats.length > 3 ? "clamp(2rem, 3.4vw, 2.75rem)" : "clamp(2.25rem, 4.4vw, 3.5rem)", letterSpacing: "-0.04em" }}
                      >
                        <AnimatedMetric value={m.value} />
                      </p>
                      {/* What is counted, then the detail */}
                      <p className="mt-3.5">
                        <span className="block text-[15px] font-semibold text-zinc-900 leading-snug first-letter:uppercase">{lead}</span>
                        {rest.length > 0 && (
                          <span className="block text-[13.5px] text-zinc-600 leading-relaxed mt-1 first-letter:uppercase">{rest.join(", ")}</span>
                        )}
                      </p>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── At a glance ──────────────────────────────────────────────────────────
          The whole case study in one screen, for someone with a minute to spare.
          Who did the work and with what. The problem is told in its own chapter, the outcome closes the page. */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-16 md:pt-20">
        <div>
          <Reveal delay={80}>
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 md:p-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] lg:items-center lg:gap-10">
              {/* A soft violet wash in the corner, so the card reads as the "who" next to the problem */}
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#8B5CF6]/10 blur-2xl" />

              <div className="relative">
                <div className="min-w-0">
                  <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-zinc-500">My role</h2>
                  <p className="mt-1 text-[19px] font-semibold tracking-tight text-zinc-950 leading-snug">{project.role}</p>
                </div>
              </div>

              <dl className="relative space-y-5">
                {project.engineeringStack && <DetailRow label="Stack" value={project.engineeringStack} />}
                {project.typography && <DetailRow label="Typography" value={project.typography} />}
                <div>
                  <dt className="flex items-center gap-1.5 text-[12px] font-bold tracking-[0.14em] uppercase text-zinc-500 mb-2.5">
                    <Wrench size={13} aria-hidden="true" />
                    Tools
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="rounded-full bg-zinc-100 px-3 py-1 text-[13px] font-medium text-zinc-800">{tech}</span>
                    ))}
                  </dd>
                </div>
              </dl>

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between gap-5 rounded-2xl bg-zinc-950 px-5 py-4 text-white transition-colors duration-150 hover:bg-zinc-800"
                >
                  <span>
                    <span className="block text-[14.5px] font-semibold">Visit the live site</span>
                    <span className="block text-[12.5px] text-zinc-400 truncate">{project.liveUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Screenshot gallery ───────────────────────────────────────────────── */}
      {images.length > 0 && (
        <div>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
            <CaseStudyImageSlider
              images={images}
              placeholderBg={theme.bg}
              placeholderDark={theme.dark}
            />
          </div>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div>

          {/* Main content */}
          <div className="space-y-24 md:space-y-28">

            {/* ── Generic layout ── */}
            {!isRich && (
              <>
                <Reveal>
                  <Section title="Overview">
                    <p className="text-[16px] text-zinc-600 leading-relaxed">{project.shortDescription}</p>
                  </Section>
                </Reveal>
                {project.challenge && (
                  <Reveal>
                    <Section title="Challenge">
                      <p className="text-[16px] text-zinc-600 leading-relaxed">{project.challenge}</p>
                    </Section>
                  </Reveal>
                )}
                {project.approach && (
                  <Reveal>
                    <Section title="Approach">
                      <p className="text-[16px] text-zinc-600 leading-relaxed">{project.approach}</p>
                    </Section>
                  </Reveal>
                )}
                {project.highlights.length > 0 && (
                  <Reveal>
                    <Section title="Key Contributions">
                      <BulletList items={project.highlights} />
                    </Section>
                  </Reveal>
                )}
                {project.outcome && (
                  <Reveal>
                    <Section title="Outcome">
                      <p className="text-[16px] text-zinc-600 leading-relaxed">{project.outcome}</p>
                    </Section>
                  </Reveal>
                )}
                {project.accessibility && (
                  <Reveal>
                    <Section title="Accessibility">
                      <p className="text-[16px] text-zinc-600 leading-relaxed">{project.accessibility}</p>
                    </Section>
                  </Reveal>
                )}
                {(project.performance || project.seo) && (
                  <Reveal>
                    <Section title="Performance & SEO">
                      {project.performance && <p className="text-[16px] text-zinc-600 leading-relaxed mb-3">{project.performance}</p>}
                      {project.seo && <p className="text-[16px] text-zinc-600 leading-relaxed">{project.seo}</p>}
                    </Section>
                  </Reveal>
                )}
              </>
            )}

            {/* ── Rich case study ── */}
            {isRich && (
              <>

                {/* THE PROBLEM */}
                {project.problemSections?.map((ps) => (
                  <Reveal key={ps.title}>
                    <Section title="The problem">
                      <EditorialHeadline>{ps.title}</EditorialHeadline>
                      {project.problemIntro && (
                        <p className="text-[18px] text-zinc-600 leading-relaxed -mt-3 mb-10 max-w-3xl">{project.problemIntro}</p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-9">
                        {ps.bullets.map((b, bi) => (
                          <Reveal key={b.heading} delay={bi * 80}>
                            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5">
                              <span className="row-span-2 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"><CircleAlert size={16} aria-hidden="true" /></span>
                              <p className="text-[16px] font-semibold text-zinc-900 mb-1.5 self-center">{b.heading}</p>
                              <p className="text-[16px] text-zinc-600 leading-relaxed">{b.body}</p>
                            </div>
                          </Reveal>
                        ))}
                      </div>
                      {project.resultsImage && (
                        <div className="mt-12">
                          <CaseStudyImage
                            label="Overview"
                            caption={project.resultsImageCaption ?? "Analytics dashboard — traffic, events, and acquisition channels"}
                            src={project.resultsImage}
                            alt={`${project.name} — overview`}
                            bg={theme.bg}
                            dark={theme.dark}
                            aspect="aspect-[1000/544]"
                          />
                        </div>
                      )}
                    </Section>
                  </Reveal>
                ))}

                {/* THE TRANSFORMATION — vertical numbered timeline */}
                {hasPhases && (
                  <Reveal>
                    <Section title="The work">
                      <EditorialHeadline>
                        {project.transformationHeadline ?? "What changed."}
                      </EditorialHeadline>

                      {/* Numbered timeline: the step being read lights up as the reader scrolls (see ProcessTimeline). */}
                      <ProcessTimeline>
                        {project.transformationSections!.map((ts, i) => {
                          const isLast = i === project.transformationSections!.length - 1;
                          return (
                            <Reveal key={ts.title}>
                              <div data-step className="flex gap-7 md:gap-9">
                                <div className="flex flex-col items-center pt-0.5 shrink-0">
                                  <div
                                    data-step-circle
                                    className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[11px] font-mono text-zinc-400 relative z-10"
                                    style={{ transition: "background-color 0.45s ease-in-out, border-color 0.45s ease-in-out, color 0.35s ease-in-out" }}
                                  >
                                    {i + 1}
                                  </div>
                                  {!isLast && (
                                    <div data-step-line className="w-px flex-1 mt-3 relative overflow-hidden" style={{ background: DASHED_LINE }}>
                                      <div data-step-progress className="absolute top-0 left-0 w-full bg-[#8B5CF6]" style={{ height: "0%" }} />
                                    </div>
                                  )}
                                </div>
                                <div data-step-content className={isLast ? "pb-0 flex-1 min-w-0" : "pb-14 flex-1 min-w-0"}>
                                  <h3 className="text-[20px] font-semibold tracking-tight text-zinc-900 mb-3 leading-snug">{ts.title}</h3>
                                    <div>
                                      {ts.bullets.map((b, bi) => (
                                        <Reveal key={b.heading} delay={bi * 55}>
                                          <div className="grid sm:grid-cols-[220px_minmax(0,1fr)] gap-x-8 gap-y-0.5 py-1.5">
                                            <p className="flex items-start gap-2.5 text-[16px] font-semibold text-zinc-900"><Check size={17} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#8B5CF6]" aria-hidden="true" />{b.heading}</p>
                                            {b.body && <p className="text-[16px] text-zinc-600 leading-relaxed">{b.body}</p>}
                                          </div>
                                        </Reveal>
                                      ))}
                                    </div>
                                    {ts.image && (
                                      <figure className="mt-6">
                                        <a href={ts.image} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-zinc-200" aria-label={`Open the ${ts.title} picture full size`}>
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={ts.image}
                                            alt={`${project.name} — ${ts.title}`}
                                            className="block w-full aspect-[1000/544] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                                          />
                                        </a>
                                        {ts.imageCaption && <figcaption className="text-[13px] text-zinc-500 mt-2.5">{ts.imageCaption}</figcaption>}
                                      </figure>
                                    )}
                                </div>
                              </div>
                            </Reveal>
                          );
                        })}
                      </ProcessTimeline>
                    </Section>
                  </Reveal>
                )}

                {/* FINAL RESULTS — large bare numbers, no cards */}
                {hasResults && (
                  <Reveal>
                    <Section title="The results">
                      <EditorialHeadline>
                        {project.resultsHeadline ?? "The outcome."}
                      </EditorialHeadline>

                      {compare && (
                        <div className="mb-14">
                          <BeforeAfterSlider
                            beforeImage={compare.beforeImage}
                            afterImage={compare.afterImage}
                            beforeLabel={compare.beforeLabel}
                            afterLabel={compare.afterLabel}
                            caption={compare.caption}
                            bg={theme.bg}
                          />
                        </div>
                      )}

                      {/* Before → after: each part of the problem and what it became, in two aligned columns */}
                      {outcomes.length > 0 && (
                        <div className="mb-14">
                          <div className="hidden md:grid grid-cols-2 gap-3 mb-3 px-1">
                            <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] uppercase text-zinc-500">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600"><X size={13} strokeWidth={2.75} aria-hidden="true" /></span>
                              Before
                            </p>
                            <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] uppercase text-[#7c3aed] md:pl-6">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B5CF6] text-white"><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
                              After
                            </p>
                          </div>
                          <ul className="space-y-3">
                            {outcomes.map((o, oi) => (
                              <li key={o.area}>
                                <Reveal delay={oi * 70}>
                                  <div className="relative grid gap-2 md:grid-cols-2 md:gap-3">
                                    <div className="rounded-2xl bg-zinc-100/80 px-5 py-4 md:px-6 md:py-5">
                                      <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-zinc-400 mb-1.5">{o.area}</p>
                                      <p className="text-[15.5px] text-zinc-500 leading-snug"><span className="sr-only">Before: </span>{o.before}</p>
                                    </div>
                                    {/* The step from one to the other */}
                                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 z-10 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#7c3aed] shadow-md ring-1 ring-zinc-200 md:flex">
                                      <ArrowRight size={15} strokeWidth={2.5} />
                                    </span>
                                    <div className="rounded-2xl bg-[#8B5CF6]/[0.09] px-5 py-4 md:px-6 md:py-5 md:pl-9 ring-1 ring-inset ring-[#8B5CF6]/15">
                                      <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-[#7c3aed]/80 mb-1.5 md:hidden">{o.area}, now</p>
                                      <p className="text-[15.5px] font-semibold text-zinc-950 leading-snug md:mt-[22px]"><span className="sr-only">After: </span>{o.after}</p>
                                    </div>
                                  </div>
                                </Reveal>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {project.resultGroups && project.resultGroups.length > 0 && (
                        <div className="space-y-10">
                          {project.resultGroups.map((g) => (
                            <div key={g.label}>
                              {outcomes.length > 0 ? (
                                // A side story next to the before → after: one card, its figures in a row.
                                <div className="rounded-3xl bg-zinc-100/80 px-6 py-7 md:px-9 md:py-8">
                                  <p className="flex items-center gap-2.5 text-[16px] font-semibold text-zinc-950 mb-6">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-[#7c3aed]"><Megaphone size={15} aria-hidden="true" /></span>
                                    {g.label}
                                  </p>
                                  <div className={`grid gap-6 sm:grid-cols-2 ${RESULT_COLUMNS[Math.min(g.metrics.length, 5)]}`}>
                                    {g.metrics.map((m) => {
                                      const [lead, ...rest] = m.label.split(" — ");
                                      return (
                                        <div key={m.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.06)]">
                                          <p className="font-bold text-zinc-950 leading-none tracking-tight whitespace-nowrap" style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.125rem)" }}>
                                            <AnimatedMetric value={m.value} />
                                          </p>
                                          <p className="mt-3 text-[14.5px] font-semibold text-zinc-900">{lead}</p>
                                          {rest.length > 0 && <p className="mt-0.5 text-[13.5px] text-zinc-500 leading-relaxed first-letter:uppercase">{rest.join(" — ")}</p>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                              /* One row of equal tiles: as many columns as there are figures, up to four. */
                              <div className={`grid gap-3 sm:grid-cols-2 ${RESULT_COLUMNS[Math.min(g.metrics.length, 5)]}`}>
                                {g.metrics.map((m, mi) => {
                                  const [lead, ...rest] = m.label.split(" — ");
                                  const TileIcon = metricIcon(m.value);
                                  return (
                                    <div key={m.label} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6">
                                      <Reveal delay={mi * 80}>
                                        <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6]/12 text-[#7c3aed]"><TileIcon size={17} aria-hidden="true" /></span>
                                        <p className="font-bold text-zinc-950 leading-none tracking-tight mb-4"
                                           style={{ fontSize: "clamp(1.75rem, 2.6vw, 2.375rem)" }}>
                                          <AnimatedMetric value={m.value} />
                                        </p>
                                        <p className="text-[15.5px] font-semibold text-zinc-900 leading-snug">{lead}</p>
                                        {rest.length > 0 && (
                                          <p className="text-[14.5px] text-zinc-600 leading-relaxed mt-1 first-letter:uppercase">{rest.join(" — ")}</p>
                                        )}
                                      </Reveal>
                                    </div>
                                  );
                                })}
                              </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {project.resultsNote && outcomes.length === 0 && (
                        <div className="mt-10 rounded-2xl bg-[#8B5CF6]/[0.07] px-7 py-6">
                          <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] uppercase text-[#7c3aed] mb-2.5"><BriefcaseBusiness size={15} aria-hidden="true" />What changed for the business</p>
                          <p className="text-[17px] text-zinc-900 leading-relaxed max-w-3xl">{project.resultsNote}</p>
                        </div>
                      )}
                    </Section>
                  </Reveal>
                )}

                {/* THE THINKING — why the approach worked. One short line up top, then the reasons, numbered. */}
                {thinking && (
                  <Reveal>
                    <section
                      id="section-the-thinking"
                      aria-labelledby="section-the-thinking-heading"
                      className="relative overflow-hidden rounded-3xl bg-zinc-950 px-7 py-12 md:px-14 md:py-16 scroll-mt-28"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(50% 70% at 100% 0%, rgba(139,92,246,0.28), transparent 70%)" }}
                      />
                      <div className="relative">
                        <h2 id="section-the-thinking-heading" className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] uppercase text-[#c4b5fd] mb-6">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6]/25"><Lightbulb size={17} aria-hidden="true" /></span>
                          Why it worked
                        </h2>
                        <p
                          className="font-bold text-white leading-[1.12] tracking-tight text-balance max-w-3xl"
                          style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)", letterSpacing: "-0.03em" }}
                        >
                          {thinking.lead}
                        </p>
                        {thinking.reasons.length > 0 && (
                          // The reasons as a plain numbered list: one column, so a long reason never leaves a short one stranded.
                          <ol className="mt-10 max-w-3xl space-y-7">
                            {thinking.reasons.map((reason, ri) => (
                              <li key={ri} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
                                <span className="pt-[3px] text-[14px] font-bold text-[#c4b5fd] tabular-nums">{String(ri + 1).padStart(2, "0")}</span>
                                <p className="text-[16.5px] text-zinc-300 leading-relaxed">{reason}</p>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    </section>
                  </Reveal>
                )}

              </>
            )}

          </div>
        </div>
      </div>

      {/* ── Project navigation ───────────────────────────────────────────────── */}
      {(prevProject || nextProject) && (
        <nav aria-label="Case study navigation" className="border-t border-zinc-200 bg-zinc-50">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
            <div className="flex items-stretch justify-between gap-4">

              {/* Previous */}
              {prevProject ? (
                <Link
                  href={`/work/${prevProject.slug}`}
                  className="group flex items-center gap-3 min-w-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                    className="shrink-0 text-zinc-400 group-hover:text-[#8B5CF6] transition-colors duration-150">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-1">Previous</p>
                    <p className="text-[14px] font-semibold text-zinc-900 group-hover:text-[#8B5CF6] transition-colors duration-150 truncate">
                      {prevProject.name}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {/* Next */}
              {nextProject && (
                <Link
                  href={`/work/${nextProject.slug}`}
                  className="group flex items-center gap-3 text-right min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-1">Next</p>
                    <p className="text-[14px] font-semibold text-zinc-900 group-hover:text-[#8B5CF6] transition-colors duration-150 truncate">
                      {nextProject.name}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                    className="shrink-0 text-zinc-400 group-hover:text-[#8B5CF6] transition-colors duration-150">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

/** One chapter: its name in a narrow left column (it stays in view while the chapter scrolls), the content on the right. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const Icon = CHAPTER_ICONS[title] ?? FileText;
  return (
    <section
      id={`section-${slug}`}
      aria-labelledby={`section-${slug}-heading`}
      className="grid lg:grid-cols-[200px_minmax(0,1fr)] gap-x-10 gap-y-5 border-t border-zinc-200 pt-10 scroll-mt-28"
    >
      <h2
        id={`section-${slug}-heading`}
        className="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em] uppercase text-[#8B5CF6] lg:sticky lg:top-28 lg:self-start lg:pt-1"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/10"><Icon size={16} aria-hidden="true" /></span>
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Large editorial headline used inside sections */
function EditorialHeadline({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-bold text-zinc-950 mb-9 leading-[1.12] tracking-tight text-balance max-w-3xl"
      style={{ fontSize: "clamp(1.75rem, 3vw, 2.375rem)", letterSpacing: "-0.025em" }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[14.5px] text-zinc-600 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-bold tracking-[0.14em] uppercase text-zinc-500 mb-1">{label}</dt>
      <dd className="text-[14.5px] text-zinc-900 font-medium leading-snug">{value}</dd>
    </div>
  );
}
