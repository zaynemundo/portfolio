"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, ImagePlus, Trash2 } from "lucide-react";
import { uploadProjectImage } from "@/app/actions/projects";
import { RICH_SECTIONS, sectionHasContent, type Field } from "./rich-schema";
import { StatusPill } from "@/app/(admin)/_components/ui/StatusPill";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { ItemCard, AddItemButton, fieldClass, areaClass, labelClass, pillButtonClass, RequiredMark } from "@/app/(admin)/_components/Section";
import { useGridDrag } from "@/app/(admin)/_components/useGridDrag";
import { cn } from "@/app/lib/utils";
import { TileGridEditor } from "@/app/(admin)/_components/TileGridEditor";

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
  fields, value, onChange, path, stacked, areaRows,
}: {
  fields: Field[];
  value: Obj;
  onChange: (next: Obj) => void;
  path: string;
  /** One field per row, even the half-width ones (for narrow cards in a grid). */
  stacked?: boolean;
  /** Height of the long text boxes, in rows. */
  areaRows?: number;
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
                <label htmlFor={id} className={labelClass}>{field.label}{isRequired(field) && <RequiredMark />}</label>
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
                <label htmlFor={id} className={labelClass}>{field.label}{isRequired(field) && <RequiredMark />}</label>
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
                <label htmlFor={id} className={labelClass}>{field.label}{isRequired(field) && <RequiredMark />}</label>
                <textarea
                  id={id}
                  value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                  onChange={(e) => set(e.target.value)}
                  placeholder={field.placeholder}
                  rows={areaRows ?? (stacked ? 8 : 3)}
                  className={areaClass}
                />
              </>
            )}

            {field.kind === "lines" && (
              <>
                <label htmlFor={id} className={labelClass}>{field.label}{isRequired(field) && <RequiredMark />}</label>
                <textarea
                  id={id}
                  value={Array.isArray(value[field.key]) ? (value[field.key] as unknown[]).join("\n") : ""}
                  onChange={(e) => set(e.target.value.split("\n"))}
                  placeholder={field.placeholder}
                  // Tall enough for every line to show: about two rows per paragraph, between 6 and 24.
                  rows={Math.min(24, Math.max(6, (Array.isArray(value[field.key]) ? (value[field.key] as unknown[]).length : 0) * 2 + 2))}
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
  const drop = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(true); },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]); },
  };

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {value ? (
        /* A real preview beside its caption and buttons. Dropping a file on it replaces the image. */
        <div {...drop} className={cn("flex gap-4 rounded-xl border p-3 transition-colors", over ? "border-primary bg-primary/10" : "border-border")}>
          <button
            type="button"
            onClick={pick}
            disabled={isPending}
            aria-label={`Replace ${label.toLowerCase()}`}
            className="group relative w-44 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="aspect-[16/10] w-full object-cover" />
            <span className={cn("absolute inset-0 flex items-center justify-center bg-black/50 text-[12px] font-semibold text-white transition-opacity", isPending || over ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
              {isPending ? "Uploading…" : over ? "Drop to replace" : "Replace"}
            </span>
          </button>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
            {caption ? (
              <input
                type="text"
                value={caption.value}
                onChange={(e) => caption.onChange(e.target.value)}
                placeholder="Caption (optional)"
                aria-label={`${label} caption`}
                className={fieldClass}
              />
            ) : (
              <span className="truncate text-[12px] text-muted-foreground">{decodeURIComponent(value.split("/").pop() ?? "")}</span>
            )}
            <div className="flex gap-1.5">
              <button type="button" onClick={pick} disabled={isPending} className={pillButtonClass}>Replace</button>
              <button type="button" onClick={() => onChange("")} className={cn(pillButtonClass, "gap-1.5 hover:bg-negative/10 hover:text-negative")}>
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty: one drop zone. The caption appears once there's an image to caption. */
        <button
          type="button"
          onClick={pick}
          disabled={isPending}
          {...drop}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-colors",
            over ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5",
          )}
        >
          <span className="flex h-12 w-[72px] shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ImagePlus size={18} />
          </span>
          <span className="text-[12px] leading-snug text-muted-foreground">
            <span className="block font-semibold text-foreground">{isPending ? "Uploading…" : over ? "Drop to upload" : "Drop an image or click to upload"}</span>
            JPG, PNG or WebP{optional ? " · nothing shows on the page if empty" : ""}
          </span>
        </button>
      )}
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


