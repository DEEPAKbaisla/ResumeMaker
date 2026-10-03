import { useEffect } from "react";

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      target.closest('input, textarea, [contenteditable="true"]'))
  );
}

/** Global editor keyboard shortcuts. */
export function useKeyboardShortcuts({ onDelete, onUndo, onRedo, onDuplicate, onEscape, onSave, enabled = true }) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }
      if (isTypingTarget(e.target)) {
        if (e.key === "Escape") e.target.blur?.();
        return;
      }
      switch (e.key) {
        case "Delete":
        case "Backspace":
          if (onDelete) {
            e.preventDefault();
            onDelete();
          }
          break;
        case "z":
        case "Z":
          if (!mod) return;
          e.preventDefault();
          if (e.shiftKey) onRedo?.();
          else onUndo?.();
          break;
        case "y":
        case "Y":
          if (!mod) return;
          e.preventDefault();
          onRedo?.();
          break;
        case "d":
        case "D":
          if (!mod) return;
          e.preventDefault();
          onDuplicate?.();
          break;
        case "Escape":
          onEscape?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDelete, onUndo, onRedo, onDuplicate, onEscape, onSave, enabled]);
}
