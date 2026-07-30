"use client";

import { useState, useRef } from "react";

interface Props {
  defaultImages?: string[];
  defaultLabels?: string[];
}

export function ImageUpload({ defaultImages = [], defaultLabels = [] }: Props) {
  const [images, setImages] = useState<string[]>(defaultImages);
  /*
   * Captions are paired with images by index, so every mutation below has to
   * move labels in lockstep with the images or the two arrays drift apart.
   */
  const [labels, setLabels] = useState<string[]>(() =>
    defaultImages.map((_, i) => defaultLabels[i] ?? ""),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function swap<T>(arr: T[], a: number, b: number): T[] {
    const next = [...arr];
    [next[a], next[b]] = [next[b], next[a]];
    return next;
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok && json.url) {
          uploaded.push(json.url as string);
        } else {
          setError(json.error ?? "Upload failed");
        }
      } catch {
        setError("Upload failed — check your connection");
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
    setLabels((prev) => [...prev, ...uploaded.map(() => "")]);
    setUploading(false);
    // Reset input so the same file can be re-selected if needed
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setLabels((prev) => prev.filter((_, i) => i !== index));
  }

  function moveLeft(index: number) {
    if (index === 0) return;
    setImages((prev) => swap(prev, index - 1, index));
    setLabels((prev) => swap(prev, index - 1, index));
  }

  function moveRight(index: number) {
    setImages((prev) => (index >= prev.length - 1 ? prev : swap(prev, index, index + 1)));
    setLabels((prev) => (index >= images.length - 1 ? prev : swap(prev, index, index + 1)));
  }

  function setLabel(index: number, value: string) {
    setLabels((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/*
        Submitted with the parent form. Labels are emitted for every image —
        including blanks — so the server can pair them back up by index.
      */}
      {images.map((url, i) => (
        <div key={url + i}>
          <input type="hidden" name="images" value={url} />
          <input type="hidden" name="imageLabels" value={labels[i] ?? ""} />
        </div>
      ))}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) void uploadFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        className="w-full border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 14V4M7 8l4-4 4 4" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {uploading ? (
          <p className="text-[13px] text-violet-600 font-medium">Uploading…</p>
        ) : (
          <>
            <p className="text-[13px] font-medium text-zinc-600">Drop images here or <span className="text-violet-600">click to browse</span></p>
            <p className="text-[11px] text-zinc-400">JPG, PNG, WebP, AVIF — multiple files OK</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url + i}>
            <div className="relative group rounded-lg overflow-hidden border border-zinc-200 aspect-video bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveLeft(i)}
                  disabled={i === 0}
                  aria-label="Move left"
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove image"
                  className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveRight(i)}
                  disabled={i === images.length - 1}
                  aria-label="Move right"
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Order badge */}
              <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {i + 1}
              </span>
            </div>
            <input
              type="text"
              value={labels[i] ?? ""}
              onChange={(e) => setLabel(i, e.target.value)}
              aria-label={`Caption for image ${i + 1}`}
              placeholder={`Screen ${i + 1}`}
              className="mt-1.5 w-full px-2 py-1.5 rounded-md bg-white border border-zinc-200 text-zinc-900 text-[11.5px] placeholder:text-zinc-300 focus:outline-none focus:border-violet-400 transition-colors"
            />
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-[11px] text-zinc-400">
          Hover an image to reorder or remove it. First image is the cover. Captions label each slide on the case study.
        </p>
      )}
    </div>
  );
}
