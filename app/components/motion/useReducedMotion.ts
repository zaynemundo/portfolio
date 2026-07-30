"use client";

import { useSyncExternalStore } from "react";

const MQ = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(MQ).matches;
const getServerSnapshot = () => false;

/** Returns true when the user prefers reduced motion. SSR-safe. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
