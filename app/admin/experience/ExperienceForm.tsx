"use client";

import type { Experience } from "../../generated/prisma/client";

interface Props {
  entry?: Experience | null;
  action: (data: FormData) => Promise<void>;
}

const inp = "w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors";
const lbl = "block text-[12px] font-semibold text-zinc-600 mb-1.5";
const card = "bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5";

export function ExperienceForm({ entry, action }: Props) {
  return (
    <form action={action} className="space-y-6">
      <div className={card}>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">Entry details</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Type <span className="text-red-500">*</span></label>
            <select name="type" defaultValue={entry?.type ?? "employment"} required className={inp}>
              <option value="employment">Employment</option>
              <option value="education">Education</option>
              <option value="certification">Certification</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Currently here?</label>
            <select name="current" defaultValue={entry?.current ? "true" : "false"} className={inp}>
              <option value="false">No</option>
              <option value="true">Yes — mark as Current</option>
            </select>
          </div>
        </div>

        <div>
          <label className={lbl}>Company / Institution <span className="text-red-500">*</span></label>
          <input name="company" type="text" required defaultValue={entry?.company ?? ""} className={inp}
            placeholder="Creativo FZCO" />
        </div>

        <div>
          <label className={lbl}>Role / Qualification <span className="text-red-500">*</span></label>
          <input name="role" type="text" required defaultValue={entry?.role ?? ""} className={inp}
            placeholder="Front-End Developer & Web Designer" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Period <span className="text-red-500">*</span></label>
            <input name="period" type="text" required defaultValue={entry?.period ?? ""} className={inp}
              placeholder="Oct 2021 – Present" />
          </div>
          <div>
            <label className={lbl}>Location</label>
            <input name="location" type="text" defaultValue={entry?.location ?? ""} className={inp}
              placeholder="United Arab Emirates" />
          </div>
        </div>

        <div>
          <label className={lbl}>Description / Responsibilities</label>
          <textarea name="description" rows={5} defaultValue={entry?.description ?? ""} className={`${inp} resize-y`}
            placeholder="Delivered 10+ responsive websites… (one paragraph or a few bullet points)" />
          <p className="text-[11px] text-zinc-400 mt-1">This appears on your public experience section. Keep it concise.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-10">
        <button type="submit" className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors shadow-sm">
          {entry ? "Save changes" : "Add entry"}
        </button>
        <a href="/admin/experience" className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</a>
      </div>
    </form>
  );
}
