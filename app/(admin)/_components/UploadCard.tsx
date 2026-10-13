"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Film, Image as ImageIcon, Upload } from "lucide-react";
import type { UploadResult } from "@/app/actions/settings";

interface Props {
  title: string;
  description: string;
  currentUrl: string;
  accept: string;
  kind: "video" | "image" | "file";
  uploadAction: (formData: FormData) => Promise<UploadResult>;
}

/** Generic file-upload card for dashboard homepage sections (video/poster/etc). */
export function UploadCard({ title, description, currentUrl, accept, kind, uploadAction }: Props) {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      setUrl(result.url!);
    });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* What is there now, at a size you can actually judge it by. */}
      {kind !== "file" && (
        <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
          {url && kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : url && kind === "video" ? (
            <video src={url} controls muted className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-[12px] text-muted-foreground">
              {kind === "video" ? <Film size={20} /> : <ImageIcon size={20} />}
              Nothing uploaded yet
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="text-[13.5px] font-semibold text-foreground">{title}</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>

        <input ref={inputRef} type="file" accept={accept} onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Upload size={13} />
            {isPending ? "Uploading…" : url ? "Replace" : "Upload"}
          </button>
          {url && kind === "file" && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 transition-colors">
              <FileText size={13} />
              View current file
            </a>
          )}
        </div>

        {error && <p className="mt-2 text-[12px] text-negative" role="alert">{error}</p>}
      </div>
    </div>
  );
}
