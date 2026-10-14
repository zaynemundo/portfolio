import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireSession } from "@/app/lib/session";

/** Folders the admin may upload into from the browser. */
const FOLDERS = ["featured/", "documents/", "case-studies/"];
const MAX_BYTES = 200 * 1024 * 1024; // 200MB

/**
 * Hands the admin's browser a short-lived token to upload straight to Vercel
 * Blob. Big files (homepage clips, PDFs) can't go through a server action, which
 * stops at a few MB.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await requireSession();
        if (!FOLDERS.some((folder) => pathname.startsWith(folder))) throw new Error("Not an upload folder.");
        return {
          allowedContentTypes: pathname.startsWith("documents/")
            ? ["application/pdf"]
            : ["video/mp4", "video/webm", "image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
