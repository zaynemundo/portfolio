import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { documentKind } from "@/app/lib/document-kind";
import { getSharedDocument, watermarkText } from "@/app/lib/shared-document";

/** Prints the watermark line across every page, faint and on a slant, repeated so no part of the page is free of it. */
async function watermarkPdf(bytes: ArrayBuffer, text: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  // The built-in font only has Western European letters; anything else would make drawing fail.
  const line = text.replace(/·/g, "-").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(11, Math.min(22, width / 34));
    const stepX = font.widthOfTextAtSize(line, size) + size * 5;
    const stepY = size * 9;
    for (let y = -height * 0.5, row = 0; y < height * 1.2; y += stepY, row++) {
      // Every other row is shifted, so the lines don't stack into columns.
      for (let x = -width * 0.5 - (row % 2) * (stepX / 2); x < width * 1.2; x += stepX) {
        page.drawText(line, { x, y, size, font, color: rgb(0.45, 0.45, 0.5), opacity: 0.16, rotate: degrees(28) });
      }
    }
  }
  return pdf.save();
}

/**
 * Serves a shared document's file through the site, so the client never sees
 * where it is stored and the file stops being reachable the moment the link
 * expires or sharing is switched off. A PDF is watermarked on the way out, so
 * a downloaded copy carries the mark too.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const doc = await getSharedDocument(token);
  if (!doc) return new Response("This link is no longer available.", { status: 404 });

  const upstream = await fetch(doc.fileUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("The file could not be loaded.", { status: 502 });

  const headers = {
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "Content-Disposition": "inline",
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };

  if (documentKind(doc.fileUrl) === "pdf") {
    const original = await upstream.arrayBuffer();
    let body: Uint8Array;
    try {
      body = await watermarkPdf(original, watermarkText(doc.client?.name));
    } catch {
      // A PDF that can't be rewritten (damaged, or locked) is still better shown than not.
      body = new Uint8Array(original);
    }
    // Sent as a stream, like the untouched file below, so a large PDF isn't held to the size limit on whole responses.
    return new Response(new Blob([body as BlobPart]).stream(), { headers: { ...headers, "Content-Type": "application/pdf" } });
  }

  return new Response(upstream.body, { headers });
}
