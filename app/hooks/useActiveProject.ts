"use client";

import { useSyncExternalStore } from "react";

/* ─── Module-level store ──────────────────────────────────────────────────── */

interface State {
  activeIndex: number;
  total: number;
  overProjects: boolean;
}

const DEFAULT: State = { activeIndex: 0, total: 0, overProjects: false };
let state: State = DEFAULT;
const listeners = new Set<() => void>();

function dispatch(partial: Partial<State>) {
  const next = { ...state, ...partial };
  if (
    next.activeIndex === state.activeIndex &&
    next.total === state.total &&
    next.overProjects === state.overProjects
  ) {
    return; // nothing changed — do not notify
  }
  state = next;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const getSnapshot = () => state;
const getServerSnapshot = () => DEFAULT;

/* ─── Stable setters ──────────────────────────────────────────────────────── *
 * Defined at module level so they are the same reference across renders.
 * Components that only WRITE should import these directly — not call the hook.
 * This prevents those components from subscribing to the store and avoids
 * the re-render → new-function-ref → effect-re-run → re-dispatch loop.
 * ─────────────────────────────────────────────────────────────────────────── */

export function setActiveProject(i: number) { dispatch({ activeIndex: i }); }
export function setTotal(n: number) { dispatch({ total: n }); }
export function setOverProjects(v: boolean) { dispatch({ overProjects: v }); }

/* ─── Read-only hook ──────────────────────────────────────────────────────── *
 * Only components that DISPLAY state (e.g. Nav) should call this hook.
 * ─────────────────────────────────────────────────────────────────────────── */

export function useActiveProject() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    activeIndex: s.activeIndex,
    total: s.total,
    overProjects: s.overProjects,
    /** "01" – "99" */
    formatted: String(s.activeIndex + 1).padStart(2, "0"),
    /** "04" – total padded */
    totalFormatted: String(Math.max(s.total, 1)).padStart(2, "0"),
  };
}
