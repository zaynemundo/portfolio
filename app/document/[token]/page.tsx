import type { Metadata } from "next";
import { documentKind } from "@/app/lib/document-kind";
import { getSharedDocument } from "@/app/lib/shared-document";

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

  const kind = documentKind(doc.fileUrl);
  const fileHref = `/document/${token}/file`;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:py-12">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-5">
          <h1 className="text-[18px] font-semibold text-zinc-900">{doc.name}</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Shared privately with you. Please don&rsquo;t pass this link on.
            {doc.shareExpiresAt &&
              ` Available until ${doc.shareExpiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- served through the private file route, not the image optimizer
            <img src={fileHref} alt={doc.name} className="block w-full h-auto" />
          ) : kind === "pdf" ? (
            <iframe src={fileHref} title={doc.name} className="block w-full h-[80vh]" />
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] text-zinc-600 mb-4">This type of file can&rsquo;t be shown in the browser.</p>
              <a href={fileHref} className="inline-flex rounded-lg bg-zinc-900 text-white text-[13.5px] font-semibold px-4 py-2 hover:bg-zinc-700 transition-colors">
                Open file
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
