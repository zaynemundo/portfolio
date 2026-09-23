"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";

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
      TableKit.configure({ table: { resizable: true } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[320px] px-4 py-3 text-[14.5px] text-zinc-200 focus:outline-none " +
          "[&_p]:leading-relaxed [&_p]:mb-3 " +
          "[&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mt-6 [&_h2]:mb-2 " +
          "[&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-zinc-100 [&_h3]:mt-5 [&_h3]:mb-2 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-700 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400 [&_blockquote]:italic " +
          "[&_code]:bg-zinc-800 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] " +
          "[&_a]:text-purple-400 [&_a]:underline " +
          "[&_table]:w-full [&_table]:my-3 [&_table]:border-collapse " +
          "[&_th]:border [&_th]:border-zinc-700 [&_th]:bg-zinc-800 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold " +
          "[&_td]:border [&_td]:border-zinc-700 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:align-top " +
          "[&_.selectedCell]:bg-zinc-700/40",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={bordered ? "rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden" : ""}>
      <Toolbar bordered={bordered} editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, bordered }: { editor: NonNullable<ReturnType<typeof useEditor>>; bordered: boolean }) {
  const items: { label: string; active: boolean; onClick: () => void }[] = [
    { label: "B", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() },
    { label: "I", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() },
    { label: "H2", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "H3", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "• List", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { label: "1. List", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Code", active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run() },
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
      className={`flex flex-wrap items-center gap-1 px-2 py-1.5 ${
        bordered ? "border-b border-zinc-800 bg-zinc-950" : "border-b border-zinc-800/60 -mx-1"
      }`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={`px-2.5 py-1.5 rounded text-[12.5px] font-medium transition-colors ${
            item.active ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={setLink}
        className={`px-2.5 py-1.5 rounded text-[12.5px] font-medium transition-colors ${
          editor.isActive("link") ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        }`}
      >
        Link
      </button>

      <div className="w-px self-stretch bg-zinc-800 mx-1" />

      {!inTable ? (
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="px-2.5 py-1.5 rounded text-[12.5px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          Table
        </button>
      ) : (
        <>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2.5 py-1.5 rounded text-[12.5px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            +Col
          </button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2.5 py-1.5 rounded text-[12.5px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            +Row
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2.5 py-1.5 rounded text-[12.5px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            −Col
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-2.5 py-1.5 rounded text-[12.5px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            −Row
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2.5 py-1.5 rounded text-[12.5px] font-medium text-red-400/80 hover:bg-zinc-800 hover:text-red-400 transition-colors">
            Delete table
          </button>
        </>
      )}
    </div>
  );
}
