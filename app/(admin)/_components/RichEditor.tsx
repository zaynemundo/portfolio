"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { uploadPostImage } from "@/app/actions/posts";

interface Props {
  content: string;
  onChange: (html: string) => void;
  /** Set false for a seamless, borderless look that blends into its container (e.g. Apple-Notes-style). Defaults to the boxed look used by Blog. */
  bordered?: boolean;
}

export function RichEditor({ content, onChange, bordered = true }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: "outline: none;",
        class:
          "max-w-none min-h-[320px] px-4 py-3 text-[14.5px] text-foreground/90 focus:outline-none " +
          "[&_p]:leading-relaxed [&_p]:mb-3 " +
          "[&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 " +
          "[&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic " +
          "[&_code]:bg-secondary [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] " +
          "[&_a]:text-primary [&_a]:underline " +
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:my-3 " +
          "[&_table]:w-full [&_table]:my-3 [&_table]:border-collapse " +
          "[&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:align-middle " +
          "[&_td]:border [&_td]:border-border [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:align-middle " +
          "[&_th_p]:mb-0 [&_td_p]:mb-0 " +
          "[&_.selectedCell]:bg-secondary/40",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={bordered ? "rounded-lg border border-border bg-card overflow-hidden" : ""}>
      <Toolbar bordered={bordered} editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, bordered }: { editor: NonNullable<ReturnType<typeof useEditor>>; bordered: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadPostImage(formData);
    if (result.ok && result.url) {
      editor.chain().focus().setImage({ src: result.url }).run();
    } else {
      window.alert(result.error ?? "Image upload failed.");
    }
  }
  const items: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }[] = [
    { label: "Bold", icon: <BoldIcon />, active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: <ItalicIcon />, active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() },
    { label: "Heading", icon: <HeadingIcon level={2} />, active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Subheading", icon: <HeadingIcon level={3} />, active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bulleted list", icon: <BulletListIcon />, active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: <OrderedListIcon />, active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: <QuoteIcon />, active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Code", icon: <CodeIcon />, active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run() },
  ];

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const inTable = editor.isActive("table");

  return (
    <div
      className={`flex flex-wrap items-center gap-0.5 ${
        bordered ? "px-2 py-1.5 border-b border-border bg-background" : "inline-flex px-1.5 py-1 rounded-full bg-secondary/60 mb-4"
      }`}
    >
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelected} />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
        title="Undo"
        className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
        title="Redo"
        className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <RedoIcon />
      </button>

      <div className="w-px self-stretch bg-secondary mx-1" />

      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          aria-label={item.label}
          title={item.label}
          className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
            item.active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
          }`}
        >
          {item.icon}
        </button>
      ))}
      <button
        type="button"
        onClick={setLink}
        aria-label="Link"
        title="Link"
        className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
          editor.isActive("link") ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
        }`}
      >
        <LinkIcon />
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Insert image"
        title="Insert image"
        className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
      >
        <ImageIcon />
      </button>

      <div className="w-px self-stretch bg-secondary mx-1" />

      {!inTable ? (
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          aria-label="Insert table"
          title="Insert table"
          className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
        >
          <TableIcon />
        </button>
      ) : (
        <>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} aria-label="Add column" title="Add column" className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
            <AddColumnIcon />
          </button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} aria-label="Add row" title="Add row" className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
            <AddRowIcon />
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} aria-label="Delete column" title="Delete column" className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
            <RemoveColumnIcon />
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} aria-label="Delete row" title="Delete row" className="h-7 w-7 flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
            <RemoveRowIcon />
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} aria-label="Delete table" title="Delete table" className="h-7 w-7 flex items-center justify-center rounded text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
            <TrashIcon />
          </button>
        </>
      )}
    </div>
  );
}

function iconProps() {
  return { width: 17, height: 17, viewBox: "0 0 20 20", fill: "none" as const, "aria-hidden": true };
}

function UndoIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M6 6H14.5a3.5 3.5 0 0 1 0 7H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3 5.5 6.5 9 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RedoIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M14 6H5.5a3.5 3.5 0 0 0 0 7H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 3 14.5 6.5 11 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BoldIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M6.5 4.5h5a2.75 2.75 0 0 1 0 5.5h-5v-5.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M6.5 10h5.5a2.75 2.75 0 0 1 0 5.5h-5.5V10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function ItalicIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M11.5 4.5h-4M8.5 15.5h-4M10 4.5 6 15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function HeadingIcon({ level }: { level: 2 | 3 }) {
  return (
    <svg {...iconProps()}>
      <path d="M4.5 4.5v11M11.5 4.5v11M4.5 10h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <text x="13.2" y="12.5" fontSize="6.5" fontWeight="700" fill="currentColor" stroke="none">{level}</text>
    </svg>
  );
}
function BulletListIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="4.5" cy="5.5" r="1" fill="currentColor" />
      <circle cx="4.5" cy="10" r="1" fill="currentColor" />
      <circle cx="4.5" cy="14.5" r="1" fill="currentColor" />
      <path d="M7.5 5.5h8M7.5 10h8M7.5 14.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function OrderedListIcon() {
  return (
    <svg {...iconProps()}>
      <text x="2.5" y="7.2" fontSize="5.5" fontWeight="600" fill="currentColor" stroke="none">1</text>
      <text x="2.5" y="11.7" fontSize="5.5" fontWeight="600" fill="currentColor" stroke="none">2</text>
      <text x="2.5" y="16.2" fontSize="5.5" fontWeight="600" fill="currentColor" stroke="none">3</text>
      <path d="M7.5 5.5h8M7.5 10h8M7.5 14.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5 6.5a2 2 0 0 0-2 2v1.5h2.5V13H3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 6.5a2 2 0 0 0-2 2v1.5h2.5V13H10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M7 6 3.5 10 7 14M13 6l3.5 4L13 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M8.5 11.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24l-1 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 8.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24l1-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3.5" y="4" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.2" cy="7.8" r="1.2" fill="currentColor" />
      <path d="M4.5 13.5 8 10l2.5 2.5L14 9l2 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TableIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3.5" y="4.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 8.5h13M3.5 12.5h13M9.5 4.5v11" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function AddColumnIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="4.5" width="7" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 6.5v7M12 10h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function AddRowIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 12v5M13 14.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function RemoveColumnIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="4.5" width="7" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 10h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function RemoveRowIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 14.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 6.5h12M8 6.5V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M14.5 6.5 14 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1l-.5-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.3 9.5v4M11.7 9.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
