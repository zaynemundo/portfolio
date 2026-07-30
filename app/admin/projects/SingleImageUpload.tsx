"use client";

import { useState, useRef } from "react";

interface Props {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  /** Already-uploaded project images, offered as quick picks. */
  options?: string[];
}

/**
 * Assigns one specific image to one case-study slot.
 *
 * Upload a new file, or pick from the images already on the project. Leaving it
 * empty is meaningful: the slot falls back to cycling the project's image pool,
 * which is what keeps every visual filled before individual shots are assigned.
 */
export function SingleImageUpload({ name, label, hint, defaultValue = "", options = [] }: Props) {
  const [src, setSrc] = useState(defaultValue);
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

  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">{label}</label>
      <input type="hidden" name={name} value={src} />

      <div className="flex items-start gap-3">
        {/* Preview doubles as the upload button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={`Upload image for ${label}`}
          className="w-24 h-16 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden shrink-0 flex items-center justify-center hover:border-violet-400 transition-colors"
        >
          {src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={src} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-zinc-400">No image</span>
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[11.5px] font-semibold hover:bg-zinc-700 transition-colors"
            >
              {uploading ? "Uploading…" : src ? "Replace" : "Upload"}
            </button>
            {src && (
              <button
                type="button"
                onClick={() => setSrc("")}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[11.5px] hover:text-zinc-900 transition-colors"
              >
                Clear
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

          {options.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSrc(opt)}
                  title={opt}
                  className={`w-9 h-7 rounded border overflow-hidden transition-colors ${
                    src === opt ? "border-violet-500" : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={opt} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-[11px] text-red-500">{error}</p>}
          {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
