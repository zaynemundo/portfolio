"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { uploadProjectImage } from "@/app/actions/projects";
import { RICH_SECTIONS, sectionHasContent, type Field } from "./rich-schema";
import { Select } from "@/app/(admin)/_components/Select";
import { StatusPill } from "@/app/(admin)/_components/ui/StatusPill";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { ItemCard, AddItemButton, fieldClass, areaClass, labelClass } from "@/app/(admin)/_components/Section";
import { cn } from "@/app/lib/utils";

type Obj = Record<string, unknown>;

function asObj(value: unknown): Obj {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : {};
}

/**
 * The detailed write-up: one fold-away card per chapter of the public case
 * study page, in the order they appear there. The chapters every case study
 * has are always listed; the occasional ones (user research, wireframes…)
 * only show once they have content or are added from the menu at the bottom.
 */
export function RichContentEditor({ value, onChange }: { value: Obj; onChange: (next: Obj) => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());

  const sections = RICH_SECTIONS.filter((section) => !section.elsewhere && !section.retired);
  const shown = sections.filter((section) => !section.optional || added.has(section.id) || sectionHasContent(section, value));
  const addable = sections.filter((section) => !shown.includes(section));

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function add(id: string) {
    setAdded((prev) => new Set(prev).add(id));
    setOpen((prev) => new Set(prev).add(id));
  }

  return (
    <div className="space-y-3">
      {shown.map((section) => {
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

      {addable.length > 0 && (
        <div className="max-w-sm">
          <Select
            value=""
            onChange={add}
            placeholder="Add another chapter…"
            options={addable.map((section) => ({ value: section.id, label: section.title }))}
            className="w-full flex items-center justify-between gap-2 rounded-full border border-dashed border-border bg-transparent px-4 py-2 text-[12.5px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          />
        </div>
      )}
    </div>
  );
}

/** The fields of one chapter, or of one item in a list. Also used on the Basics tab for the extra sidebar rows. */
export function FieldsEditor({
  fields, value, onChange, path,
}: {
  fields: Field[];
  value: Obj;
  onChange: (next: Obj) => void;
  path: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4">
      {fields.map((field) => {
        const id = `${path}-${field.key}`;
        const set = (next: unknown) => onChange({ ...value, [field.key]: next });
        const half = "half" in field && field.half;

        return (
          <div key={field.key} className={half ? "" : "sm:col-span-2"}>
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
                value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                onChange={set}
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
                  rows={3}
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

const smallButton =
  "rounded-full border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground/80 hover:bg-muted transition-colors disabled:opacity-50";

/** One image slot: a preview with Upload / Replace and Remove. The picture is kept once the case study is saved. */
function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/50 text-muted-foreground">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={18} />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isPending} className={smallButton}>
            {isPending ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && !isPending && (
            <button type="button" onClick={() => onChange("")} className={cn(smallButton, "text-muted-foreground")}>
              Remove
            </button>
          )}
        </div>
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

  return (
    <div>
      <span className={labelClass}>{field.label}</span>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <ItemCard
            key={i}
            label={`${field.itemLabel} ${i + 1}`}
            summary={itemSummary(asObj(item))}
            onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            move={{ up: i > 0 ? () => move(i, i - 1) : undefined, down: i < items.length - 1 ? () => move(i, i + 1) : undefined }}
          >
            <FieldsEditor
              fields={field.fields}
              value={asObj(item)}
              onChange={(next) => onChange(items.map((it, idx) => (idx === i ? next : it)))}
              path={`${path}-${i}`}
            />
          </ItemCard>
        ))}
        <AddItemButton onClick={() => onChange([...items, {}])}>Add {field.itemLabel.toLowerCase()}</AddItemButton>
      </div>
    </div>
  );
}
