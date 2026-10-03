import api from "../../../configs/api";

export function authHeaders(token) {
  return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
}

export function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback ||
    "Something went wrong. Please try again."
  );
}

/** POST /api/pdf-editor/upload (multipart field "pdf") */
export async function uploadPdf(file, token, onProgress) {
  const formData = new FormData();
  formData.append("pdf", file);
  const { data } = await api.post("/api/pdf-editor/upload", formData, {
    ...authHeaders(token),
    onUploadProgress: onProgress
      ? (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        }
      : undefined,
  });
  return data.document;
}

export async function listDocuments(token) {
  const { data } = await api.get("/api/pdf-editor", authHeaders(token));
  return data.documents ?? [];
}

export async function getDocument(id, token) {
  const { data } = await api.get(`/api/pdf-editor/${id}`, authHeaders(token));
  return data.document;
}

/** Returns an ArrayBuffer of the original PDF via the authenticated proxy. */
export async function getDocumentFile(id, token) {
  const response = await api.get(`/api/pdf-editor/${id}/file`, {
    ...authHeaders(token),
    responseType: "arraybuffer",
  });
  return response.data;
}

export async function saveEditorState(id, elements, token) {
  const { data } = await api.put(
    `/api/pdf-editor/${id}/state`,
    { elements },
    authHeaders(token)
  );
  return data;
}

/** Returns the edited PDF as a Blob for download. */
export async function exportEditedPdf(id, elements, token) {
  const response = await api.post(
    `/api/pdf-editor/${id}/export`,
    { elements },
    { ...authHeaders(token), responseType: "blob" }
  );
  return new Blob([response.data], { type: "application/pdf" });
}

export async function deleteDocument(id, token) {
  const { data } = await api.delete(`/api/pdf-editor/${id}`, authHeaders(token));
  return data;
}
