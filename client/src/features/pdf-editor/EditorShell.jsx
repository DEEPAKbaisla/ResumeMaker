import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import HeaderBar from "./components/HeaderBar.jsx";
import Toolbar from "./components/Toolbar.jsx";
import ThumbnailRail from "./components/ThumbnailRail.jsx";
import Workspace from "./components/Workspace.jsx";
import PropertiesPanel from "./components/PropertiesPanel.jsx";
import SignatureModal from "./components/SignatureModal.jsx";
import { useEditor } from "./state/editorContext.js";
import { createPdfDocumentProxy } from "./utils/pdfjs.js";
import {
  SAVE_STATUS,
  useAutosave,
} from "./hooks/useAutosave.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";
import {
  exportEditedPdf,
  getErrorMessage,
  saveEditorState,
} from "./services/api.js";
import { TOOLS } from "./utils/constants.js";
import { fileToEmbeddableDataUrl } from "./utils/imageUtils.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

export default function EditorShell({ documentMeta, pdfBytes, token, onClose }) {
  const { state, dispatch } = useEditor();
  const [pdfDoc, setPdfDoc] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const workspaceApiRef = useRef(null);
  const imageInputRef = useRef(null);

  /* ---------------- document lifecycle ---------------- */

  useEffect(() => {
    let cancelled = false;
    createPdfDocumentProxy(pdfBytes)
      .then((proxy) => {
        if (!cancelled) setPdfDoc(proxy);
      })
      .catch((error) => {
        console.error("PDF parse error:", error?.message);
        toast.error(
          /password/i.test(error?.message ?? "")
            ? "This PDF is password-protected."
            : "This file could not be opened as a PDF."
        );
        onClose?.();
      });
    return () => {
      cancelled = true;
    };
  }, [pdfBytes, onClose]);

  useEffect(() => {
    if (!documentMeta) return undefined;
    dispatch({
      type: "LOAD_DOCUMENT",
      documentId: documentMeta._id,
      fileName: documentMeta.fileName,
      pagesMeta: documentMeta.pages,
      elements: documentMeta.editorState?.elements ?? [],
    });
    return () => dispatch({ type: "RESET_EDITOR" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentMeta?._id]);

  /* ---------------- persistence ---------------- */

  const handleSave = useCallback(
    (id, elements, authToken) => saveEditorState(id, elements, authToken),
    []
  );

  const { status: saveStatus, flush } = useAutosave({
    documentId: state.documentId,
    elements: state.elements,
    dirty: state.dirty,
    token,
    onSave: handleSave,
  });

  /* ---------------- export ---------------- */

  const handleDownload = useCallback(async () => {
    flush();
    setExporting(true);
    const toastId = toast.loading("Preparing your PDF…");
    try {
      const blob = await exportEditedPdf(state.documentId, state.elements, token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const baseName = (state.fileName || "document").replace(/\.pdf$/i, "");
      link.href = url;
      link.download = `${baseName}-edited.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast.success("Your PDF is ready.", { id: toastId });
    } catch (error) {
      console.error("Export failed:", error?.message);
      toast.error(getErrorMessage(error, "Could not generate the edited PDF."), {
        id: toastId,
      });
    }
    setExporting(false);
  }, [flush, state.documentId, state.elements, state.fileName, token]);

  /* ---------------- element insertion ---------------- */

  const insertEmbeddable = useCallback(
    async (dataUrl, type) => {
      try {
        const img = await loadImage(dataUrl);
        const pageMeta = state.pagesMeta[currentPage - 1] ?? state.pagesMeta[0];
        const maxWidth = Math.min(pageMeta.width * 0.55, type === "signature" ? 200 : 280);
        const scale = Math.min(maxWidth / img.naturalWidth, 1);
        const width = Math.max(img.naturalWidth * scale, 24);
        const height = Math.max(img.naturalHeight * (width / img.naturalWidth), 12);
        const element = {
          id: crypto.randomUUID(),
          type,
          page: currentPage,
          x: (pageMeta.width - width) / 2,
          y: (pageMeta.height - height) / 2,
          width,
          height,
          rotation: 0,
          opacity: 1,
          src: dataUrl,
        };
        dispatch({ type: "SET_TOOL", tool: TOOLS.SELECT });
        dispatch({ type: "ADD_ELEMENT", element });
        toast.success(type === "signature" ? "Signature inserted" : "Image inserted");
      } catch (error) {
        toast.error(getErrorMessage(error, "That image could not be inserted."));
      }
    },
    [currentPage, dispatch, state.pagesMeta]
  );

  const handleImageFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        toast.error("Use a PNG, JPG or WebP image.");
        return;
      }
      try {
        const { dataUrl } = await fileToEmbeddableDataUrl(file);
        await insertEmbeddable(dataUrl, "image");
      } catch (error) {
        toast.error(getErrorMessage(error, "That image could not be used."));
      }
    },
    [insertEmbeddable]
  );

  /* ---------------- keyboard shortcuts ---------------- */

  useKeyboardShortcuts({
    enabled: !signatureOpen,
    onDelete: () => {
      if (state.selectedId) dispatch({ type: "DELETE_ELEMENT", id: state.selectedId });
    },
    onUndo: () => dispatch({ type: "UNDO" }),
    onRedo: () => dispatch({ type: "REDO" }),
    onDuplicate: () => {
      if (state.selectedId) dispatch({ type: "DUPLICATE_ELEMENT", id: state.selectedId });
    },
    onSave: () => flush(),
    onEscape: () => {
      if (state.editingTextId) dispatch({ type: "SET_EDITING_TEXT", id: null });
      else if (state.activeTool !== TOOLS.SELECT) dispatch({ type: "SET_TOOL", tool: TOOLS.SELECT });
      else dispatch({ type: "SET_SELECTED", id: null });
    },
  });

  /* ---------------- render ---------------- */

  return (
    <div
      className="flex flex-col bg-slate-100"
      style={{ height: "calc(100dvh - 64px)", minHeight: 480 }}>
      <HeaderBar onDownload={handleDownload} exporting={exporting} saveStatus={saveStatus} />

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <Toolbar
          onSignatureClick={() => setSignatureOpen(true)}
          onImageClick={() => imageInputRef.current?.click()}
        />
        <ThumbnailRail
          pdfDoc={pdfDoc}
          pagesMeta={state.pagesMeta}
          currentPage={currentPage}
          onPageSelect={(pageNumber) => workspaceApiRef.current?.goToPage(pageNumber)}
        />
        <div className="relative flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {pdfDoc ? (
            <Workspace
              pdfDoc={pdfDoc}
              pagesMeta={state.pagesMeta}
              currentPage={currentPage}
              onCurrentPageChange={setCurrentPage}
              apiRef={workspaceApiRef}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Rendering your document…
            </div>
          )}
        </div>
        <PropertiesPanel />
      </div>

      {saveStatus === SAVE_STATUS.ERROR && (
        <button
          onClick={() => flush()}
          className="fixed bottom-20 right-4 lg:hidden z-30 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
          Retry save
        </button>
      )}

      {signatureOpen && (
        <SignatureModal
          onClose={() => setSignatureOpen(false)}
          onInsert={(dataUrl) => insertEmbeddable(dataUrl, "signature")}
        />
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          handleImageFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
