import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  DownloadIcon,
  FilePenLineIcon,
  LoaderCircleIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { useEditor } from "../state/editorContext.js";
import { SAVE_STATUS } from "../hooks/useAutosave.js";

const STATUS_LABEL = {
  [SAVE_STATUS.SAVED]: "All changes saved",
  [SAVE_STATUS.DIRTY]: "Unsaved changes",
  [SAVE_STATUS.SAVING]: "Saving…",
  [SAVE_STATUS.ERROR]: "Save failed — press Ctrl+S",
};

export default function HeaderBar({ onDownload, exporting, saveStatus }) {
  const { state, dispatch } = useEditor();
  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  return (
    <header className="shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 z-20">
      <Link
        to="/app"
        title="Back to dashboard"
        aria-label="Back to dashboard"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
        <ArrowLeftIcon className="size-5" />
      </Link>

      <div className="flex items-center gap-2 min-w-0">
        <span className="hidden sm:flex size-8 rounded-lg bg-blue-100 items-center justify-center shrink-0">
          <FilePenLineIcon className="size-4 text-blue-600" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate max-w-[140px] sm:max-w-xs leading-tight">
            {state.fileName || "PDF Editor"}
          </p>
          <p
            className={`text-[11px] leading-tight ${
              saveStatus === SAVE_STATUS.ERROR
                ? "text-red-500 font-medium"
                : saveStatus === SAVE_STATUS.SAVING
                  ? "text-blue-500"
                  : "text-slate-400"
            }`}
            aria-live="polite">
            {STATUS_LABEL[saveStatus] ?? ""}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => dispatch({ type: "UNDO" })}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        className="p-2 rounded-xl text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors">
        <Undo2Icon className="size-5" />
      </button>
      <button
        onClick={() => dispatch({ type: "REDO" })}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
        className="p-2 rounded-xl text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors">
        <Redo2Icon className="size-5" />
      </button>

      <span className="w-px h-6 bg-slate-200 mx-1" aria-hidden="true" />

      <button
        onClick={onDownload}
        disabled={exporting}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white text-sm font-semibold pl-3.5 pr-4 py-2 rounded-full shadow-sm active:scale-95 transition-all">
        {exporting ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : (
          <DownloadIcon className="size-4" />
        )}
        <span className="hidden sm:inline">{exporting ? "Preparing…" : "Download"}</span>
      </button>
    </header>
  );
}
