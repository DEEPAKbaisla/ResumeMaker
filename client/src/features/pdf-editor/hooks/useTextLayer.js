import { useCallback, useEffect, useRef, useState } from "react";
import { extractTextLines } from "../utils/textLayer.js";

/**
 * Module-level cache: pdfDoc proxy -> Map<pageNumber, Promise<lines>>.
 * Keeps extraction work cheap when pages unmount/remount while scrolling.
 */
const lineCache = new WeakMap();

function cachedLines(pdfDoc, pageNumber) {
  if (!pdfDoc) return null;
  let perDoc = lineCache.get(pdfDoc);
  if (!perDoc) {
    perDoc = new Map();
    lineCache.set(pdfDoc, perDoc);
  }
  if (!perDoc.has(pageNumber)) {
    perDoc.set(
      pageNumber,
      (async () => {
        try {
          const page = await pdfDoc.getPage(pageNumber);
          return await extractTextLines(page);
        } catch (error) {
          console.error(
            `Text extraction failed on page ${pageNumber}:`,
            error?.message
          );
          perDoc.delete(pageNumber); // allow a retry later
          return [];
        }
      })()
    );
  }
  return perDoc.get(pageNumber);
}

const IDLE = { status: "idle", lines: [] };

/**
 * Loads the editable text lines of one page on demand.
 * Returns { layer, ensure } where `ensure` kicks off extraction and resolves
 * with the lines (cached after the first call).
 */
export function usePageTextLines(pdfDoc, pageNumber) {
  const [layer, setLayer] = useState(IDLE);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const ensure = useCallback(async () => {
    const promise = cachedLines(pdfDoc, pageNumber);
    if (!promise) return [];
    const current = await promise;
    if (mountedRef.current) {
      setLayer({ status: "ready", lines: current });
    }
    return current;
  }, [pdfDoc, pageNumber]);

  // Warm the cache as soon as the tool becomes relevant; keeps first click snappy.
  useEffect(() => {
    let active = true;
    const promise = cachedLines(pdfDoc, pageNumber);
    if (!promise) return undefined;
    promise.then((lines) => {
      if (active && lines.length) setLayer({ status: "ready", lines });
    });
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber]);

  return {
    layer,
    ensure,
  };
}
