/** Widths Next's image optimizer allows by default (384 from imageSizes, the rest from deviceSizes). */
/* The dev server's optimizer can stall on some sizes and leave the page
   loading forever, so locally the original files are used. */
const OPTIMIZE = process.env.NODE_ENV === "production";

const WIDTHS = [384, 640, 828, 1080, 1200, 1920];

/**
 * Props for a plain <img> that still gets Next's image optimizer: a WebP/AVIF
 * copy at the width the screen needs, instead of the full-size upload. For the
 * places where <Image> doesn't fit (CSS-sized covers, sliders, posters).
 * SVGs and data URLs are passed through untouched.
 */
export function optimizedImage(src: string, sizes = "100vw", quality = 75, widths: number[] = WIDTHS) {
  if (!OPTIMIZE || !src || src.endsWith(".svg") || src.startsWith("data:")) return { src };
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
  return {
    src: url(widths.includes(1200) ? 1200 : widths[widths.length - 1]),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    sizes,
  };
}

/** Small widths (from Next's default imageSizes) for logos and icons. */
export const SMALL_WIDTHS = [128, 256, 384];

/** One optimized URL, for attributes that take a single image (a video's poster). */
export function optimizedSrc(src: string | undefined, width = 1200, quality = 75): string | undefined {
  if (!OPTIMIZE || !src || src.endsWith(".svg") || src.startsWith("data:")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
