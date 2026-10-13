import { OG_SIZE, renderOgImage } from "@/app/lib/og-image";

export const alt = "Zaira Mundo — Creative Designer & Front-End Developer";
export const size = OG_SIZE;
export const contentType = "image/png";

/** The share card for every page that doesn't have one of its own. */
export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Creative Designer & Front-End Developer",
    footer: "zairamundo.com",
  });
}