/** Whether a field must be filled in for its item or section to count. */
function isRequired(field: Field): boolean {
  return Boolean((field as { required?: boolean }).required);
}

/** What to call an item in its header: its own title, name, label or value, whichever it has. */
function itemSummary(item: Obj): string | undefined {
  for (const key of ["title", "name", "label", "heading", "area", "metric", "step", "value"]) {
    if (typeof item[key] === "string" && item[key]) return item[key] as string;
  }
  return undefined;
}

/** Long items as tiles: title, picture and a count on the tile; everything else in a dialog. */
function TileListEditor({
  field, items, onChange, path,
}: {
  field: Extract<Field, { kind: "list" }>;
  items: unknown[];
  onChange: (next: unknown[]) => void;
  path: string;
}) {
  const imageKey = field.fields.find((f) => f.kind === "image")?.key;
  const subList = field.fields.find((f): f is Extract<Field, { kind: "list" }> => f.kind === "list");
  // The other short texts (e.g. before and after) make the tile's second line.
  const textKeys = field.fields.filter((f) => f.kind === "text").map((f) => f.key);
  const wide = Boolean(subList || imageKey);
  return (
    <div>
      <span className={labelClass}>{field.label}{field.required && <RequiredMark />}</span>
      <TileGridEditor<Obj>
        items={items.map(asObj)}
        onChange={onChange}
        itemLabel={field.itemLabel}
        newItem={() => ({})}
        saveHint="Save changes"
        modalWidth={wide ? "max-w-5xl" : "max-w-2xl"}
        titleOf={(item) => itemSummary(item) ?? ""}
        renderMeta={(item) => {
          if (!subList) return null;
          const n = Array.isArray(item[subList.key]) ? (item[subList.key] as unknown[]).length : 0;
          return n > 0 ? `${n} ${subList.itemLabel.toLowerCase()}${n === 1 ? "" : "s"}` : null;
        }}
        renderPreview={(item) => {
          const image = imageKey && typeof item[imageKey] === "string" ? (item[imageKey] as string) : "";
          return (
            <span className="flex items-center gap-3">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-12 w-[72px] shrink-0 rounded-md object-cover" />
              )}
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-snug text-foreground">{itemSummary(item) || "Untitled"}</span>
                {(() => {
                  const summary = itemSummary(item);
                  const rest = textKeys.map((k) => item[k]).filter((v): v is string => typeof v === "string" && v !== "" && v !== summary);
                  return rest.length > 0 && <span className="mt-0.5 block line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{rest.join(" → ")}</span>;
                })()}
              </span>
            </span>
          );
        }}
        renderEditor={(item, update, i) => (
          <FieldsEditor fields={field.fields} value={item} onChange={(next) => update(next)} path={`${path}-${i}`} />
        )}
      />
    </div>
  );
}

type ListProps = {
  field: Extract<Field, { kind: "list" }>;
  items: unknown[];
  onChange: (next: unknown[]) => void;
  path: string;
};

function ListEditor(props: ListProps) {
  return props.field.tiles ? <TileListEditor {...props} /> : <CardListEditor {...props} />;
}

function CardListEditor({ field, items, onChange, path }: ListProps) {
  function move(from: number, to: number) {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }
  const { gridRef, liftedIndex, tileStyle, handleProps, dropTarget } = useGridDrag(items.length, move);

  // In a grid it's the tile after the last card, as tall as the cards; on a row of its own it runs the full width.
  const addTile = field.grid && items.length % field.grid !== 0;
  const addButton = (
    <AddItemButton onClick={() => onChange([...items, {}])} className={addTile ? "h-full min-h-[120px]" : undefined}>
      Add {field.itemLabel.toLowerCase()}
    </AddItemButton>
  );

  return (
    <div>
      <span className={labelClass}>{field.label}{field.required && <RequiredMark />}</span>
      <div className="space-y-2.5">
        <div ref={gridRef} className={field.grid === 4 ? "relative grid grid-cols-4 gap-2.5" : field.grid === 2 ? "relative grid grid-cols-2 gap-2.5" : "space-y-2.5"}>
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
                stacked={Boolean(field.grid)}
                areaRows={field.grid === 2 ? 4 : undefined}
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
