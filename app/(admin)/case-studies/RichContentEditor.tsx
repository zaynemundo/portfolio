"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, ImagePlus, Trash2 } from "lucide-react";
import { uploadProjectImage } from "@/app/actions/projects";
import { RICH_SECTIONS, sectionHasContent, type Field } from "./rich-schema";
import { StatusPill } from "@/app/(admin)/_components/ui/StatusPill";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { ItemCard, AddItemButton, fieldClass, areaClass, labelClass } from "@/app/(admin)/_components/Section";
import { useGridDrag } from "@/app/(admin)/_components/useGridDrag";
import { cn } from "@/app/lib/utils";

type Obj = Record<string, unknown>;

function asObj(value: unknown): Obj {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : {};
}

/**
 * The detailed write-up: one fold-away card per chapter of the public case
 * study page, in the order they appear there. Every case study uses the
 * same chapters, set by P&O Marinas.
 */
export function RichContentEditor({ value, onChange }: { value: Obj; onChange: (next: Obj) => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const sections = RICH_SECTIONS.filter((section) => !section.elsewhere && !section.retired);

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const filled = sectionHasContent(section, value);
        const isOpen = open.has(section.id);
        return (
          <div key={section.id} className={cardClass}>
            <button type="button" onClick={() => toggle(section.id)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-5 py-3.5 text-left">
              <ChevronDown size={15} className={cn("shrink-0 text-muted-foreground transition-transform", !isOpen && "-rotate-90")} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-foreground">{section.title}</span>
                <span className="block truncate text-[12.5px] text-muted-foreground">{section.hint}</span>
              </span>
              <StatusPill tone={filled ? "positive" : "neutral"}>{filled ? "Filled" : "Empty"}</StatusPill>
            </button>
            {isOpen && (
              <div className="border-t border-border p-5">
                <FieldsEditor fields={section.fields} value={value} onChange={onChange} path={section.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** The fields of one chapter, or of one item in a list. Also used on the Basics tab for the extra sidebar rows. */
export function FieldsEditor({
  fields, value, onChange, path, stacked,
}: {
  fields: Field[];
  value: Obj;
  onChange: (next: Obj) => void;
  path: string;
  /** One field per row, even the half-width ones (for narrow cards in a grid). */
  stacked?: boolean;
}) {
  return (
    <div className={stacked ? "grid gap-y-4" : "grid sm:grid-cols-2 gap-x-4 gap-y-4"}>
      {fields.map((field) => {
        const id = `${path}-${field.key}`;
        const set = (next: unknown) => onChange({ ...value, [field.key]: next });
        const half = "half" in field && field.half;

        return (
          <div key={field.key} className={half || stacked ? "" : "sm:col-span-2"}>
            {field.kind === "text" && (
              <>
                <label htmlFor={id} className={labelClass}>{field.label}</label>
                <input
                  id={id}
                  type="text"
                  value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                  onChange={(e) => set(e.target.value)}
                  placeholder={field.placeholder}
                  className={fieldClass}
                />
              </>
            )}

            {field.kind === "image" && (
              <ImageField
                label={field.label}
                optional={field.optional}
                value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                onChange={set}
                caption={field.captionKey ? {
                  value: typeof value[field.captionKey] === "string" ? (value[field.captionKey] as string) : "",
                  onChange: (next) => onChange({ ...value, [field.captionKey!]: next }),
                } : undefined}
              />
            )}

            {field.kind === "number" && (
              <>
                <label htmlFor={id} className={labelClass}>{field.label}</label>
                <input
                  id={id}
                  type="number"
                  value={value[field.key] === undefined || value[field.key] === null ? "" : String(value[field.key])}
                  onChange={(e) => set(e.target.value)}
                  placeholder={field.placeholder}
                  className={fieldClass}
                />
              </>
            )}

            {field.kind === "textarea" && (
              <>
                <label htmlFor={id} className={labelClass}>{field.label}</label>
                <textarea
                  id={id}
                  value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                  onChange={(e) => set(e.target.value)}
                  placeholder={field.placeholder}
                  rows={stacked ? 8 : 3}
                  className={areaClass}
                />
              </>
            )}

            {field.kind === "lines" && (
              <>
                <label htmlFor={id} className={labelClass}>{field.label}</label>
                <textarea
                  id={id}
                  value={Array.isArray(value[field.key]) ? (value[field.key] as unknown[]).join("\n") : ""}
                  onChange={(e) => set(e.target.value.split("\n"))}
                  placeholder={field.placeholder}
                  rows={4}
                  className={areaClass}
                />
              </>
            )}

            {field.kind === "group" && (
              <fieldset className="rounded-xl border border-border/70 bg-background p-4">
                <legend className="px-1.5 text-[12px] font-semibold text-foreground">{field.label}</legend>
                <FieldsEditor fields={field.fields} value={asObj(value[field.key])} onChange={set} path={id} />
              </fieldset>
            )}

            {field.kind === "list" && (
              <ListEditor
                field={field}
                items={Array.isArray(value[field.key]) ? (value[field.key] as unknown[]) : []}
                onChange={set}
                path={id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * One image slot: a compact row that takes a dropped file or a click, with a
 * preview and Replace / Remove once there's a picture. The picture is kept once
 * the case study is saved. With `caption`, the caption box sits beside it.
 */
function ImageField({
  label, optional, value, onChange, caption,
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChange: (next: string) => void;
  caption?: { value: string; onChange: (next: string) => void };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      onChange(result.url);
    });
  }

  const pick = () => inputRef.current?.click();

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {/* With a caption: the image row and the caption box side by side, half the width each. */}
      <div className={caption ? "grid gap-2 sm:grid-cols-2" : undefined}>
        {/* One compact row: the preview, what to do, then the buttons. The whole row takes a dropped file. */}
        <div
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]); }}
          className={cn(
            "flex items-center gap-3 rounded-lg border p-2 transition-colors",
            value ? "border-border" : "border-dashed border-border",
            over && "border-primary bg-primary/10",
          )}
        >
          <button
            type="button"
            onClick={pick}
            disabled={isPending}
            aria-label={value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
            className="flex h-12 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground hover:text-primary transition-colors"
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={18} />
            )}
          </button>
          <div className="min-w-0 flex-1 text-[12px] leading-snug text-muted-foreground">
            {isPending ? (
              <span className="font-semibold text-foreground">Uploading…</span>
            ) : over ? (
              <span className="font-semibold text-primary">Drop to upload</span>
            ) : value ? null : (
              <>
                <span className="block font-semibold text-foreground">Drop an image or click to upload</span>
                JPG, PNG or WebP{optional ? " · nothing shows on the page if empty" : ""}
              </>
            )}
          </div>
          {value && !isPending && (
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={pick} className={rowButton}>Replace</button>
              <button type="button" onClick={() => onChange("")} aria-label={`Remove ${label.toLowerCase()}`} className={cn(rowButton, "px-2 hover:bg-negative/10 hover:text-negative")}>
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
        {caption && (
          <input
            type="text"
            value={caption.value}
            onChange={(e) => caption.onChange(e.target.value)}
            placeholder="Caption (optional)"
            aria-label={`${label} caption`}
            className={cn(fieldClass, "h-full")}
          />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
        className="hidden"
      />
      {error && <p className="mt-1.5 text-[12px] font-medium text-negative" role="alert">{error}</p>}
    </div>
  );
}

const rowButton =
  "flex items-center rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-foreground/80 hover:bg-muted transition-colors";

/** What to call an item in its header: its own title, name, label or value, whichever it has. */
function itemSummary(item: Obj): string | undefined {
  for (const key of ["title", "name", "label", "heading", "metric", "step", "value"]) {
    if (typeof item[key] === "string" && item[key]) return item[key] as string;
  }
  return undefined;
}

function ListEditor({
  field, items, onChange, path,
}: {
  field: Extract<Field, { kind: "list" }>;
  items: unknown[];
  onChange: (next: unknown[]) => void;
  path: string;
}) {
  function move(from: number, to: number) {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }
  const { gridRef, liftedIndex, tileStyle, handleProps, dropTarget } = useGridDrag(items.length, move);

  // In a grid it's the tile after the last card, as tall as the cards; on a row of its own it runs the full width.
  const addTile = field.grid && items.length % 4 !== 0;
  const addButton = (
    <AddItemButton onClick={() => onChange([...items, {}])} className={addTile ? "h-full min-h-[120px]" : undefined}>
      Add {field.itemLabel.toLowerCase()}
    </AddItemButton>
  );

  return (
    <div>
      <span className={labelClass}>{field.label}</span>
      <div className="space-y-2.5">
        <div ref={gridRef} className={field.grid ? "relative grid grid-cols-4 gap-2.5" : "space-y-2.5"}>
          {field.grid && dropTarget}
          {items.map((item, i) => (
            <ItemCard
              key={i}
              label={`${field.itemLabel} ${i + 1}`}
              summary={field.grid ? undefined : itemSummary(asObj(item))}
              onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
              move={field.grid ? undefined : { up: i > 0 ? () => move(i, i - 1) : undefined, down: i < items.length - 1 ? () => move(i, i + 1) : undefined }}
              drag={field.grid ? { handle: handleProps(i), lifted: liftedIndex === i, style: tileStyle(i) } : undefined}
            >
              <FieldsEditor
                fields={field.fields}
                value={asObj(item)}
                onChange={(next) => onChange(items.map((it, idx) => (idx === i ? next : it)))}
                path={`${path}-${i}`}
                stacked={field.grid}
              />
            </ItemCard>
          ))}
          {addTile && addButton}
        </div>
        {!addTile && addButton}
      </div>
    </div>
  );
}
