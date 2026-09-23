"use client";

import { useRef, useState, useTransition } from "react";
import { updateClientLogos, uploadClientLogoImage } from "@/app/actions/settings";
import type { ClientLogoData } from "@/app/lib/client-logos";

function emptyLogo(): ClientLogoData {
  return { id: `new-${crypto.randomUUID()}`, name: "", logoUrl: "" };
}

export function ClientLogosManager({ initial }: { initial: ClientLogoData[] }) {
  const [logos, setLogos] = useState<ClientLogoData[]>(initial);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(i: number, patch: Partial<ClientLogoData>) {
    setLogos((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function move(i: number, direction: -1 | 1) {
    const target = i + direction;
    if (target < 0 || target >= logos.length) return;
    setLogos((prev) => {
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateClientLogos(logos.filter((l) => l.name.trim() !== "" && l.logoUrl.trim() !== ""));
      setSaved(true);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">Client logos</h2>
        <p className="text-[12.5px] text-zinc-500">
          The scrolling brand marquee at the bottom of the /work page — the company name shows on hover. Doesn&rsquo;t need a matching case study.
        </p>
      </div>

      <div className="space-y-3">
        {logos.map((logo, i) => (
          <LogoRow
            key={logo.id}
            logo={logo}
            index={i}
            total={logos.length}
            onChange={(patch) => update(i, patch)}
            onMove={(dir) => move(i, dir)}
            onRemove={() => setLogos((prev) => prev.filter((_, idx) => idx !== i))}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLogos((prev) => [...prev, emptyLogo()])}
        className="w-full rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-[12.5px] font-medium py-2 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
      >
        + Add logo
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save logos"}
        </button>
        {saved && <span className="text-[12.5px] text-emerald-400">Saved</span>}
      </div>
    </div>
  );
}

function LogoRow({
  logo, index, total, onChange, onMove, onRemove,
}: {
  logo: ClientLogoData;
  index: number;
  total: number;
  onChange: (patch: Partial<ClientLogoData>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    uploadClientLogoImage(formData).then((result) => {
      setUploading(false);
      if (!result.ok) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      onChange({ logoUrl: result.url! });
    });
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Logo {index + 1}</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="text-[12px] text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors">↑</button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="text-[12px] text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors">↓</button>
          <button type="button" onClick={onRemove} className="text-[12px] text-red-400 hover:text-red-300 transition-colors">Remove</button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 rounded-lg border border-zinc-800 bg-white flex items-center justify-center overflow-hidden">
          {logo.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-[10.5px] text-zinc-400">No logo</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={logo.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Brand name"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-lg border border-zinc-700 text-zinc-300 text-[12px] font-medium py-1.5 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : logo.logoUrl ? "Replace logo image" : "Upload logo image"}
          </button>
        </div>
      </div>

      {error && <p className="text-[11.5px] text-red-400">{error}</p>}
    </div>
  );
}
