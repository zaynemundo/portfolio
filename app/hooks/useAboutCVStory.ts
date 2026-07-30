"use client";

import { useState, useCallback } from "react";
import type { CVChapter } from "@/app/data/aboutCVChapters";

/**
 * Tracks which About CV chapter is currently active.
 * Used by AboutCVSection — call setActiveChapter from an
 * IntersectionObserver callback in the parent.
 */
export function useAboutCVStory(chapters: CVChapter[]) {
  const [activeIndex, setActiveIndex] = useState(0);

  const setActiveChapter = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, chapters.length - 1)));
    },
    [chapters.length],
  );

  return {
    activeIndex,
    activeChapter: chapters[activeIndex],
    totalChapters: chapters.length,
    /** "01" – "06" */
    formattedActiveChapter: String(activeIndex + 1).padStart(2, "0"),
    /** "06" */
    formattedTotalChapters: String(chapters.length).padStart(2, "0"),
    setActiveChapter,
  };
}
