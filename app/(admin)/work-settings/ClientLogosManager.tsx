"use client";

import { useRef, useState, useTransition } from "react";
import { GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { Section, fieldClass } from "@/app/(admin)/_components/Section";
import { useGridDrag } from "@/app/(admin)/_components/useGridDrag";
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

  function moveTo(from: number, to: number) {
    setLogos((prev) => {
      const next = [...prev];
      const [logo] = next.splice(from, 1);
      next.splice(to, 0, logo);
      return next;
    });
  }

  const { gridRef, liftedIndex, tileStyle, handleProps, dropTarget } = useGridDrag(logos.length, moveTo);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      // Every named logo is kept, image or not, so logos can be uploaded a few at a time. The site only shows the ones with an image.
      await updateClientLogos(logos.filter((l) => l.name.trim() !== ""));
      setSaved(true);
    });
  }

  return (
    <Section
      title="Client logos"
      description="The scrolling row of brands at the bottom of /work. The name shows when a visitor hovers a logo. A logo doesn't need a matching case study."
      save={{ onSave: handleSave, pending: isPending, saved, label: "Save logos" }}
    >
      {/* A grid of small tiles, in the order the row scrolls: left to right, then down. Drag a tile by its handle to move it. */}
      <div ref={gridRef} className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {dropTarget}
        {logos.map((logo, i) => (
          <LogoTile
            key={logo.id}
            logo={logo}
            index={i}
            lifted={liftedIndex === i}
            style={tileStyle(i)}
            handle={handleProps(i)}
            onChange={(patch) => update(i, patch)}
            onRemove={() => setLogos((prev) => prev.filter((_, idx) => idx !== i))}
          />
        ))}
        <button
          type="button"
          onClick={() => setLogos((prev) => [...prev, emptyLogo()])}
          className="flex min-h-[176px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-[12.5px] font-semibold text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <Plus size={16} />
          Add logo
        </button>
      </div>
      <p className="text-[12px] text-muted-foreground">Drag a tile by its handle to change the order. SVG or PNG with a transparent background works best. Logos without an image are kept here but stay hidden on the site until one is uploaded.</p>
    </Section>
  );
}

const tileButton =
  "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground";

function LogoTile({
  logo, index, lifted, style, handle, onChange, onRemove,
}: {
  logo: ClientLogoData;
  index: number;
  lifted: boolean;
  style?: React.CSSProperties;
  handle: React.ButtonHTMLAttributes<HTMLButtonElement>;
  onChange: (patch: Partial<ClientLogoData>) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const label = logo.name || `Logo ${index + 1}`;

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    uploadClientLogoImage(formData)
      .then((result) => {
        if (!result.ok) {
          setError(result.error === `Unsupported file type: ${file.type || "unknown"}.` ? "Use an SVG or PNG file." : (result.error ?? "Upload failed."));
          return;
        }
        onChange({ logoUrl: result.url! });
      })
      .catch(() => setError("Upload failed. Try a smaller file."))
      .finally(() => setUploading(false));
  }

  return (
    <div
      data-tile
      style={style}
      className={`flex flex-col rounded-xl border bg-background p-2 ${lifted ? "border-primary/40 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.25)]" : "border-border/70"}`}
    >
      {/* The preview is the upload button: click it to add or replace the image. */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={logo.logoUrl ? `Replace the ${label} image` : `Upload an image for ${label}`}
        className="group relative flex h-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-white transition-colors hover:border-primary/50 disabled:opacity-60"
      >
        {logo.logoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.logoUrl} alt="" className="h-full w-full object-contain p-3" />
            <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 text-[11.5px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Upload size={12} />
              {uploading ? "Uploading…" : "Replace"}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 text-[11.5px] font-semibold text-zinc-500 group-hover:text-primary">
            <Upload size={12} />
            {uploading ? "Uploading…" : "Upload SVG or PNG"}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml,.png,.svg"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
      <input
        type="text"
        value={logo.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Brand name"
        aria-label={`Brand name for logo ${index + 1}`}
        className={`${fieldClass} mt-2 px-2.5 py-1.5 text-[13px]`}
      />
      {error && <p className="mt-1.5 text-[11.5px] text-negative" role="alert">{error}</p>}
      <div className="mt-1.5 flex items-center">
        <button
          type="button"
          {...handle}
          aria-label={`Drag to move ${label}, or use the arrow keys`}
          title="Drag to reorder"
          className={`${tileButton} touch-none ${lifted ? "cursor-grabbing bg-muted text-foreground" : "cursor-grab"}`}
        >
          <GripVertical size={15} />
        </button>
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className={`${tileButton} ml-auto hover:bg-negative/10 hover:text-negative`}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
