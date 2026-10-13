"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Section, ItemCard, AddItemButton, fieldClass } from "@/app/(admin)/_components/Section";
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
    <Section
      title="Client logos"
      description="The scrolling row of brands at the bottom of /work. The name shows when a visitor hovers a logo. A logo doesn't need a matching case study."
      save={{ onSave: handleSave, pending: isPending, saved, label: "Save logos" }}
    >
      {logos.length === 0 && (
        <p className="rounded-xl border border-dashed border-border py-6 text-center text-[13px] text-muted-foreground">No logos yet.</p>
      )}
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
      <AddItemButton onClick={() => setLogos((prev) => [...prev, emptyLogo()])}>Add logo</AddItemButton>
    </Section>
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
    <ItemCard
      label={`Logo ${index + 1}`}
      summary={logo.name}
      onRemove={onRemove}
      move={{ up: index > 0 ? () => onMove(-1) : undefined, down: index < total - 1 ? () => onMove(1) : undefined }}
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-24 shrink-0 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden">
          {logo.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.logoUrl} alt="" className="h-full w-full object-contain p-2" />
          ) : (
            <span className="text-[11px] text-zinc-400">No logo</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input type="text" value={logo.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Brand name" aria-label="Brand name" className={fieldClass} />
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
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Upload size={13} />
            {uploading ? "Uploading…" : logo.logoUrl ? "Replace image" : "Upload image"}
          </button>
        </div>
      </div>
      {error && <p className="text-[12px] text-negative" role="alert">{error}</p>}
    </ItemCard>
  );
}
