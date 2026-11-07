"use client";

import { useEffect, useState } from "react";
import { VioletOrb } from "./VioletOrb";

/**
 * Passes the current site theme down to the orb. The theme lives on
 * <html data-theme>, so a MutationObserver keeps the canvas palette in sync
 * when the visitor flips the toggle.
 */
export function OrbStage({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const read = () =>
      setDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return <VioletOrb className={className} dark={dark} />;
}
