"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useEffect } from "react";

interface Props {
  defaultContent?: string;
  name: string;
}

const btn = "px-2 py-1.5 rounded text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors";
const activeCls = "bg-violet-100 text-violet-700";

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${btn} ${active ? activeCls : ""}`}
    >
      {children}
    </button>
  );
}

export function RichEditor({ defaultContent, name }: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Write your post content here…",
      }),
    ],
    content: defaultContent || "",
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        hiddenRef.current.value = editor.getHTML();
      }
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
    },
  });

  // Sync initial value into hidden input on mount
  useEffect(() => {
    if (hiddenRef.current && editor) {
      hiddenRef.current.value = editor.getHTML();
    }
  }, [editor]);

  if (!editor) return null;

  const Divider = () => <span className="w-px h-5 bg-zinc-200 mx-0.5 self-center" />;

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
      {/* Hidden input that carries the HTML value into the form action */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultContent || ""} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-zinc-50 border-b border-zinc-200">
        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <Divider />
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <Divider />
        <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <span className="font-mono">&ldquo;</span>
        </ToolbarButton>
        <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <span className="font-mono text-[10px]">{`</>`}</span>
        </ToolbarButton>
        <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <span className="font-mono text-[10px]">`code`</span>
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―――</ToolbarButton>
        <Divider />
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4h5a3 3 0 010 6H4M2 4l2-2M2 4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 4H5a3 3 0 000 6h3M10 4l-2-2M10 4l-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      <style>{`
        .rich-editor-content {
          min-height: 400px;
          padding: 20px 24px;
          font-size: 13.5px;
          line-height: 1.8;
          color: #3f3f46;
          outline: none;
          background: white;
        }
        .rich-editor-content p { margin: 0 0 1em; }
        .rich-editor-content h2 { font-size: 1.25rem; font-weight: 700; color: #18181b; margin: 1.75rem 0 0.625rem; }
        .rich-editor-content h3 { font-size: 1.05rem; font-weight: 700; color: #18181b; margin: 1.4rem 0 0.5rem; }
        .rich-editor-content ul { list-style: disc; padding-left: 1.25rem; margin: 0 0 1em; }
        .rich-editor-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0 0 1em; }
        .rich-editor-content li { margin-bottom: 0.25em; }
        .rich-editor-content blockquote { border-left: 3px solid #d4d4d8; padding-left: 1rem; color: #71717a; margin: 1rem 0; font-style: italic; }
        .rich-editor-content pre { background: #f4f4f5; border-radius: 6px; padding: 12px 16px; font-size: 12px; overflow-x: auto; margin: 1em 0; }
        .rich-editor-content code { background: #f4f4f5; border-radius: 4px; padding: 1px 5px; font-size: 12px; font-family: monospace; }
        .rich-editor-content pre code { background: none; padding: 0; }
        .rich-editor-content hr { border: none; border-top: 1px solid #e4e4e7; margin: 1.5em 0; }
        .rich-editor-content strong { font-weight: 700; color: #18181b; }
        .rich-editor-content em { font-style: italic; }
        .rich-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #a1a1aa;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
}
