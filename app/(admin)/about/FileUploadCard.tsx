"use client";

import { upload } from "@vercel/blob/client";
import { saveDocumentUrl, uploadPortrait, type UploadResult } from "@/app/actions/settings";
import { UploadCard } from "@/app/(admin)/_components/UploadCard";

interface Props {
  title: string;
  description: string;
  currentUrl: string;
  accept: string;
  kind: "resume" | "portfolio" | "portrait";
}

/** PDFs go straight from the browser to Blob (they're often too big for a server action), then the link is saved. */
function uploadDocument(field: "resumeUrl" | "portfolioPdfUrl") {
  return async (formData: FormData): Promise<UploadResult> => {
    const file = formData.get("file") as File | null;
    if (!file) return { ok: false, error: "No file provided." };
    if (file.type !== "application/pdf") return { ok: false, error: "Choose a PDF file." };
    try {
      const blob = await upload(`documents/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: file.size > 20 * 1024 * 1024,
      });
      return saveDocumentUrl(field, blob.url);
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Upload failed." };
    }
  };
}

export function FileUploadCard({ title, description, currentUrl, accept, kind }: Props) {
  return (
    <UploadCard
      title={title}
      description={description}
      currentUrl={currentUrl}
      accept={accept}
      kind={kind === "portrait" ? "image" : "pdf"}
      uploadAction={kind === "portrait" ? uploadPortrait : uploadDocument(kind === "resume" ? "resumeUrl" : "portfolioPdfUrl")}
    />
  );
}
