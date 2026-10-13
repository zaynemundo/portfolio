import type { Metadata } from "next";
import { documentKind } from "@/app/lib/document-kind";
import { getSharedDocument, recordSharedDocumentOpened, watermarkText } from "@/app/lib/shared-document";
import { ViewOnly } from "./ViewOnly";

interface Props {
  params: Promise<{ token: string }>;
}

// Private link: never cached, never indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shared document",
  robots: { index: false, follow: false },
};

/** The page a client opens from a shared document link. */
export default async function SharedDocumentPage({ params }: Props) {
  const { token } = await params;
  const doc = await getSharedDocument(token);

  if (!doc) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-5">
        <div className="max-w-sm text-center">
          <h1 className="text-[20px] font-bold text-zinc-900 mb-2">This link is no longer available</h1>
          <p className="text-[14px] text-zinc-500">It may have expired or been withdrawn. Please ask the sender for a new link.</p>
        </div>
      </main>
    );
  }

  await recordSharedDocumentOpened(doc.id);

  const kind = documentKind(doc.fileUrl);
  const fileHref = `/document/${token}/file`;
  const watermark = watermarkText(doc.client?.name);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:py-12">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-5">
          <h1 className="text-[18px] font-semibold text-zinc-900">{doc.name}</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Shared privately with you, to view only. Please don&rsquo;t copy it or pass this link on.
            {doc.shareExpiresAt &&
              ` Available until ${doc.shareExpiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          {kind === "image" ? (
            <ViewOnly watermark={watermark}>
              {/* eslint-disable-next-line @next/next/no-img-element -- served through the private file route, not the image optimizer */}
              <img src={fileHref} alt={doc.name} draggable={false} className="block w-full h-auto select-none" />
            </ViewOnly>
          ) : kind === "pdf" ? (
            // The watermark is printed into the PDF itself; the viewer's own toolbar (with its save button) is switched off where the browser allows.
            <iframe src={`${fileHref}#toolbar=0&navpanes=0`} title={doc.name} className="block w-full h-[80vh]" />
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] text-zinc-600 mb-4">This type of file can&rsquo;t be shown in the browser.</p>
              <a href={fileHref} className="inline-flex rounded-lg bg-zinc-900 text-white text-[13.5px] font-semibold px-4 py-2 hover:bg-zinc-700 transition-colors">
                Open file
              </a>
            </div>
          )}
        </div>

        {kind === "pdf" && (
          <p className="mt-3 text-[13px] text-zinc-500">
            Can&rsquo;t see every page?{" "}
            <a href={fileHref} target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-900 underline underline-offset-2">
              Open it on its own
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
