import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  uploadPdf,
  listDocuments,
  getDocument,
  getDocumentFile,
  deleteDocument,
  getErrorMessage,
} from "../services/api.js";

const IDLE = "idle";
const UPLOADING = "uploading";
const LOADING = "loading";
const READY = "ready";

export function usePdfDocument(token) {
  const [phase, setPhase] = useState(IDLE);
  const [documents, setDocuments] = useState([]);
  const [documentMeta, setDocumentMeta] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const refreshList = useCallback(async () => {
    if (!token) return;
    try {
      setDocuments(await listDocuments(token));
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load your documents."));
    }
  }, [token]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const openDocument = useCallback(
    async (id) => {
      setPhase(LOADING);
      setError("");
      try {
        const meta = await getDocument(id, token);
        const bytes = await getDocumentFile(id, token);
        setDocumentMeta(meta);
        setPdfBytes(bytes);
        setPhase(READY);
      } catch (err) {
        setError(getErrorMessage(err, "Could not open this document."));
        setPhase(IDLE);
      }
    },
    [token]
  );

  const uploadAndOpen = useCallback(
    async (file) => {
      setPhase(UPLOADING);
      setUploadProgress(0);
      setError("");
      try {
        const doc = await uploadPdf(file, token, setUploadProgress);
        await refreshList();
        setDocumentMeta(doc);
        const bytes = await getDocumentFile(doc._id, token);
        setPdfBytes(bytes);
        setPhase(READY);
      } catch (err) {
        setError(getErrorMessage(err, "The upload failed. Please try again."));
        setPhase(IDLE);
      }
    },
    [token, refreshList]
  );

  const removeDocument = useCallback(
    async (id) => {
      try {
        await deleteDocument(id, token);
        setDocuments((docs) => docs.filter((d) => d._id !== id));
        toast.success("Document deleted");
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not delete this document."));
      }
    },
    [token]
  );

  const closeDocument = useCallback(() => {
    setDocumentMeta(null);
    setPdfBytes(null);
    setPhase(IDLE);
    refreshList();
  }, [refreshList]);

  return {
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
  };
}
