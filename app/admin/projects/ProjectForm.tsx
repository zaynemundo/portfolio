"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "../../generated/prisma/client";
import { ImageUpload } from "./ImageUpload";
import { TagInput } from "./TagInput";
import { LogoUpload } from "./LogoUpload";
import { SingleImageUpload } from "./SingleImageUpload";

interface Props {
  project?: Project | null;
  action: (data: FormData) => Promise<void>;
}

const input = "w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors";
const label = "block text-[12px] font-semibold text-zinc-600 mb-1.5";
const hint  = "text-[11px] text-zinc-400 mt-1";
const card  = "bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5";
const cardTitle = "text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]";

/* ── Presets ─────────────────────────────────────────────────────────────── */
const ROLE_PRESETS = [
  "Visual Design", "UX Design", "Frontend Development", "Backend Development",
  "Product Design", "Brand Design", "Email Marketing", "Analytics", "SEO",
  "Bilingual Build", "WordPress Development", "Shopify Development",
  "Deployment & Infrastructure", "Project Management", "Motion Design",
];

const CATEGORY_PRESETS = [
  "Real Estate", "E-commerce", "Healthcare", "Technology", "Hospitality",
  "Sports Tech", "Art & Culture", "Finance", "SaaS", "Retail", "Government",
];

