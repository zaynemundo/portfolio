"use client";

import { useRef, useState, useTransition } from "react";
import { addDocument, deleteDocument, uploadDocument } from "@/app/actions/documents";

interface DocumentItem {
  id: string;
  name: string;
  fileUrl: string;
}

interface Owner {
  clientId?: string;
  projectId?: string;
}

export function DocumentList({ documents, ...owner }: { documents: DocumentItem[] } & Owner) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.set("file", file);

    uploadDocument(formData).then(async (result) => {
      if (!result.ok || !result.url) {
        setError(result.error ?? "Upload failed.");
        setIsUploading(false);
        return;
      }
      const added = await addDocument(file.name, result.url, owner);
      if (!added.ok) setError(added.error ?? "Something went wrong.");
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <h2 className="text-[13px] font-semibold text-foreground mb-3">Documents</h2>

      {documents.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground/70 mb-3">No documents yet.</p>
      ) : (
        <table className="w-full text-left mb-3">
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-border last:border-b-0 group">
                <td className="py-2 w-full">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-w-0 text-[12.5px] text-foreground/80 hover:text-foreground transition-colors"
                  >
                    <FileIcon />
                    <span className="truncate">{doc.name}</span>
                  </a>
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => startTransition(() => deleteDocument(doc.id, owner))}
                    className="text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 text-[13px]"
                    aria-label={`Delete ${doc.name}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <input
        ref={inputRef}
        type="file"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
        id={`doc-upload-${owner.clientId ?? owner.projectId}`}
      />
      <label
        htmlFor={`doc-upload-${owner.clientId ?? owner.projectId}`}
        className="block text-center cursor-pointer rounded-lg border border-dashed border-border text-muted-foreground text-[12px] font-medium py-2 hover:bg-card hover:text-foreground/90 transition-colors"
      >
        {isUploading ? "Uploading…" : "+ Add document"}
      </label>

      {error && <p className="text-[11.5px] text-destructive mt-2">{error}</p>}
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
      <path d="M5.5 3h6l3 3v11a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M11.5 3v3h3" />
    </svg>
  );
}
