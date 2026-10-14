"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Film, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { labelClass, pillButtonClass } from "@/app/(admin)/_components/Section";


const ACCEPT = {
  video: "video/mp4,video/webm",
  image: "image/jpeg,image/png,image/webp",
};

/**
 * A compact upload row for a video or an image: preview, what to do, then the
 * buttons. The file goes straight from the browser to Vercel Blob (see
 * app/api/upload), so big clips aren't stopped by the server's size limit.
 */
export function MediaUploadField({
  label, kind, folder, value, onChange,
}: {
  label: string;
  kind: "video" | "image";
  /** Blob folder, one of those allowed in app/api/upload, e.g. "featured". */
  folder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT[kind].split(",").includes(file.type)) {
      setError(kind === "video" ? "Choose an MP4 or WebM video." : "Choose a JPG, PNG or WebP image.");
      return;
    }
    setError(null);
    setProgress(0);
    try {
      const blob = await upload(`${folder}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      onChange(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  const pick = () => inputRef.current?.click();
  const uploading = progress !== null;
  const fileName = value ? decodeURIComponent(value.split("/").pop() ?? value) : "";

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <input ref={inputRef} type="file" accept={ACCEPT[kind]} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} className="hidden" />
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={cn(
          "flex items-center gap-3 rounded-lg border p-2 transition-colors",
          value ? "border-border" : "border-dashed border-border",
          over && "border-primary bg-primary/10",
        )}
      >
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          aria-label={value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
          className="flex h-12 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground hover:text-primary transition-colors"
        >
          {value && kind === "video" ? (
            <video src={value} muted playsInline preload="metadata" className="h-full w-full object-cover" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : kind === "video" ? (
            <Film size={18} />
          ) : (
            <ImagePlus size={18} />
          )}
        </button>
        <div className="min-w-0 flex-1 text-[12px] leading-snug text-muted-foreground">
          {uploading ? (
            <>
              <span className="block font-semibold text-foreground">Uploading… {progress}%</span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </span>
            </>
          ) : over ? (
            <span className="font-semibold text-primary">Drop to upload</span>
          ) : value ? (
            <span className="block truncate" title={fileName}>{fileName}</span>
          ) : (
            <>
              <span className="block font-semibold text-foreground">Drop a {kind} or click to upload</span>
              {kind === "video" ? "MP4 or WebM" : "JPG, PNG or WebP"}
            </>
          )}
        </div>
        {value && !uploading && (
          <div className="flex shrink-0 gap-1">
            <button type="button" onClick={pick} className={pillButtonClass}>Replace</button>
            <button type="button" onClick={() => onChange("")} aria-label={`Remove ${label.toLowerCase()}`} className={cn(pillButtonClass, "px-2 hover:bg-negative/10 hover:text-negative")}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-negative" role="alert">{error}</p>}
    </div>
  );
}
