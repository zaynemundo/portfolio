"use client";

import { useRef, useState, useTransition } from "react";
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="text-[13.5px] font-semibold text-zinc-100 mb-0.5">{title}</h3>
      <p className="text-[12px] text-zinc-500 mb-4">{description}</p>

      {kind === "image" && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-32 object-cover rounded-lg mb-3 border border-zinc-800" />
      )}
      {kind === "video" && url && (
        <video src={url} controls muted className="w-full h-32 object-cover rounded-lg mb-3 border border-zinc-800" />
      )}
      {kind === "file" && url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[12.5px] text-purple-400 hover:text-purple-300 truncate mb-3"
        >
          View current file →
        </a>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="w-full rounded-lg border border-zinc-700 text-zinc-300 text-[12.5px] font-medium py-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        {isPending ? "Uploading…" : "Upload new file"}
      </button>

      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
