"use client";

import { useState, useCallback } from "react";
import type { Chapter } from "@/app/data/aboutChapters";

/**
 * Tracks which About chapter is currently active.
 *
 * Used by AboutStorySection — call setActiveChapter from an
 * IntersectionObserver callback in the parent.
 */
export function useAboutStory(chapters: Chapter[]) {
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
    /** "01" – "05" */
    formattedActiveChapter: String(activeIndex + 1).padStart(2, "0"),
    /** "05" */
    formattedTotalChapters: String(chapters.length).padStart(2, "0"),
    setActiveChapter,
  };
}
