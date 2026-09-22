"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
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
          "[&_a]:text-purple-400 [&_a]:underline",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
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

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 bg-zinc-950 px-2 py-1.5">
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
    </div>
  );
}
