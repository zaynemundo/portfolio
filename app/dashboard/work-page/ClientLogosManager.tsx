"use client";

import { useState, useTransition } from "react";
import { updateClientLogos } from "@/app/actions/settings";
import type { ClientLogoData } from "@/app/lib/client-logos";

function emptyLogo(): ClientLogoData {
  return { id: `new-${crypto.randomUUID()}`, name: "", initials: "", bg: "#e5e5e5", light: false };
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
      await updateClientLogos(logos.filter((l) => l.name.trim() !== ""));
      setSaved(true);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">Client logos</h2>
        <p className="text-[12.5px] text-zinc-500">
          The scrolling brand marquee at the bottom of the /work page — doesn&rsquo;t need a matching case study.
        </p>
      </div>

      <div className="space-y-3">
        {logos.map((logo, i) => (
          <div key={logo.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Logo {i + 1}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-[12px] text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === logos.length - 1} className="text-[12px] text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors">↓</button>
                <button type="button" onClick={() => setLogos((prev) => prev.filter((_, idx) => idx !== i))} className="text-[12px] text-red-400 hover:text-red-300 transition-colors">Remove</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Brand name</label>
                <input
                  type="text"
                  value={logo.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initials</label>
                <input
                  type="text"
                  value={logo.initials}
                  onChange={(e) => update(i, { initials: e.target.value })}
                  placeholder="e.g. MJ"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Badge color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={logo.bg}
                    onChange={(e) => update(i, { bg: e.target.value })}
                    className="h-8 w-10 rounded border border-zinc-800 bg-zinc-900"
                  />
                  <input
                    type="text"
                    value={logo.bg}
                    onChange={(e) => update(i, { bg: e.target.value })}
                    className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-[12.5px] text-zinc-400 cursor-pointer pt-4">
                <input type="checkbox" checked={logo.light} onChange={(e) => update(i, { light: e.target.checked })} className="rounded border-zinc-700 bg-zinc-900" />
                Light text
              </label>
            </div>
          </div>
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
