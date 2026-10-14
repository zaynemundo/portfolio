/** The widths Next's image optimizer makes by default (its deviceSizes). */
/* The dev server's optimizer can stall on some sizes and leave the page
   loading forever, so locally the original files are used. */
const OPTIMIZE = process.env.NODE_ENV === "production";

const WIDTHS = [640, 828, 1080, 1200, 1920];

/**
 * Props for a plain <img> that still gets Next's image optimizer: a WebP/AVIF
 * copy at the width the screen needs, instead of the full-size upload. For the
 * places where <Image> doesn't fit (CSS-sized covers, sliders, posters).
 * SVGs and data URLs are passed through untouched.
 */
export function optimizedImage(src: string, sizes = "100vw") {
  if (!OPTIMIZE || !src || src.endsWith(".svg") || src.startsWith("data:")) return { src };
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
  return {
    src: url(1200),
    srcSet: WIDTHS.map((w) => `${url(w)} ${w}w`).join(", "),
    sizes,
  };
}

/** One optimized URL, for attributes that take a single image (a video's poster). */
export function optimizedSrc(src: string | undefined, width = 1200): string | undefined {
  if (!OPTIMIZE || !src || src.endsWith(".svg") || src.startsWith("data:")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}
