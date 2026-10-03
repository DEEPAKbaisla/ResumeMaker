import React, { useEffect, useRef } from "react";
import AnnotationLayer from "./AnnotationLayer.jsx";
import TransformHandles from "./TransformHandles.jsx";
import { useEditor } from "../state/editorContext.js";

/**
 * Renders one PDF page to canvas (device-pixel-ratio aware, cancellable)
 * and stacks the annotation layer plus selection chrome above it.
 */
export default function PageViewport({
  pdfDoc,
  pageNumber,
  size,
  zoom,
  registerRef,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const { state, dispatch } = useEditor();

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return undefined;
    let cancelled = false;

    (async () => {
      try {
        renderTaskRef.current?.cancel();
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: zoom * dpr });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (error) {
        if (!cancelled && error?.name !== "RenderingCancelledException") {
          console.error(`Failed to render page ${pageNumber}:`, error?.message);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdfDoc, pageNumber, zoom]);

  const selected =
    state.elements.find((el) => el.id === state.selectedId) ?? null;

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        registerRef?.(pageNumber, node);
      }}
      data-page-number={pageNumber}
      className="relative bg-white shadow-[0_2px_14px_rgba(15,23,42,0.18)] rounded-sm"
      style={{ width: size.width * zoom, height: size.height * zoom }}
    >
      <canvas
        ref={canvasRef}
        className="block rounded-sm"
        style={{ width: size.width * zoom, height: size.height * zoom }}
        aria-label={`PDF page ${pageNumber}`}
      />
      <AnnotationLayer
        pageNumber={pageNumber}
        pageSize={size}
        zoom={zoom}
        pdfDoc={pdfDoc}
        getCanvas={() => canvasRef.current}
      />
      {selected && selected.page === pageNumber && (
        <TransformHandles
          el={selected}
          zoom={zoom}
          onGestureStart={() => dispatch({ type: "PUSH_HISTORY" })}
          onPatch={(id, patch) =>
            dispatch({ type: "PATCH_ELEMENT", id, patch, transient: true })
          }
          onDuplicate={() => dispatch({ type: "DUPLICATE_ELEMENT", id: selected.id })}
          onDelete={() => dispatch({ type: "DELETE_ELEMENT", id: selected.id })}
        />
      )}
    </div>
  );
}
