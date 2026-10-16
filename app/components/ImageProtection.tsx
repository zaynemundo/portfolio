"use client";

import { useEffect } from "react";

/**
 * Makes the public site's pictures and videos harder to save: no right-click
 * menu, no dragging them out (the CSS in globals.css also stops the long-press
 * "Save image" on phones). It can't stop screenshots or someone reading the
 * page's code; it stops the casual ways.
 */
export function ImageProtection() {
  useEffect(() => {
    const isMedia = (target: EventTarget | null) =>
      target instanceof HTMLImageElement || target instanceof HTMLVideoElement || target instanceof HTMLCanvasElement;
    const block = (e: Event) => {
      if (isMedia(e.target)) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
