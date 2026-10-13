import type { Metadata } from "next";
import Link from "next/link";
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

interface Props {
  params: Promise<{ slug: string }>;
}

const DEFAULT_THEME = { bg: "#f4f4f5", dark: false };

/* Images only show where one has been uploaded: no placeholder frames, and
   no borrowing a gallery screenshot for an empty slot. */
function buildSlides(project: Project): SliderImage[] {
  return (project.images ?? []).map((src, i) => {
    const label = project.imageLabels?.[i] ?? `Screen ${i + 1}`;
    return { src, label, alt: `${project.name} — ${label}` };
  });
}

const DASHED_LINE = "repeating-linear-gradient(to bottom, #e4e4e7 0, #e4e4e7 4px, transparent 4px, transparent 9px)";

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

  const isRich = Boolean(
    project.heroMetrics ||
      project.problemSections?.length ||
      project.userResearch ||
      project.competitiveAnalysis ||
      project.wireframes ||
      project.userFlow ||
      project.transformationSections?.length ||
      project.executionDisciplines?.length ||
      project.deliverables?.length ||
      project.whyItWorked?.length ||
      project.takeaway,
  );

  const chapters: Chapter[] = isRich
    ? [
        ...(project.problemSections?.length        ? [{ label: "Overview",       id: "section-the-problem"                  }] : []),
        ...(project.transformationSections?.length ? [{ label: "Transformation",  id: "section-the-transformation"           }] : []),
        ...(project.executionDisciplines?.length   ? [{ label: "Execution",       id: "section-execution"                    }] : []),
        ...((project.resultGroups?.length || project.heroMetrics?.length)
                                                   ? [{ label: "Results",         id: "section-final-results"                }] : []),
        ...(project.performanceAudit               ? [{ label: "Performance",     id: "section-technical-performance-audit"  }] : []),
        ...(project.whyItWorked?.length            ? [{ label: "Why It Worked",   id: "section-why-it-worked"                }] : []),
        ...(project.takeaway                       ? [{ label: "Takeaway",        id: "section-takeaway"                     }] : []),
      ]
    : [];

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />
      {chapters.length >= 2 && <CaseStudyChapterNav chapters={chapters} />}

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-zinc-950 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-32 pb-20 relative z-10">

          <Reveal>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-zinc-600 mb-14">
              <Link href="/work" className="hover:text-zinc-400 transition-colors duration-150">Work</Link>
              <span aria-hidden="true" className="text-zinc-700">/</span>
              <span className="text-zinc-500">{project.name}</span>
            </nav>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="font-extrabold text-white tracking-tight mb-7 leading-[0.93]"
              style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)", letterSpacing: "-0.04em" }}
            >
              {project.name}
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-[17px] text-zinc-400 max-w-xl leading-relaxed mb-14">
              {project.shortDescription}
            </p>
          </Reveal>

          {project.heroMetrics && (
            <div className="flex flex-wrap gap-10 md:gap-16 pt-2">
              {project.heroMetrics.map((m, i) => (
                <Reveal key={m.label} delay={160 + i * 100}>
                  <div>
                    <p className="font-bold text-white leading-none tracking-tight"
                       style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}>
                      <AnimatedMetric value={m.value} />
                    </p>
                    <p className="text-[12px] text-zinc-500 mt-2 max-w-[180px] leading-snug">{m.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
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
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid lg:grid-cols-[1fr_210px] gap-16 lg:gap-20">

          {/* Main content */}
          <div className="space-y-28 md:space-y-36">

            {/* ── Generic layout ── */}
            {!isRich && (
              <>
                <Reveal>
                  <Section title="Overview">
                    <p className="text-[15px] text-zinc-600 leading-relaxed">{project.shortDescription}</p>
                  </Section>
                </Reveal>
                <Reveal>
                  <Section title="Challenge">
                    <p className="text-[15px] text-zinc-600 leading-relaxed">{project.challenge}</p>
                  </Section>
                </Reveal>
                <Reveal>
                  <Section title="Approach">
                    <p className="text-[15px] text-zinc-600 leading-relaxed">{project.approach}</p>
                  </Section>
                </Reveal>
                <Reveal>
                  <Section title="Key Contributions">
                    <BulletList items={project.highlights} />
                  </Section>
                </Reveal>
                <Reveal>
                  <Section title="Outcome">
                    <p className="text-[15px] text-zinc-600 leading-relaxed">{project.outcome}</p>
                  </Section>
                </Reveal>
                {project.accessibility && (
                  <Reveal>
                    <Section title="Accessibility">
                      <p className="text-[15px] text-zinc-600 leading-relaxed">{project.accessibility}</p>
                    </Section>
                  </Reveal>
                )}
                {(project.performance || project.seo) && (
                  <Reveal>
                    <Section title="Performance & SEO">
                      {project.performance && <p className="text-[15px] text-zinc-600 leading-relaxed mb-3">{project.performance}</p>}
                      {project.seo && <p className="text-[15px] text-zinc-600 leading-relaxed">{project.seo}</p>}
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
                    <Section title="The Problem">
                      <EditorialHeadline>{ps.title}</EditorialHeadline>
                      {project.problemIntro && (
                        <p className="text-[15px] text-zinc-500 leading-relaxed mb-10 max-w-xl">
                          {project.problemIntro}
                        </p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-9">
                        {ps.bullets.map((b, bi) => (
                          <Reveal key={b.heading} delay={bi * 80}>
                            <div>
                              <p className="text-[14px] font-semibold text-zinc-900 mb-1.5">{b.heading}</p>
                              <p className="text-[13.5px] text-zinc-500 leading-relaxed">{b.body}</p>
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

                {/* COMPETITIVE ANALYSIS */}
                {project.competitiveAnalysis && (
                  <Reveal>
                    <Section title="Competitive Analysis">
                      <EditorialHeadline>
                        {project.competitiveAnalysis.headline ?? "Benchmarking existing market applications."}
                      </EditorialHeadline>
                      {project.competitiveAnalysis.intro && (
                        <p className="text-[15px] text-zinc-500 leading-relaxed mb-8">{project.competitiveAnalysis.intro}</p>
                      )}
                      <div className="flex flex-wrap gap-2.5 mb-8">
                        {project.competitiveAnalysis.competitors.map((c) => (
                          <div key={c.name} className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-[13px] font-medium text-zinc-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span>{c.name}</span>
                            {c.note && <span className="text-[11px] text-zinc-400 font-normal">({c.note})</span>}
                          </div>
                        ))}
                      </div>
                      {project.competitiveAnalysis.takeaway && (
                        <p className="text-[14.5px] text-zinc-700 leading-relaxed pl-5 border-l-2 border-zinc-200">
                          <strong className="font-semibold text-zinc-900">Key insight: </strong>
                          {project.competitiveAnalysis.takeaway}
                        </p>
                      )}
                    </Section>
                  </Reveal>
                )}

                {/* USER RESEARCH */}
                {project.userResearch && (
                  <Reveal>
                    <Section title="User Research & Feedback">
                      <EditorialHeadline>
                        {project.userResearch.headline ?? "Identifying pain points from real user reviews."}
                      </EditorialHeadline>
                      {project.userResearch.intro && (
                        <p className="text-[15px] text-zinc-500 leading-relaxed mb-8">{project.userResearch.intro}</p>
                      )}
                      {project.userResearch.ratingMetrics && (
                        <div className="flex flex-wrap gap-4 mb-8">
                          {project.userResearch.ratingMetrics.map((rm) => (
                            <div key={rm.label} className="px-4 py-3 rounded-xl bg-zinc-900 text-white flex items-center gap-3">
                              <span className="text-[1.15rem] font-bold text-amber-400">★ {rm.value}</span>
                              <span className="text-[12px] font-medium text-zinc-300">{rm.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {project.userResearch.painPoints && (
                        <div className="mb-8">
                          {project.userResearch.painPoints.map((pp, idx) => (
                            <div key={idx} className="flex items-start gap-4 py-4 border-b border-zinc-100 last:border-0 text-[13.5px] text-zinc-700">
                              <span className="text-zinc-300 font-mono text-[11px] mt-0.5 shrink-0 tabular-nums">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span>{pp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {project.userResearch.reviews && (
                        <div className="grid sm:grid-cols-2 gap-6 mt-6">
                          {project.userResearch.reviews.map((r, idx) => (
                            <div key={idx} className="pt-5 border-t border-zinc-100">
                              <div className="flex text-amber-400 text-[12px] gap-0.5 mb-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span key={i}>{i < (r.rating ?? 5) ? "★" : "☆"}</span>
                                ))}
                              </div>
                              <p className="text-[13.5px] text-zinc-700 leading-relaxed italic mb-3">&ldquo;{r.text}&rdquo;</p>
                              {r.source && <p className="text-[11px] font-semibold text-zinc-400">{r.source}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>
                  </Reveal>
                )}

                {/* WIREFRAMES */}
                {project.wireframes && (
                  <Reveal>
                    <Section title="Wireframes & Iterations">
                      <EditorialHeadline>
                        {project.wireframes.headline ?? "Sketching, information architecture & iterations."}
                      </EditorialHeadline>
                      {project.wireframes.intro && (
                        <p className="text-[15px] text-zinc-500 leading-relaxed mb-8">{project.wireframes.intro}</p>
                      )}
                      {project.wireframes.sketches && (
                        <div className="grid sm:grid-cols-2 gap-5">
                          {project.wireframes.sketches.map((s, idx) => (
                            <div key={idx} className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
                              {s.image && (
                                <div className="aspect-[4/3] bg-zinc-100 overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="p-4">
                                <p className="text-[13.5px] font-semibold text-zinc-900 mb-1">{s.title}</p>
                                {s.note && <p className="text-[12.5px] text-zinc-500 leading-snug">{s.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>
                  </Reveal>
                )}

                {/* USER FLOW */}
                {project.userFlow && (
                  <Reveal>
                    <Section title="User Flow & Architecture">
                      <EditorialHeadline>{project.userFlow.title}</EditorialHeadline>
                      {project.userFlow.description && (
                        <p className="text-[15px] text-zinc-500 leading-relaxed mb-10">{project.userFlow.description}</p>
                      )}
                      <div className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          {project.userFlow.steps.map((st, idx) => (
                            <div key={idx} className="flex-1 w-full flex flex-col items-center text-center group">
                              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-[12px] font-mono font-bold text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                                0{idx + 1}
                              </div>
                              <p className="text-[13.5px] font-semibold text-white mb-1">{st.step}</p>
                              {st.description && (
                                <p className="text-[11.5px] text-zinc-400 leading-tight max-w-[160px]">{st.description}</p>
                              )}
                              {idx < project.userFlow!.steps.length - 1 && (
                                <div className="hidden md:block w-full h-px bg-zinc-800 my-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Section>
                  </Reveal>
                )}

                {/* THE TRANSFORMATION — vertical numbered timeline */}
                {project.transformationSections && project.transformationSections.length > 0 && (
                  <Reveal>
                    <Section title="The Transformation">
                      <EditorialHeadline>
                        {project.transformationHeadline ?? "What changed."}
                      </EditorialHeadline>
                      <ProcessTimeline>
                        {project.transformationSections.map((ts, i) => {
                          const isLast = i === project.transformationSections!.length - 1;
                          return (
                            <Reveal key={ts.title}>
                              <div data-step className="flex gap-7 md:gap-9">
                                {/* Number + connecting line */}
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
                                {/* Content */}
                                <div className={isLast ? "pb-0 flex-1" : "pb-14 flex-1"}>
                                  <h3 className="text-[12px] font-bold tracking-[0.12em] uppercase text-zinc-600 mb-7 pt-0.5">
                                    {ts.title}
                                  </h3>
                                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                                    {ts.bullets.map((b, bi) => (
                                      <Reveal key={b.heading} delay={bi * 55}>
                                        <div>
                                          <p className="text-[14px] font-semibold text-zinc-900 mb-1.5">{b.heading}</p>
                                          {b.body && <p className="text-[13px] text-zinc-500 leading-relaxed">{b.body}</p>}
                                        </div>
                                      </Reveal>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Reveal>
                          );
                        })}
                      </ProcessTimeline>
                    </Section>
                  </Reveal>
                )}

                {/* EXECUTION — same vertical timeline pattern */}
                {project.executionDisciplines && project.executionDisciplines.length > 0 && (
                  <Reveal>
                    <Section title="Execution">
                      <EditorialHeadline>
                        {project.executionHeadline ?? "How it was delivered."}
                      </EditorialHeadline>
                      <ProcessTimeline>
                        {project.executionDisciplines.map((d, i) => {
                          const isLast = i === project.executionDisciplines!.length - 1;
                          return (
                            <Reveal key={d.name}>
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
                                <div className={isLast ? "pb-0 flex-1" : "pb-16 flex-1"}>
                                  <h3 className="text-[12px] font-bold tracking-[0.12em] uppercase text-zinc-600 mb-6 pt-0.5">
                                    {d.name}
                                  </h3>
                                  <ul className="flex flex-wrap gap-2 mb-7" aria-label={`${d.name} deliverables`}>
                                    {d.items.map((item, ii) => (
                                      <Reveal key={item} delay={ii * 40}>
                                        <li className="text-[12.5px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-1.5 hover:bg-zinc-100 transition-colors duration-150">
                                          {item}
                                        </li>
                                      </Reveal>
                                    ))}
                                  </ul>
                                  {d.image && (
                                    <CaseStudyImage
                                      label={d.name}
                                      caption={d.visual}
                                      src={d.image}
                                      alt={`${project.name} — ${d.name}`}
                                      bg={theme.bg}
                                      dark={theme.dark}
                                      aspect="aspect-[1000/544]"
                                    />
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
                {(project.resultGroups?.length || project.heroMetrics?.length) && (
                  <Reveal>
                    <Section title="Final Results">
                      <EditorialHeadline>
                        {project.resultsHeadline ?? "The outcome."}
                      </EditorialHeadline>
                      {project.resultGroups?.length ? (
                        <div className="space-y-14">
                          {project.resultGroups.map((g) => (
                            <div key={g.label}>
                              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8B5CF6] mb-8">
                                {g.label}
                              </p>
                              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
                                {g.metrics.map((m, mi) => (
                                  <Reveal key={m.label} delay={mi * 80}>
                                    <div>
                                      <p className="font-bold text-zinc-900 leading-none tracking-tight mb-2"
                                         style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                                        <AnimatedMetric value={m.value} />
                                      </p>
                                      <p className="text-[13px] text-zinc-500 leading-relaxed">{m.label}</p>
                                    </div>
                                  </Reveal>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
                          {project.heroMetrics?.map((m, mi) => (
                            <Reveal key={m.label} delay={mi * 80}>
                              <div>
                                <p className="font-bold text-zinc-900 leading-none tracking-tight mb-2"
                                   style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                                  <AnimatedMetric value={m.value} />
                                </p>
                                <p className="text-[13px] text-zinc-500">{m.label}</p>
                              </div>
                            </Reveal>
                          ))}
                        </div>
                      )}
                      {project.resultsNote && (
                        <p className="text-[14px] text-zinc-500 leading-relaxed mt-10 pl-5 border-l-2 border-zinc-200">
                          {project.resultsNote}
                        </p>
                      )}
                      {project.compare?.beforeImage && project.compare.afterImage && (
                        <div className="mt-12">
                          <BeforeAfterSlider
                            beforeImage={project.compare.beforeImage}
                            afterImage={project.compare.afterImage}
                            beforeLabel={project.compare.beforeLabel}
                            afterLabel={project.compare.afterLabel}
                            caption={project.compare.caption}
                            bg={theme.bg}
                          />
                        </div>
                      )}
                    </Section>
                  </Reveal>
                )}

                {/* WHAT WAS BUILT */}
                {project.deliverables && project.deliverables.length > 0 && (
                  <Reveal>
                    <Section title="What Was Built">
                      {project.deliverablesHeadline && (
                        <EditorialHeadline>{project.deliverablesHeadline}</EditorialHeadline>
                      )}
                      <div className="space-y-8">
                        {project.deliverables.map((d) => (
                          <div key={d.label}>
                            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-4">{d.label}</p>
                            <ul className="space-y-2.5">
                              {d.items.map((item) => (
                                <li key={item} className="flex gap-3 text-[14px] text-zinc-600 leading-relaxed">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-1 shrink-0 text-zinc-400">
                                    <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </Reveal>
                )}

                {/* TECHNICAL PERFORMANCE */}
                {project.performanceAudit && (
                  <Reveal>
                    <Section title="Technical Performance Audit">
                      <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50">
                              <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-zinc-400">Metric</th>
                              <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-zinc-400">Before</th>
                              <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-zinc-400">After</th>
                              <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-zinc-400">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {project.performanceAudit.map((row) => (
                              <tr key={row.metric} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-5 py-3.5 text-[13.5px] font-medium text-zinc-800">{row.metric}</td>
                                <td className="px-5 py-3.5 text-[13px] text-zinc-400">{row.before}</td>
                                <td className="px-5 py-3.5 text-[13.5px] font-semibold text-zinc-900">{row.after}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    row.status === "Fast" || row.status === "Excellent"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : row.status === "Stable"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Section>
                  </Reveal>
                )}

                {/* WHY IT WORKED */}
                {project.whyItWorked && project.whyItWorked.length > 0 && (
                  <Reveal>
                    <Section title="Why it Worked">
                      <div className="space-y-5 max-w-2xl">
                        {project.whyItWorked.map((para, i) => (
                          <p key={i} className={
                            i === 0
                              ? "text-[17px] text-zinc-800 leading-relaxed font-medium"
                              : "text-[15px] text-zinc-600 leading-relaxed"
                          }>
                            {para}
                          </p>
                        ))}
                      </div>
                    </Section>
                  </Reveal>
                )}

                {/* TAKEAWAY — full-bleed dark editorial close */}
                {project.takeaway && (
                  <Reveal>
                    <div id="section-takeaway">
                      {/* Break out of the content column with negative margins */}
                      <div className="bg-zinc-950 rounded-2xl px-8 py-14 md:px-14 md:py-20 relative overflow-hidden">

                        {/* Large ghosted quote mark — decorative */}
                        <div
                          aria-hidden="true"
                          className="absolute -top-6 -left-2 font-serif text-white/[0.04] leading-none select-none pointer-events-none"
                          style={{ fontSize: "clamp(10rem, 22vw, 18rem)", lineHeight: 1 }}
                        >
                          &ldquo;
                        </div>

                        {/* Label */}
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c4b5fd] mb-8 relative z-10">
                          Key Takeaway
                        </p>

                        {/* Quote */}
                        <blockquote
                          className="font-extrabold text-white leading-[1.08] tracking-tight relative z-10"
                          style={{ fontSize: "clamp(1.65rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
                        >
                          {project.takeaway}
                        </blockquote>

                        {/* Rule + attribution */}
                        <div className="flex items-center gap-4 mt-10 relative z-10">
                          <div className="w-6 h-px bg-zinc-700" />
                          <p className="text-[12px] font-medium text-zinc-500">{project.name}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                )}
              </>
            )}

          </div>

          {/* ── Sidebar — flat, no card borders ── */}
          <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#8B5CF6] mb-5">
                Details
              </h3>
              <dl className="space-y-5">
                <DetailRow label="Role" value={project.role} />
                <DetailRow label="Category" value={project.category} />
                <DetailRow label="Year" value={project.year} />
                {project.client && <DetailRow label="Client" value={project.client} />}
                {project.engineeringStack && <DetailRow label="Stack" value={project.engineeringStack} />}
                {project.typography && <DetailRow label="Typography" value={project.typography} />}
              </dl>
            </div>

            <div className="border-t border-zinc-100 pt-8">
              <h3 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-400 mb-4">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.liveUrl && (
              <div className="border-t border-zinc-100 pt-8">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-zinc-900 hover:text-zinc-500 flex items-center gap-1.5 transition-colors duration-150"
                >
                  Visit site
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            )}
          </aside>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <section id={`section-${slug}`} aria-labelledby={`section-${slug}-heading`}>
      <h2
        id={`section-${slug}-heading`}
        className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8B5CF6] mb-7"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Large editorial headline used inside sections */
function EditorialHeadline({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-semibold text-zinc-900 mb-6 leading-tight tracking-tight"
      style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.875rem)" }}
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
      <dt className="text-[11px] font-medium text-zinc-400 mb-0.5">{label}</dt>
      <dd className="text-[13.5px] text-zinc-700 font-medium">{value}</dd>
    </div>
  );
}