const TOOLKIT_PRESETS = [
  "WordPress", "Shopify", "React", "Vue.js", "Laravel", "Next.js",
  "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Figma",
  "Adobe Creative Suite", "VS Code", "GA4", "Liquid", "WooCommerce",
  "PHP", "Node.js", "Webflow", "Adobe XD",
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function parseRich(json?: string | null): Record<string, unknown> {
  if (!json) return {};
  try { return JSON.parse(json) as Record<string, unknown>; } catch { return {}; }
}

/* ── Form ─────────────────────────────────────────────────────────────────── */
export function ProjectForm({ project, action }: Props) {
  const isNew = !project;
  const [slug, setSlug] = useState(project?.slug ?? "");

  const rich        = parseRich(project?.richContentJson);
  const richMetrics = (rich.heroMetrics as { value: string; label: string }[]) ?? [];
  const richProbSec = Array.isArray(rich.problemSections)
    ? (rich.problemSections as { title: string; bullets: { heading: string; body: string }[] }[])[0]
    : null;
  /* `compareSection` is the legacy key — read both so older records still load. */
  const richCompare = (rich.compare ?? rich.compareSection) as
    {
      beforeLabel?: string; afterLabel?: string; caption?: string;
      beforeImage?: string; afterImage?: string;
    } | undefined;
  const richTransf   = Array.isArray(rich.transformationSections)
    ? (rich.transformationSections as { title: string; bullets: { heading: string; body: string }[] }[])
        .map((s) => `# ${s.title}\n${s.bullets.map((b) => `${b.heading} | ${b.body}`).join("\n")}`).join("\n\n")
    : "";
  const richExec     = Array.isArray(rich.executionDisciplines)
    ? (rich.executionDisciplines as { name: string; items: string[]; visual?: string }[])
        .map((d) => {
          const items = d.items.map((i) => `- ${i}`).join("\n");
          return `# ${d.name}\n${items}${d.visual ? `\n> ${d.visual}` : ""}`;
        }).join("\n\n")
    : "";
  const richAudit    = Array.isArray(rich.performanceAudit)
    ? (rich.performanceAudit as { metric: string; before: string; after: string; status: string }[])
        .map((r) => `${r.metric} | ${r.before} | ${r.after} | ${r.status}`).join("\n")
    : "";

  /* "# Group" blocks of "Value | Meaning" — used by metric groups and results */
  const groupsToText = (val: unknown) =>
    Array.isArray(val)
      ? (val as { label: string; metrics: { value: string; label: string }[] }[])
          .map((g) => `# ${g.label}\n${g.metrics.map((m) => `${m.value} | ${m.label}`).join("\n")}`)
          .join("\n\n")
      : "";
  const richMetricGroups = groupsToText(rich.metricGroups);
  const richResultGroups = groupsToText(rich.resultGroups);
  const richDeliverables = Array.isArray(rich.deliverables)
    ? (rich.deliverables as { label: string; items: string[] }[])
        .map((d) => `# ${d.label}\n${d.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")
    : "";
  /* Stored as paragraphs; the textarea edits them as blank-line-separated text. */
  const richWhy = Array.isArray(rich.whyItWorked)
    ? (rich.whyItWorked as string[]).join("\n\n")
    : ((rich.whyItWorked as string) ?? "");
  const richTheme = rich.theme as { bg?: string; dark?: boolean } | undefined;
  const richLogo  = rich.logo as { src?: string; initials?: string; bg?: string; light?: boolean } | undefined;
  /* Quick-pick swatches for the per-slot image pickers below. */
  const imageOptions = project?.images ?? [];

  // Parse role/category tags (stored as "A · B · C")
  const roleTags     = project?.role?.split(" · ").map((s) => s.trim()).filter(Boolean) ?? [];
  const categoryTags = project?.category?.split(" · ").map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <form action={action} className="space-y-6">

      {/* ── 1. Basic info ──────────────────────────────────────────────────── */}
      <div className={card}>
        <p className={cardTitle}>Basic info</p>

        <div>
          <label className={label}>Project name <span className="text-red-500">*</span></label>
          <input
            name="name"
            type="text"
            required
            defaultValue={project?.name}
            onChange={(e) => isNew && setSlug(toSlug(e.target.value))}
            className={input}
            placeholder="Nuraya Properties"
          />
        </div>

        <div>
          <label className={label}>Slug (auto-generated, editable)</label>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${input} font-mono text-[12px]`}
            placeholder="nuraya-properties"
          />
          <p className={hint}>Used in the URL: /projects/<strong>{slug || "project-slug"}</strong></p>
        </div>

        <div>
          <label className={label}>Tagline <span className="text-red-500">*</span></label>
          <input name="tagline" type="text" required defaultValue={project?.tagline} className={input}
            placeholder="Built to establish presence, not just fill a page." />
        </div>

        <div>
          <label className={label}>Short description <span className="text-red-500">*</span></label>
          <textarea name="shortDescription" required rows={3} defaultValue={project?.shortDescription}
            className={`${input} resize-y`}
            placeholder="2–3 sentences shown on the project card and listing page." />
        </div>
      </div>

      {/* ── 2. Project details ─────────────────────────────────────────────── */}
      <div className={card}>
        <p className={cardTitle}>Project details</p>

        <TagInput
          name="role"
          label="My role on this project"
          defaultValues={roleTags}
          presets={ROLE_PRESETS}
          hint="Pick all that apply, or type a custom one."
        />

        <TagInput
          name="category"
          label="Project category / industry"
          defaultValues={categoryTags}
          presets={CATEGORY_PRESETS}
        />

        <TagInput
          name="technologies"
          label="Toolkit (tools & technologies used)"
          defaultValues={project?.technologies ?? []}
          presets={TOOLKIT_PRESETS}
          hint="Everything you used to build this — software, frameworks, platforms."
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Project year <span className="text-red-500">*</span></label>
            <input name="year" type="text" required defaultValue={project?.year} className={input}
              placeholder="2024  or  2024–2025" />
            <p className={hint}>Year delivered (or range if multi-year)</p>
          </div>
          <div>
            <label className={label}>Live URL</label>
            <input name="liveUrl" type="url" defaultValue={project?.liveUrl ?? ""} className={input}
              placeholder="https://example.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Work type</label>
            <select name="workType" defaultValue={project?.workType ?? "Freelance"} className={input}>
              <option value="Freelance">Freelance</option>
              <option value="Full-time">Full-time</option>
              <option value="Personal Project">Personal Project</option>
            </select>
            <p className={hint}>How this work was engaged — used to group your portfolio.</p>
          </div>
          <div>
            <label className={label}>Status</label>
            <select name="published" defaultValue={project?.published === false ? "false" : "true"} className={input}>
              <option value="true">Published — visible on site</option>
              <option value="false">Draft — hidden from public</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Images ──────────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Project images</p>
          <p className={hint} style={{ marginTop: 4 }}>
            Upload as many screenshots as you like — the case study slider shows all of them. First image is the cover on cards.
          </p>
        </div>
        <ImageUpload
          defaultImages={project?.images ?? []}
          defaultLabels={(rich.imageLabels as string[]) ?? []}
        />

        <div className="pt-1">
          <p className={cardTitle} style={{ marginBottom: 4 }}>Client logo</p>
          <p className={hint} style={{ marginBottom: 10 }}>
            Shown on project cards and the &ldquo;A track record of&rdquo; tiles. Without a logo file, the initials tile is used.
          </p>
          <LogoUpload
            defaultSrc={richLogo?.src ?? ""}
            defaultInitials={richLogo?.initials ?? ""}
            defaultBg={richLogo?.bg ?? ""}
            defaultLight={richLogo?.light ?? false}
            fallbackInitials={(project?.name ?? "").slice(0, 2).toUpperCase()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className={label}>Accent colour</label>
            <div className="flex items-center gap-2">
              <input name="rich_themeBg" type="text" className={`${input} font-mono text-[12px]`}
                defaultValue={richTheme?.bg ?? ""}
                placeholder="#dceef8" />
            </div>
            <p className={hint}>Tints the image placeholders and this project&rsquo;s card.</p>
          </div>
          <div>
            <label className={label}>Accent is dark</label>
            <select name="rich_themeDark" defaultValue={richTheme?.dark ? "true" : "false"} className={input}>
              <option value="false">Light — use dark text</option>
              <option value="true">Dark — use light text</option>
            </select>
            <p className={hint}>Switches placeholder text to stay readable.</p>
          </div>
        </div>
      </div>

      {/* ── 4. Key numbers ─────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Key numbers</p>
          <p className={hint} style={{ marginTop: 4 }}>Up to 3 headline stats shown large in the case study header.</p>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[120px_1fr] gap-3">
              <div>
                {i === 0 && <p className="text-[10px] text-zinc-400 mb-1">Number / value</p>}
                <input name={`rich_metric_value_${i}`} type="text" className={input}
                  defaultValue={richMetrics[i]?.value ?? ""}
                  placeholder={["+117%", "15K", "5+"][i]} />
              </div>
              <div>
                {i === 0 && <p className="text-[10px] text-zinc-400 mb-1">What it means</p>}
                <input name={`rich_metric_label_${i}`} type="text" className={input}
                  defaultValue={richMetrics[i]?.label ?? ""}
                  placeholder={["User engagement", "Organic sessions/month", "Countries reached"][i]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4b. Supporting stats ───────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Supporting stats</p>
          <p className={hint} style={{ marginTop: 4 }}>Extra stat clusters shown under the key numbers, grouped by label.</p>
        </div>
        <div>
          <textarea name="rich_metricGroups" defaultValue={richMetricGroups} rows={8}
            className={`${input} resize-y font-mono text-[12px]`}
            placeholder={"# Reach & Discovery\n5+ | Countries — UAE, France, US, UK, Poland\n+50% | Organic search sessions, zero paid\n\n# Brand & Social\n1,760 | Instagram followers"} />
          <p className={hint}>
            <code className="bg-zinc-100 px-1 rounded font-mono"># Group label</code>
            {" "}— then one line per stat: <code className="bg-zinc-100 px-1 rounded font-mono">Value | What it means</code>
          </p>
        </div>
      </div>

      {/* ── 4c. Context ────────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Context</p>
          <p className={hint} style={{ marginTop: 4 }}>Optional details shown in the case study sidebar.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Client</label>
            <input name="rich_client" type="text" className={input}
              defaultValue={(rich.client as string) ?? ""}
              placeholder="P&O Marinas — A DP World Company" />
          </div>
          <div>
            <label className={label}>Typography</label>
            <input name="rich_typography" type="text" className={input}
              defaultValue={(rich.typography as string) ?? ""}
              placeholder="Aboreto (Display) · Inter (Body)" />
          </div>
        </div>
        <div>
          <label className={label}>Engineering stack</label>
          <input name="rich_engineeringStack" type="text" className={input}
            defaultValue={(rich.engineeringStack as string) ?? ""}
            placeholder="Laravel · Vue.js (Stateful Frontend) · Custom Backend API" />
        </div>
      </div>

      {/* ── 5. The Problem ─────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>The Problem</p>
          <p className={hint} style={{ marginTop: 4 }}>Describe what was broken, missing, or challenging before you started.</p>
        </div>

        <div>
          <label className={label}>Opening line</label>
          <input name="rich_problemTitle" defaultValue={richProbSec?.title ?? ""} type="text" className={input}
            placeholder="A logo, a brief, and an absolute infrastructure vacuum." />
          <p className={hint}>The short bold line shown under &ldquo;The Problem&rdquo; heading.</p>
        </div>

        <div>
          <label className={label}>Intro paragraph</label>
          <textarea name="rich_problemIntro" rows={3} className={`${input} resize-y`}
            defaultValue={(rich.problemIntro as string) ?? ""}
            placeholder="By 2025, the clinic's website suffered from critical technical and design debt that affected both users and search visibility." />
          <p className={hint}>Optional — sets up the bullet points below.</p>
        </div>

        <div>
          <label className={label}>Bullet points</label>
          <textarea name="rich_problemBullets" rows={5} className={`${input} resize-y`}
            defaultValue={richProbSec?.bullets.map((b) => `${b.heading} | ${b.body}`).join("\n") ?? ""}
            placeholder={"No Existing Platform | No website or codebase — everything started from zero.\nNo Brand System | Beyond a logo, nothing existed for typography or layout."} />
          <p className={hint}>One per line — <code className="bg-zinc-100 px-1 rounded font-mono">Bold heading | Supporting description</code></p>
        </div>
      </div>

      {/* ── 6. Compare ─────────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Compare — Before & After</p>
          <p className={hint} style={{ marginTop: 4 }}>Label for the before/after image comparison block.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Before label</label>
            <input name="rich_compareBeforeLabel" type="text" className={input}
              defaultValue={richCompare?.beforeLabel ?? ""}
              placeholder="Logo only — no digital presence" />
          </div>
          <div>
            <label className={label}>After label</label>
            <input name="rich_compareAfterLabel" type="text" className={input}
              defaultValue={richCompare?.afterLabel ?? ""}
              placeholder="Live homepage" />
          </div>
        </div>
        <div>
          <label className={label}>Caption</label>
          <input name="rich_compareCaption" type="text" className={input}
            defaultValue={richCompare?.caption ?? ""}
            placeholder="Drag to compare the 2021 site against the 2025 rebuild." />
          <p className={hint}>Fill either label to show the before/after image pair on the case study.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SingleImageUpload
            name="rich_compareBeforeImage"
            label="Before image"
            defaultValue={richCompare?.beforeImage ?? ""}
            options={imageOptions}
            hint="Leave empty to reuse a project image."
          />
          <SingleImageUpload
            name="rich_compareAfterImage"
            label="After image"
            defaultValue={richCompare?.afterImage ?? ""}
            options={imageOptions}
            hint="Leave empty to reuse a project image."
          />
        </div>
      </div>

      {/* ── 7. The Transformation ──────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>The Transformation</p>
          <p className={hint} style={{ marginTop: 4 }}>What you built and how. Each block starts with a label, then bullet points.</p>
        </div>
        <div>
          <label className={label}>Headline</label>
          <input name="rich_transformationHeadline" type="text" className={input}
            defaultValue={(rich.transformationHeadline as string) ?? ""}
            placeholder="What I changed." />
        </div>
        <div>
          <textarea name="rich_transformation" defaultValue={richTransf} rows={14}
            className={`${input} resize-y font-mono text-[12px]`}
            placeholder={"# Building a brand system from a logo\nVisual foundation | Used the logo as the base for typography and colour.\nMarket validation | Researched Dubai real estate platforms.\n\n# Bilingual architecture\nSingle install | English and French in one WordPress site.\nNatural switching | Language toggle in the navigation."} />
          <p className={hint}>
            <code className="bg-zinc-100 px-1 rounded font-mono"># Section label</code>
            {" "}— then one line per bullet: <code className="bg-zinc-100 px-1 rounded font-mono">Bold heading | Supporting description</code>. Blank line between sections.
          </p>
        </div>
      </div>

      {/* ── 8. Execution ───────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Execution</p>
          <p className={hint} style={{ marginTop: 4 }}>Break down what you delivered by discipline. Each block is a label + list of deliverables.</p>
        </div>
        <div>
          <label className={label}>Headline</label>
          <input name="rich_executionHeadline" type="text" className={input}
            defaultValue={(rich.executionHeadline as string) ?? ""}
            placeholder="Three disciplines. One system." />
        </div>
        <div>
          <textarea name="rich_execution" defaultValue={richExec} rows={12}
            className={`${input} resize-y font-mono text-[12px]`}
            placeholder={"# Visual Design\n- Brand interpretation\n- Typography system\n> Logo mark → colour palette → homepage UI\n! /case-studies/nuraya.jpg\n\n# Frontend Development\n- Custom WordPress theme\n- Responsive layouts\n> Desktop and mobile side by side"} />
          <p className={hint}>
            <code className="bg-zinc-100 px-1 rounded font-mono"># Discipline label</code>
            {" "}— then <code className="bg-zinc-100 px-1 rounded font-mono">- Deliverable</code> on each line, and an optional
            {" "}<code className="bg-zinc-100 px-1 rounded font-mono">&gt; caption</code> for the image,
            {" "}and <code className="bg-zinc-100 px-1 rounded font-mono">! /path/to/image.jpg</code> to pin a specific image to that block.
          </p>
        </div>
      </div>

      {/* ── 9. Final Results ───────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Final Results</p>
          <p className={hint} style={{ marginTop: 4 }}>The outcome numbers, grouped by theme.</p>
        </div>
        <div>
          <label className={label}>Headline</label>
          <input name="rich_resultsHeadline" type="text" className={input}
            defaultValue={(rich.resultsHeadline as string) ?? ""}
            placeholder="The site isn't just being found. It's converting." />
        </div>
        <div>
          <label className={label}>Result groups</label>
          <textarea name="rich_resultGroups" defaultValue={richResultGroups} rows={9}
            className={`${input} resize-y font-mono text-[12px]`}
            placeholder={"# Traffic & Engagement\n69 | Active users (+30%)\n273 | Events tracked (+54%)\n\n# Reach & Discovery\n5+ | Countries — UAE, France, US, UK, Poland"} />
          <p className={hint}>
            <code className="bg-zinc-100 px-1 rounded font-mono"># Group label</code>
            {" "}— then <code className="bg-zinc-100 px-1 rounded font-mono">Value | What it means</code> per line.
          </p>
        </div>
        <div>
          <label className={label}>Closing note</label>
          <textarea name="rich_resultsNote" rows={3} className={`${input} resize-y`}
            defaultValue={(rich.resultsNote as string) ?? ""}
            placeholder="The numbers are modest because the platform was new. What mattered was establishing measurable traction immediately." />
          <p className={hint}>Optional caveat or context shown under the result cards.</p>
        </div>

        <SingleImageUpload
          name="rich_resultsImage"
          label="Results image"
          defaultValue={(rich.resultsImage as string) ?? ""}
          options={imageOptions}
          hint="Analytics dashboard or outcome screenshot. Empty reuses a project image."
        />

        <div>
          <label className={label}>Results image caption</label>
          <input name="rich_resultsImageCaption" type="text" className={input}
            defaultValue={(rich.resultsImageCaption as string) ?? ""}
            placeholder="GA4 dashboard — organic traffic and conversion events" />
        </div>
      </div>

      {/* ── 9b. Before / After table ───────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Before / After table</p>
          <p className={hint} style={{ marginTop: 4 }}>Optional comparison table — performance audits, platform evolution, etc.</p>
        </div>
        <div>
          <textarea name="rich_audit" defaultValue={richAudit} rows={7}
            className={`${input} resize-y font-mono text-[12px]`}
            placeholder={"LCP | 11.1s | 0.6s | Fast\nCLS | Erratic | 0 | Stable\nPerformance Score | <50 | 80 | Improved\nSEO Score | Low | 92 | Excellent"} />
          <p className={hint}>
            One per line — <code className="bg-zinc-100 px-1 rounded font-mono">Metric | Before | After | Status</code>.
            {" "}Status <code className="bg-zinc-100 px-1 rounded font-mono">Fast</code>/<code className="bg-zinc-100 px-1 rounded font-mono">Excellent</code> shows green,
            {" "}<code className="bg-zinc-100 px-1 rounded font-mono">Stable</code> blue, anything else amber.
          </p>
        </div>
      </div>

      {/* ── 9c. What Was Built ─────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>What Was Built</p>
          <p className={hint} style={{ marginTop: 4 }}>A checklist of everything delivered. Use for platform or launch summaries.</p>
        </div>
        <div>
          <label className={label}>Headline</label>
          <input name="rich_deliverablesHeadline" type="text" className={input}
            defaultValue={(rich.deliverablesHeadline as string) ?? ""}
            placeholder="A complete brand and e-commerce platform — logo to live store." />
        </div>
        <div>
          <textarea name="rich_deliverables" defaultValue={richDeliverables} rows={9}
            className={`${input} resize-y font-mono text-[12px]`}
            placeholder={"# Brand Foundation\n- Logo designed from scratch\n- Complete visual identity system\n\n# E-commerce Platform\n- Shopify storefront launched\n- Product pages and checkout customised"} />
          <p className={hint}>
            <code className="bg-zinc-100 px-1 rounded font-mono"># Group label</code>
            {" "}— then <code className="bg-zinc-100 px-1 rounded font-mono">- Item</code> per line.
          </p>
        </div>
      </div>

      {/* ── 10. Why it Worked ──────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Why it Worked</p>
          <p className={hint} style={{ marginTop: 4 }}>The thinking behind the results. Leave a blank line between paragraphs.</p>
        </div>
        <textarea name="rich_whyItWorked" rows={8} className={`${input} resize-y`}
          defaultValue={richWhy}
          placeholder={"The challenge wasn't building a website. It was establishing credibility for a brand that had no digital presence.\n\nWhen users discover a real estate company for the first time, they make decisions quickly."} />
      </div>

      {/* ── 11. Takeaway ───────────────────────────────────────────────────── */}
      <div className={card}>
        <div>
          <p className={cardTitle}>Takeaway</p>
          <p className={hint} style={{ marginTop: 4 }}>One closing sentence shown as a pull quote at the end of the case study.</p>
        </div>
        <textarea name="rich_takeaway" rows={3} className={`${input} resize-y`}
          defaultValue={(rich.takeaway as string) ?? ""}
          placeholder="Starting with only a logo, I established Nuraya Properties' digital foundation…" />
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-10">
        <button type="submit"
          className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors shadow-sm">
          {project ? "Save changes" : "Add project"}
        </button>
        <Link href="/admin/projects" className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
