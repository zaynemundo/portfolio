"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "./motion/useReducedMotion";
import "./contact-section.css";

const ContactForm = dynamic(
  () => import("./ContactForm").then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => <div className="cs-form__skeleton min-h-[300px]" />,
  }
);

interface Props {
  email: string;
  phone?: string | null;
  linkedinUrl: string;
  githubUrl: string;
  cvPath: string;
}

/* ── Entrance timing constants ─────────────────────────────────────────────
 *
 *  ADJUST THESE to tune the entrance sequence:
 *
 *  headingStagger  — gap between each heading line (ms)
 *  rowStagger      — gap between each contact row (ms)
 *  form/details    — when each column starts sliding in (ms)
 *  rowBase         — when the first row begins (ms); should be after
 *                    `details` + ~180ms so the column is ≥ 90% opaque
 *
 * ───────────────────────────────────────────────────────────────────────── */

const DESKTOP: Readonly<Record<string, number>> = {
  label: 0,
  headingBase: 80,
  headingStagger: 80,   // ← widen / narrow heading stagger here
  para: 320,
  form: 260,
  details: 300,
  rowBase: 480,
  rowStagger: 65,       // ← widen / narrow contact-row stagger here
  availability: 800,
};

const MOBILE: Readonly<Record<string, number>> = {
  label: 0,
  headingBase: 40,
  headingStagger: 50,
  para: 160,
  form: 100,
  details: 160,
  rowBase: 210,
  rowStagger: 50,
  availability: 440,
};

/* ── Sub-components ─────────────────────────────────────────────────────── */

