"use client";

import { useRef, useState, useTransition } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { uploadPortrait } from "@/app/actions/settings";
import { FilePreviewDialog } from "@/app/(admin)/_components/FilePreviewDialog";

const button =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-50";

/** The About portrait as a small round photo in the Identity card. It uploads as soon as a file is chosen. */
export function PortraitField({ currentUrl }: { currentUrl: string }) {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadPortrait(formData);
      if (!result.ok || !result.url) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      setUrl(result.url);
    });
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => (url ? setViewing(true) : inputRef.current?.click())}
        aria-label={url ? "View the portrait full size" : "Upload a portrait"}
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground hover:border-primary/50 transition-colors"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={20} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-foreground">Portrait photo</p>
        <p className="text-[12px] text-muted-foreground">Shown in the About section. JPG, PNG or WebP; it uploads as soon as you choose it.</p>
        {error && <p className="mt-1 text-[12px] text-negative" role="alert">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={isPending} className={`${button} border border-border bg-card text-foreground hover:bg-muted`}>
          <Upload size={13} />
          {isPending ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button type="button" onClick={() => setViewing(true)} className={`${button} text-primary hover:bg-primary/10`}>
            View
          </button>
        )}
      </div>

      {viewing && <FilePreviewDialog title="Portrait photo" url={url} kind="image" onClose={() => setViewing(false)} />}
    </div>
  );
}
