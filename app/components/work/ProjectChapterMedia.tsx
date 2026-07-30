"use client";

import Image from "next/image";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";

interface Props {
  images: string[];
  imageAlt: string;
  projectName: string;
  layout: string;
  progress: number;
}

/**
 * Media block — scroll-driven image expansion.
 *
 * The image is the visual hero of each project chapter.
 * It scales from 0.85 → 1.0 with border-radius 16 → 0 during the sticky phase.
 * Split layout adds parallax. Layered layout stages a secondary device image.
 */
export function ProjectChapterMedia({
  images,
  imageAlt,
  projectName,
  layout,
  progress,
}: Props) {
  const reduced = useReducedMotion();

  const primarySrc = images[0];
  const secondarySrc = images.length > 1 ? images[1] : null;

  const ease = (t: number) => 1 - (1 - t) * (1 - t);

  /* ── Image expansion ─────────────────────────────────────── */
  const imgExpP = ease(Math.min(Math.max(0, (progress - 0.15) / 0.45), 1));
  const imgFadeP = Math.min(Math.max(0, (progress - 0.08) / 0.18), 1);

  const imgScale = reduced ? 1 : 0.85 + 0.15 * imgExpP;
  const imgRadius = reduced ? 0 : Math.round(16 * (1 - imgExpP));
  const imgOpacity = reduced ? 1 : imgFadeP;

  /* ── Exit ────────────────────────────────────────────────── */
  const exitP = Math.max(0, (progress - 0.85) / 0.15);
  const exitScale = reduced ? 1 : 1 - exitP * 0.04;
  const exitOpacity = reduced ? 1 : 1 - exitP * 0.2;

  const finalScale = imgScale * exitScale;
  const finalOpacity = imgOpacity * exitOpacity;

  /* ── Layered: secondary image ────────────────────────────── */
  const secP = ease(Math.min(Math.max(0, (progress - 0.5) / 0.25), 1));
  const secondaryOpacity = reduced ? 1 : secP * exitOpacity;
  const secondaryTranslateY = reduced ? 0 : 50 * (1 - secP);

  /* ── Split: parallax ─────────────────────────────────────── */
  const splitLatP = ease(Math.min(Math.max(0, (progress - 0.08) / 0.4), 1));
  const splitX = reduced ? 0 : 45 * (1 - splitLatP);
  const splitY = reduced ? 0 : 30 * (1 - ease(Math.min(progress / 0.65, 1)));

  const wc = reduced ? "auto" : "transform, opacity";

  /* ── Framed ──────────────────────────────────────────────── */
  if (layout === "framed") {
    return (
      <div
        className="project-chapter-media project-chapter-media--framed"
        style={{
          opacity: finalOpacity,
          transform: `scale(${finalScale})`,
          borderRadius: `${imgRadius}px`,
          willChange: wc,
        }}
      >
        <div className="project-chapter-media__frame">
          {primarySrc ? (
            <Image
              src={primarySrc}
              alt={imageAlt || `${projectName} screenshot`}
              width={1400}
              height={875}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="project-chapter-media__img"
              loading="lazy"
            />
          ) : (
            <div className="project-chapter-media__placeholder" aria-hidden="true">
              <span>{projectName.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Split ───────────────────────────────────────────────── */
  if (layout === "split") {
    return (
      <div
        className="project-chapter-media project-chapter-media--split"
        style={{
          opacity: finalOpacity,
          transform: `translateX(${splitX}px) translateY(${splitY}px) scale(${finalScale})`,
          borderRadius: `${imgRadius}px`,
          willChange: wc,
        }}
      >
        <div className="project-chapter-media__frame">
          {primarySrc ? (
            <Image
              src={primarySrc}
              alt={imageAlt || `${projectName} screenshot`}
              width={1400}
              height={875}
              sizes="(max-width: 768px) 100vw, 600px"
              className="project-chapter-media__img"
              loading="lazy"
            />
          ) : (
            <div className="project-chapter-media__placeholder" aria-hidden="true">
              <span>{projectName.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Layered ─────────────────────────────────────────────── */
  return (
    <div className="project-chapter-media project-chapter-media--layered">
      <div
        className="project-chapter-media__primary"
        style={{
          opacity: finalOpacity,
          transform: `scale(${finalScale})`,
          borderRadius: `${imgRadius}px`,
          willChange: wc,
        }}
      >
        {primarySrc ? (
          <Image
            src={primarySrc}
            alt={imageAlt || `${projectName} screenshot`}
            width={1400}
            height={875}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 1100px"
            className="project-chapter-media__img"
            loading="lazy"
          />
        ) : (
          <div className="project-chapter-media__placeholder" aria-hidden="true">
            <span>{projectName.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>

      {secondarySrc && (
        <div
          className="project-chapter-media__secondary"
          style={{
            opacity: secondaryOpacity,
            transform: `translateY(${secondaryTranslateY}px)`,
            willChange: wc,
          }}
        >
          <Image
            src={secondarySrc}
            alt={`${projectName} detail view`}
            width={320}
            height={569}
            sizes="(max-width: 768px) 140px, 210px"
            className="project-chapter-media__img project-chapter-media__img--secondary"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
