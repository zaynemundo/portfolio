"use client";

import Image from "next/image";
import { saveSettings, saveAbout } from "../../actions/admin-profile";
import { RichEditor } from "../blog/RichEditor";

interface Props {
  aboutText: string;
  portraitUrl: string | null;
  cvPath: string;
}

const inp = "w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all";
const lbl = "block text-[12px] font-bold text-zinc-700 mb-1.5";
const card = "bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-6 space-y-5";

export function AboutForm({ aboutText, portraitUrl, cvPath }: Props) {
  return (
    <div className="space-y-8">
      {/* 1. About Bio Text Form */}
      <form action={saveAbout} className="space-y-4">
        <div className={card}>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-[15px] font-bold text-zinc-900">About Bio Text</h2>
              <p className="text-[11.5px] text-zinc-400">Appears in the About section of your homepage.</p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Live Content
            </span>
          </div>
          <RichEditor name="aboutText" defaultContent={aboutText} />
          <div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold hover:bg-blue-600 transition-colors shadow-2xs"
            >
              Save Bio Text
            </button>
          </div>
        </div>
      </form>

      {/* 2. Portrait & CV Assets Form */}
      <form action={saveSettings} encType="multipart/form-data" className="space-y-6">
        
        {/* Portrait Photo */}
        <div className={card}>
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-[15px] font-bold text-zinc-900">Portrait Photo</h2>
            <p className="text-[11.5px] text-zinc-400">Your professional portrait image used on the homepage.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6 pt-2">
            <div className="w-28 h-36 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
              {portraitUrl ? (
                <Image
                  src={portraitUrl}
                  alt="Portrait"
                  width={112}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center px-3">
                  <svg className="mx-auto mb-1 text-zinc-400" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[10px] font-medium text-zinc-400">No Photo</p>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className={lbl}>Upload New Portrait Image</label>
                <input
                  name="portraitFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full text-[13px] text-zinc-600 file:mr-3 file:px-3.5 file:py-2 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:text-[12px] file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors"
                />
                <p className="text-[11px] text-zinc-400 mt-1.5">Supported: JPG, PNG, WebP · Recommended 3:4 aspect ratio</p>
              </div>
              {portraitUrl ? (
                <div>
                  <label className={lbl}>Current Portrait Image URL</label>
                  <input name="portraitUrl" type="text" defaultValue={portraitUrl} className={`${inp} font-mono text-[11px]`} />
                </div>
              ) : (
                <input name="portraitUrl" type="hidden" value="" />
              )}
            </div>
          </div>
        </div>

        {/* CV / Resume Document */}
        <div className={card}>
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-[15px] font-bold text-zinc-900">Curriculum Vitae (PDF)</h2>
            <p className="text-[11.5px] text-zinc-400">PDF document for the Resume download actions across the website.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className={lbl}>Upload New CV Document (PDF)</label>
              <input
                name="cvFile"
                type="file"
                accept=".pdf"
                className="w-full text-[13px] text-zinc-600 file:mr-3 file:px-3.5 file:py-2 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:text-[12px] file:font-semibold file:cursor-pointer hover:file:bg-blue-100 transition-colors"
              />
              <p className="text-[11px] text-zinc-400 mt-1.5">Upload a clean PDF document.</p>
            </div>

            <div>
              <label className={lbl}>Current CV Path</label>
              <input
                name="cvPath"
                type="text"
                defaultValue={cvPath}
                className={`${inp} font-mono text-[11px]`}
              />
              {cvPath && (
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  <a href={cvPath} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
                    Preview current CV →
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pb-10">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold hover:bg-blue-600 transition-colors shadow-2xs"
          >
            Save Portrait &amp; CV Changes
          </button>
        </div>

      </form>
    </div>
  );
}

