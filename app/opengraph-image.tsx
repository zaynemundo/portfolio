import { OG_SIZE, renderOgImage } from "@/app/lib/og-image";

export const alt = "Zayne Mundo — Graphic Designer & Web Developer";
export const size = OG_SIZE;
export const contentType = "image/png";

/** The share card for every page that doesn't have one of its own. */
export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Graphic Designer & Web Developer",
    footer: "zaynemundo.com",
  });
}
