import type { Metadata } from "next";
import { getPublishedPosts } from "@/app/lib/posts-db";
import { getSiteSettings } from "@/app/lib/settings-db";
import { Reveal } from "@/app/components/Reveal";
import { InsightsList } from "@/app/components/insights/InsightsList";

export const metadata: Metadata = {
  title: "Writing",
  // The same page also answers at /insights — this is the address search engines should keep.
  alternates: { canonical: "/insights" },
  description:
    "Insights on front-end development, technical SEO, accessibility, and the craft of building digital products.",
};

export default async function WritingPage() {
  const allPosts = await getPublishedPosts();
  const { blogPageHeading, blogPageIntro } = await getSiteSettings();

  return (
    <div className="min-h-screen bg-white">

      {/* Page header */}
      <div className="bg-zinc-950">
        <div className="max-w-(--site-max) mx-auto px-6 md:px-10 pt-36 md:pt-40 pb-14 md:pb-16">
          <Reveal>
            <h1
              className="font-extrabold text-white tracking-tight mb-4 md:mb-5"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)", letterSpacing: "-0.04em" }}
            >
              {blogPageHeading}
            </h1>
            <p className="text-[15.5px] text-zinc-400 max-w-xl leading-relaxed">
              {blogPageIntro}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Editorial List — Scalable with Progressive Load More */}
      <div className="max-w-(--site-max) mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-20 md:pb-24">
        <InsightsList posts={allPosts} initialLimit={6} />
      </div>
    </div>
  );
}
