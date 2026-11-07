/* ── Hero scene copy ──────────────────────────────────────────────────────
 * The homepage hero is a scroll-scrubbed video: each scene fades in as the
 * visitor's scroll progress moves through [start, end). One home for the
 * default copy so the seed script, the DB fallbacks and the admin all agree.
 * ────────────────────────────────────────────────────────────────────────── */

export interface HeroSceneData {
  eyebrow?: string;
  heading: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  start: number;
  end: number;
}

export const heroScenes: HeroSceneData[] = [
  {
    heading: "Zayne Mundo",
    description:
      "Graphic designer and web developer in the UAE — brand visuals, 2D illustration, mockups, and websites that grow audiences and turn attention into leads.",
    start: 0,
    end: 0.28,
  },
  {
    heading: "Design that moves the numbers",
    description:
      "640% more account visibility. 146% more website traffic. Engagement lifted from 35% to 68% — through considered design, content, UI/UX, and SEO, not guesswork.",
    start: 0.26,
    end: 0.52,
  },
  {
    heading: "Every detail is a decision",
    description:
      "From a single mockup to a complete brand system: colour, type, composition, and code chosen with intent across social, print, and screen.",
    start: 0.5,
    end: 0.74,
  },
  {
    heading: "Let’s make something worth sharing.",
    ctaLabel: "Get in touch",
    ctaHref: "#contact",
    start: 0.72,
    end: 0.9,
  },
];
