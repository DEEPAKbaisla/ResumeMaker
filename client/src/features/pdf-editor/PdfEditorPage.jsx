import React from "react";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader.jsx";
import { EditorProvider } from "./state/EditorContext.jsx";
import { usePdfDocument } from "./hooks/usePdfDocument.js";
import EditorLanding from "./components/EditorLanding.jsx";
import EditorShell from "./EditorShell.jsx";

/**
 * PDF Editor feature page. Route: /app/pdf-editor
 * Flow: upload/open → render → edit (annotations overlay) → autosave → export.
 */
export default function PdfEditorPage() {
  const { user, token } = useSelector((state) => state.auth);
  const {
    phase,
    documents,
    documentMeta,
    pdfBytes,
    error,
    uploadProgress,
    openDocument,
    uploadAndOpen,
    removeDocument,
    closeDocument,
  } = usePdfDocument(token);

  if (!user || !token) return null; // Layout already renders the login gate

  if (phase === "ready" && documentMeta && pdfBytes) {
    return (
      <EditorProvider>
        <EditorShell
          documentMeta={documentMeta}
          pdfBytes={pdfBytes}
          token={token}
          onClose={closeDocument}
        />
      </EditorProvider>
    );
  }

  if (phase === "loading" || phase === "uploading") {
    return (
      <div className="min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <EditorLanding
      documents={documents}
      uploadProgress={phase === "uploading" ? uploadProgress : null}
      onUpload={uploadAndOpen}
      onOpen={openDocument}
      onDelete={removeDocument}
      error={error}
    />
  );
}
