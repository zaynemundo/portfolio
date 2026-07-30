"use client";

import { useState, useRef } from "react";

interface Props {
  defaultSrc?: string;
  defaultInitials?: string;
  defaultBg?: string;
  defaultLight?: boolean;
  /** Initials shown in the preview when the field is left blank. */
  fallbackInitials?: string;
}

/**
 * Client logo picker: uploads a logo file and/or sets the initials tile used
 * when no file exists. Both are submitted with the parent form and stored on
 * the project, so cards and the track-record tiles read the same source.
 */
export function LogoUpload({
  defaultSrc = "",
  defaultInitials = "",
  defaultBg = "",
  defaultLight = false,
  fallbackInitials = "",
}: Props) {
  const [src, setSrc] = useState(defaultSrc);
  const [initials, setInitials] = useState(defaultInitials);
  const [bg, setBg] = useState(defaultBg);
  const [light, setLight] = useState(defaultLight);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) setSrc(json.url as string);
      else setError(json.error ?? "Upload failed");
    } catch {
      setError("Upload failed — check your connection");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const preview = initials || fallbackInitials || "??";

  return (
    <div className="flex items-start gap-4">
      {/* Hidden fields — submitted with the parent form */}
      <input type="hidden" name="rich_logoSrc" value={src} />
      <input type="hidden" name="rich_logoLight" value={light ? "true" : "false"} />

      {/* Live preview doubling as the upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Upload client logo"
        className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200 hover:border-violet-400 transition-colors"
        style={{ backgroundColor: bg || "#e4e4e7" }}
      >
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt="Logo preview" className="w-full h-full object-contain p-2" />
        ) : (
          <span
            className="text-[13px] font-bold tracking-tight leading-none"
            style={{ color: light ? "rgba(255,255,255,0.78)" : "rgba(63,63,70,0.8)" }}
          >
            {preview}
          </span>
        )}
      </button>

      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[12px] font-semibold hover:bg-zinc-700 transition-colors"
          >
            {uploading ? "Uploading…" : src ? "Replace logo" : "Upload logo"}
          </button>
          {src && (
            <button
              type="button"
              onClick={() => setSrc("")}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[12px] hover:text-zinc-900 transition-colors"
            >
              Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            name="rich_logoInitials"
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            maxLength={4}
            placeholder={fallbackInitials || "MJ"}
            aria-label="Logo initials"
            className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[12px] placeholder:text-zinc-300 focus:outline-none focus:border-violet-400 transition-colors"
          />
          <input
            name="rich_logoBg"
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            placeholder="#d9d4cd"
            aria-label="Logo tile colour"
            className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[12px] font-mono placeholder:text-zinc-300 focus:outline-none focus:border-violet-400 transition-colors"
          />
          <label className="flex items-center gap-1.5 text-[11.5px] text-zinc-500">
            <input
              type="checkbox"
              checked={light}
              onChange={(e) => setLight(e.target.checked)}
              className="accent-violet-600"
            />
            Dark tile
          </label>
        </div>

        {error && <p className="text-[11.5px] text-red-500">{error}</p>}
        <p className="text-[11px] text-zinc-400">
          Initials and tile colour are the fallback when no logo file is set. Tick &ldquo;dark tile&rdquo; for light-on-dark initials.
        </p>
      </div>
    </div>
  );
}
