import { getSharedDocument } from "@/app/lib/shared-document";

/**
 * Serves a shared document's file through the site, so the client never sees
 * where it is stored and the file stops being reachable the moment the link
 * expires or sharing is switched off.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const doc = await getSharedDocument(token);
  if (!doc) return new Response("This link is no longer available.", { status: 404 });

  const upstream = await fetch(doc.fileUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("The file could not be loaded.", { status: 502 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
