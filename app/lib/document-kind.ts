export type DocumentKind = "image" | "pdf" | "other";

/** What a file can be previewed as, judged from its extension. */
export function documentKind(fileUrl: string): DocumentKind {
  const path = fileUrl.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(path)) return "image";
  if (path.endsWith(".pdf")) return "pdf";
  return "other";
}