function ExternalArrow() {
  return (
    <svg
      className="cs-row-arrow cs-row-arrow--external w-4 h-4 text-zinc-400 group-hover:text-white transition-all duration-200 shrink-0"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12L12 2M12 2H5M12 2v7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function ContactSection({
  email,
  phone,
  linkedinUrl,
  githubUrl,
  cvPath,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    /* Skip all motion setup when user prefers reduced motion.
       Elements have no data-cr attribute, so they are always visible. */
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const D = isMobile ? MOBILE : DESKTOP;

    type Dir = "up" | "left" | "right";
    const queue: Array<{ el: HTMLElement; dir: Dir; delay: number }> = [];

    const push = (sel: string, dir: Dir, delay: number) => {
      const el = section.querySelector<HTMLElement>(sel);
      if (el) queue.push({ el, dir, delay });
    };

    const pushAll = (
      sel: string,
      dir: Dir,
      baseDelay: number,
      stagger: number,
    ) => {
      section.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
        queue.push({ el, dir, delay: baseDelay + i * stagger });
      });
    };

    /* Build queue in visual order */
    push(".cs-label", "up", D.label);
    pushAll(".cs-heading-line", "up", D.headingBase, D.headingStagger);
    push(".cs-para", "up", D.para);
    push(".cs-form", "left", D.form);
    push(".cs-details", "right", D.details);
    /* Rows live inside cs-details; they animate independently after the
       column has reached near-full opacity (rowBase ≥ details + ~180ms). */
    pushAll(".cs-row", "up", D.rowBase, D.rowStagger);

    /* Mark elements hidden — this happens synchronously so there is no
       flash of visible content before the observer fires. */
    queue.forEach(({ el, dir }) => el.setAttribute("data-cr", dir));

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    /* Single IntersectionObserver; runs once */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        queue.forEach(({ el, delay }) => {
          timeouts.push(
            setTimeout(() => el.setAttribute("data-cv", ""), delay),
          );
        });

        /* Availability pulse — starts after the row is visible */
        const pulse = pulseRef.current;
        if (pulse) {
          timeouts.push(
            setTimeout(
              () => pulse.classList.add("cs-pulse-active"),
              D.availability,
            ),
          );
        }

        observer.disconnect();
      },
      { threshold: 0.05 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  /* ── Display helpers ──────────────────────────────────────────────────── */

  const displayLinkedIn = linkedinUrl
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")
    .replace(/\/$/, "");

  const displayGitHub = githubUrl
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\/$/, "");

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="contact-section bg-zinc-950 border-t border-zinc-800"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-24 pb-20">

        {/* ── Heading + paragraph ───────────────────────────────────────
            Each span.cs-heading-line is display:inline-block so that
            translateY works on inline content. They still wrap naturally
            at any viewport width. */}
        <div className="mb-14">
          <h2
            id="contact-heading"
            className="font-bold text-white tracking-tight leading-[1.05] mb-5 max-w-2xl"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            <span className="cs-heading-line">Let&apos;s Build</span>{" "}
            <span className="cs-heading-line">Something</span>{" "}
            <span className="cs-heading-line">Meaningful.</span>
          </h2>
        </div>

        {/* ── Two-column grid ───────────────────────────────────────────
            cs-form  → slides in from the left
            cs-details → slides in from the right; rows stagger inside */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* Form panel */}
          <div className="cs-form">
            <div className="bg-white rounded-3xl p-8 md:p-10">
              <ContactForm />
            </div>
          </div>

          {/* Contact details panel */}
          <div className="cs-details">
            <div className="space-y-3.5">

              {/* ── Group: Direct contact ─────────────────────────── */}
              <p className="cs-row-group-label font-mono text-[11px] text-zinc-400 uppercase tracking-wider pt-1 mb-2" role="presentation">
                Direct contact
              </p>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="cs-row cs-row--external group p-4 rounded-xl border border-zinc-800 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-900 transition-all duration-200 flex items-center justify-between"
                aria-label={`Send an email to ${email}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/gmail.svg" alt="" className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-400 mb-0.5">
                      Email
                    </p>
                    <p className="text-[14.5px] font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 truncate">
                      {email}
                    </p>
                  </div>
                </div>
                <ExternalArrow />
              </a>

              {/* Phone (only rendered when value exists) */}
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="cs-row cs-row--external group p-4 rounded-xl border border-zinc-800 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-900 transition-all duration-200 flex items-center justify-between"
                  aria-label={`Call ${phone}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/phone.svg" alt="" className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-400 mb-0.5">
                        Phone
                      </p>
                      <p className="text-[14.5px] font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 truncate">
                        {phone}
                      </p>
                    </div>
                  </div>
                  <ExternalArrow />
                </a>
              )}

              {/* ── Group: Professional ───────────────────────────── */}
              <p className="cs-row-group-label font-mono text-[11px] text-zinc-400 uppercase tracking-wider pt-3 mb-2" role="presentation">
                Professional
              </p>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-row cs-row--external group p-4 rounded-xl border border-zinc-800 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-900 transition-all duration-200 flex items-center justify-between"
                aria-label="View LinkedIn profile (opens in new tab)"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/linkedin.svg" alt="" className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-400 mb-0.5">
                      LinkedIn
                    </p>
                    <p className="text-[14.5px] font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 truncate">
                      {displayLinkedIn}
                    </p>
                  </div>
                </div>
                <ExternalArrow />
              </a>

              {/* GitHub */}
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-row cs-row--external group p-4 rounded-xl border border-zinc-800 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-900 transition-all duration-200 flex items-center justify-between"
                aria-label="View GitHub profile (opens in new tab)"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/github.svg" alt="" className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-400 mb-0.5">
                      GitHub
                    </p>
                    <p className="text-[14.5px] font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 truncate">
                      {displayGitHub}
                    </p>
                  </div>
                </div>
                <ExternalArrow />
              </a>

              {/* Resume / CV */}
              <a
                href={cvPath}
                download
                className="cs-row cs-row--download group p-4 rounded-xl border border-zinc-800 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-900 transition-all duration-200 flex items-center justify-between"
                aria-label="Download Resume as a PDF file"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/pdf.svg" alt="" className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-400 mb-0.5">
                      Resume
                    </p>
                    <p className="text-[14.5px] font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 truncate">
                      Download Resume
                    </p>
                  </div>
                </div>
                {/* Download arrow — moves down on hover, not diagonally */}
                <svg
                  className="cs-row-arrow cs-row-arrow--download w-4 h-4 text-zinc-400 group-hover:text-white transform group-hover:translate-y-0.5 transition-all duration-200 shrink-0"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 2v6M3.5 6l2.5 2.5L8.5 6M2 10h8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* ── Location + availability ───────────────────────── */}
              <div className="pt-5 mt-4 flex flex-wrap items-center gap-5 border-t border-zinc-800">
                <p className="flex items-center gap-2 text-[13px] font-medium text-zinc-300">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 11 11"
                    fill="none"
                    aria-hidden="true"
                    className="text-zinc-400 shrink-0"
                  >
                    <circle
                      cx="5.5"
                      cy="4.5"
                      r="1.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M5.5 1C3.567 1 2 2.567 2 4.5c0 2.667 3.5 5.5 3.5 5.5S9 7.167 9 4.5C9 2.567 7.433 1 5.5 1Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                  Dubai, United Arab Emirates
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
