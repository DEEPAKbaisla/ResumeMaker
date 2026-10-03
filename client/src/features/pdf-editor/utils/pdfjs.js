import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * pdf.js may take ownership of the buffer passed to getDocument, so callers
 * should hand over a copy of the stored bytes.
 */
export function createPdfDocumentProxy(bytes) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(new Uint8Array(bytes, 0, bytes.byteLength));
  return pdfjsLib.getDocument({ data: copy }).promise;
}

export default pdfjsLib;
