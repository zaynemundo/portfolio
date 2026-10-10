"use client";

import { ArrowDown, ArrowUp, ChevronRight, Trash2 } from "lucide-react";
import { RICH_SECTIONS, sectionHasContent, type Field } from "./rich-schema";

type Obj = Record<string, unknown>;

const inputClass =
  "w-full rounded-lg bg-card border border-border px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1";
const iconButton =
  "h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent";

function asObj(value: unknown): Obj {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : {};
}

/**
 * Structured editor for Project.richContent — one collapsible block per
 * section of the public case study page, in the order they appear there.
 */
export function RichContentEditor({ value, onChange }: { value: Obj; onChange: (next: Obj) => void }) {
  return (
    <div className="space-y-2">
      {RICH_SECTIONS.map((section) => {
        const filled = sectionHasContent(section, value);
        return (
          <details key={section.id} className="group rounded-lg border border-border bg-card">
            <summary className="flex items-center gap-2.5 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <ChevronRight size={14} className="text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
              <span className="text-[13.5px] font-semibold text-foreground">{section.title}</span>
              <span
                className={`ml-auto text-[10.5px] font-semibold uppercase tracking-wider ${filled ? "text-success" : "text-muted-foreground/50"}`}
              >
                {filled ? "Filled" : "Empty"}
              </span>
            </summary>
            <div className="px-4 pb-4 pt-1 border-t border-border">
              <p className="text-[12px] text-muted-foreground my-3">{section.hint}</p>
              <FieldsEditor fields={section.fields} value={value} onChange={onChange} path={section.id} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

function FieldsEditor({
  fields, value, onChange, path,
}: {
  fields: Field[];
  value: Obj;
  onChange: (next: Obj) => void;
  path: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-3 gap-y-3.5">
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
                  className={inputClass}
                />
              </>
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
                  className={inputClass}
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
                  className={`${inputClass} resize-y`}
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
                  className={`${inputClass} resize-y`}
                />
              </>
            )}

            {field.kind === "group" && (
              <fieldset className="rounded-lg border border-border bg-background/50 p-3.5">
                <legend className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</legend>
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
          <div key={i} className="rounded-lg border border-border bg-background/50 p-3.5">
            <div className="flex items-center gap-1 mb-2.5">
              <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {field.itemLabel} {i + 1}
              </span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${field.itemLabel} ${i + 1} up`} className={iconButton}>
                <ArrowUp size={13} />
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${field.itemLabel} ${i + 1} down`} className={iconButton}>
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${field.itemLabel} ${i + 1}`}
                className={`${iconButton} hover:text-destructive`}
              >
                <Trash2 size={13} />
              </button>
            </div>
            <FieldsEditor
              fields={field.fields}
              value={asObj(item)}
              onChange={(next) => onChange(items.map((it, idx) => (idx === i ? next : it)))}
              path={`${path}-${i}`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, {}])}
        className={`w-full rounded-lg border border-dashed border-border text-muted-foreground text-[12.5px] font-medium py-2 hover:bg-card hover:text-foreground/90 transition-colors ${items.length ? "mt-2.5" : ""}`}
      >
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </div>
  );
}
