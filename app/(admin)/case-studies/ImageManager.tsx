"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProjectImage, addProjectImage, removeProjectImage } from "@/app/actions/projects";

export function ImageManager({ projectId, images }: { projectId: string; images: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadProjectImage(formData);
      if (!result.ok || !result.url) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      await addProjectImage(projectId, result.url);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((url) => (
          <div key={url} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full aspect-[4/3] object-cover rounded-lg border border-zinc-800" />
            <button
              type="button"
              onClick={() => startTransition(() => removeProjectImage(projectId, url))}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-zinc-950/80 text-zinc-300 text-[13px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 hover:text-white"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="rounded-lg border border-zinc-700 text-zinc-300 text-[12.5px] font-medium px-3 py-1.5 hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        {isPending ? "Working…" : "+ Add image"}
      </button>
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
