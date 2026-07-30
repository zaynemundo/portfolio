"use client";

import { useState } from "react";

interface Props {
  name: string;
  label: string;
  defaultValues?: string[];
  presets?: string[];
  hint?: string;
}

export function TagInput({ name, label, defaultValues = [], presets = [], hint }: Props) {
  const [tags, setTags] = useState<string[]>(defaultValues);
  const [input, setInput] = useState("");

  function add(value: string) {
    const v = value.trim();
    if (!v || tags.includes(v)) return;
    setTags((prev) => [...prev, v]);
  }

  function remove(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  const available = presets.filter((p) => !tags.includes(p));

  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">{label}</label>

      {/* Hidden inputs submitted with the form */}
      {tags.map((t) => (
        <input key={t} type="hidden" name={name} value={t} />
      ))}

      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-[12px] font-medium">
              {t}
              <button type="button" onClick={() => remove(t)} aria-label={`Remove ${t}`}
                className="ml-0.5 hover:text-violet-900 leading-none">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Type to add custom */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input) { add(input); setInput(""); } }}
        placeholder="Type and press Enter to add…"
        className="w-full px-3.5 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors"
      />

      {/* Preset pills */}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {available.map((p) => (
            <button key={p} type="button" onClick={() => add(p)}
              className="px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/60 transition-colors">
              + {p}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="text-[11px] text-zinc-400 mt-1.5">{hint}</p>}
    </div>
  );
}
