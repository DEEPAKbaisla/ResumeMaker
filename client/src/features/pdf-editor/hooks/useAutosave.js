import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const SAVE_STATUS = {
  SAVED: "saved",
  DIRTY: "dirty",
  SAVING: "saving",
  ERROR: "error",
};

/**
 * Debounced autosave for the editor element list. Returns the current save
 * status plus a flush() that saves immediately (used by Ctrl+S).
 */
export function useAutosave({ documentId, elements, dirty, token, onSave }) {
  const [status, setStatus] = useState(SAVE_STATUS.SAVED);
  const timerRef = useRef(null);
  const latest = useRef({ elements, dirty });

  latest.current = { elements, dirty };

  const persist = useCallback(async () => {
    if (!documentId || !latest.current.dirty) return;
    setStatus(SAVE_STATUS.SAVING);
    try {
      await onSave(documentId, latest.current.elements, token);
      setStatus(SAVE_STATUS.SAVED);
    } catch {
      setStatus(SAVE_STATUS.ERROR);
      toast.error("Could not save your changes. Press Ctrl+S to retry.");
    }
  }, [documentId, token, onSave]);

  useEffect(() => {
    if (!dirty) return;
    setStatus(SAVE_STATUS.DIRTY);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(persist, 1500);
    return () => clearTimeout(timerRef.current);
  }, [elements, dirty, persist]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handler = (e) => {
      if (latest.current.dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const flush = useCallback(() => {
    clearTimeout(timerRef.current);
    return persist();
  }, [persist]);

  return { status, flush };
}
