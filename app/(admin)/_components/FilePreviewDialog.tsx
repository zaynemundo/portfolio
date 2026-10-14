"use client";

import { ExternalLink } from "lucide-react";
import { Modal } from "@/app/(admin)/_components/Modal";

/** An uploaded file shown full size in a dialog: an image, or a PDF in a scrolling frame. */
export function FilePreviewDialog({
  title, url, kind, onClose,
}: {
  title: string;
  url: string;
  kind: "image" | "pdf" | "other";
  onClose: () => void;
}) {
  return (
    <Modal open onClose={onClose} title={title} maxWidthClassName={kind === "image" ? "max-w-3xl" : "max-w-5xl"}>
      <div className={`${kind === "image" ? "h-[70vh]" : "h-[72vh]"} overflow-auto rounded-lg border border-border bg-background`}>
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- a preview of an uploaded file of unknown size
          <img src={url} alt={title} className="mx-auto block h-full max-w-full object-contain" />
        ) : kind === "pdf" ? (
          <iframe src={url} title={title} className="block h-full w-full" />
        ) : (
          <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">This type of file can&rsquo;t be previewed here.</p>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 transition-colors">
          <ExternalLink size={13} />
          Open in a new tab
        </a>
      </div>
    </Modal>
  );
}
