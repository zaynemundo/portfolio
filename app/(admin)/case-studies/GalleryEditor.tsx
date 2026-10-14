"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Pencil } from "lucide-react";
import { Field, fieldClass } from "@/app/(admin)/_components/Section";
import { TileGridEditor } from "@/app/(admin)/_components/TileGridEditor";
import { AddTile } from "@/app/(admin)/_components/Tile";

export interface GalleryImage {
  url: string;
  caption: string;
  alt: string;
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/**
 * The case study's screenshots as a grid: each with its own caption and alt
 * text (edited in a dialog), dragged by its handle to reorder. The first one is
 * the cover. New images upload straight away; the list is saved with the form.
 */
export function GalleryEditor({ images, onChange, projectName }: { images: GalleryImage[]; onChange: (next: GalleryImage[]) => void; projectName: string }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const added: GalleryImage[] = [];
    for (const [i, file] of Array.from(files).entries()) {
      if (!ACCEPT.includes(file.type)) {
        setError(`${file.name} isn't a JPG, PNG or WebP image.`);
        continue;
      }
      setUploading(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…");
      try {
        const blob = await upload(`case-studies/${file.name}`, file, { access: "public", handleUploadUrl: "/api/upload" });
        added.push({ url: blob.url, caption: "", alt: "" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    setUploading(null);
    if (added.length) onChange([...images, ...added]);
  }

  return (
    <div>
      <TileGridEditor
        items={images}
        onChange={onChange}
        itemLabel="Image"
        columns={4}
        compact
        keyOf={(img) => img.url}
        saveHint="Save changes"
        titleOf={(_, i) => (i === 0 ? "Cover image" : "")}
        renderPreview={(img, i) => (
          <>
            <span className="group relative block overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="aspect-[4/3] w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">Cover</span>}
              <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 text-[12px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Pencil size={12} />
                Edit
              </span>
            </span>
            <span className={`mt-2 block truncate px-0.5 text-[12.5px] ${img.caption ? "font-medium text-foreground" : "text-muted-foreground"}`} title={img.caption || undefined}>
              {img.caption || "No caption"}
            </span>
          </>
        )}
        renderEditor={(img, update) => (
          <>
            <div className="overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="mx-auto block max-h-[40vh] w-auto object-contain" />
            </div>
            <Field label="Caption">
              <input type="text" value={img.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="e.g. Berth page" className={fieldClass} autoFocus />
            </Field>
            <Field label="Alt text" hint="Describes the image for screen readers and if it fails to load. Left empty, the project name and caption are used.">
              <input type="text" value={img.alt} onChange={(e) => update({ alt: e.target.value })} placeholder={`${projectName || "Project"} — ${img.caption || "screenshot"}`} className={fieldClass} />
            </Field>
          </>
        )}
        addTile={
          <AddTile
            label={uploading ?? "Add images"}
            icon={<ImagePlus size={18} />}
            hint={uploading ? undefined : "JPG, PNG or WebP"}
            onClick={() => inputRef.current?.click()}
            disabled={uploading !== null}
            minHeight={150}
          />
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT.join(",")}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        className="hidden"
      />
      {error && <p className="mt-2 text-[12px] text-negative" role="alert">{error}</p>}
    </div>
  );
}
