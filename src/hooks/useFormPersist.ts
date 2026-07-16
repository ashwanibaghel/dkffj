import { useState, useEffect, useRef } from "react";

/**
 * useFormPersist — Saves form state to sessionStorage automatically.
 * On page refresh, restores saved state. Clears after successful submit.
 *
 * @param key      Unique storage key per form (e.g. "membership_form")
 * @param initial  Initial state values
 * @param ttlMins  Time-to-live in minutes (default 120 = 2 hours)
 */
export function useFormPersist<T extends Record<string, any>>(
  key: string,
  initial: T,
  ttlMins: number = 120
): [T, (updater: Partial<T> | ((prev: T) => T)) => void, () => void] {
  const storageKey = `formPersist_${key}`;

  const [state, setStateInternal] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return initial;
      const parsed = JSON.parse(raw);
      // TTL check
      if (parsed.__savedAt) {
        const ageMs = Date.now() - parsed.__savedAt;
        if (ageMs > ttlMins * 60 * 1000) {
          sessionStorage.removeItem(storageKey);
          return initial;
        }
      }
      // Merge with initial to pick up any new fields added in code
      const { __savedAt, ...data } = parsed;
      return { ...initial, ...data };
    } catch {
      return initial;
    }
  });

  const isFirstRender = useRef(true);

  // Save to sessionStorage on every state change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      const toSave = { ...state, __savedAt: Date.now() };
      sessionStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {
      // storage quota exceeded — ignore silently
    }
  }, [state, storageKey]);

  const setState = (updater: Partial<T> | ((prev: T) => T)) => {
    setStateInternal((prev) => {
      if (typeof updater === "function") return updater(prev);
      return { ...prev, ...updater };
    });
  };

  const clearSaved = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
  };

  return [state, setState, clearSaved];
}
