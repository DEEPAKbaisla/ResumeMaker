import React, { useRef, useState } from "react";
import { useEditor } from "../state/editorContext.js";
import { DEFAULTS, DRAG_TOOLS, TOOLS } from "../utils/constants.js";
import { boxFromDrag, hitTest, pointInElement, screenToPage, translatePoints } from "../utils/coordinates.js";
import { sampleColorsFromCanvas } from "../utils/colorSampling.js";
import { usePageTextLines } from "../hooks/useTextLayer.js";
import ElementView from "./ElementView.jsx";

function padBox(box, pad) {
  return {
    x: box.x - pad,
    y: box.y - pad,
    width: Math.max(box.width + pad * 2, 1),
    height: Math.max(box.height + pad * 2, 1),
  };
}

/** Extra page-space tolerance when re-clicking an existing text patch. */
const EDIT_TEXT_HIT_PAD = 6;
/** Fraction of a line's area already covered by a patch above which we
 *  re-enter that patch instead of stacking another one over it. */
const PATCH_OVERLAP_RATIO = 0.5;

/** Fraction of `a`'s area overlapped by `b` (0 when disjoint). */
function overlapRatio(a, b) {
  const ox = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (ox <= 0 || oy <= 0) return 0;
  return (ox * oy) / Math.max(a.width * a.height, 1);
}

/**
 * Transparent interaction surface above the rendered PDF canvas. Owns every
 * tool gesture (select/move, text placement, freehand drawing, shape drags)
 * and renders the live preview while a gesture is in progress.
 */
export default function AnnotationLayer({ pageNumber, pageSize, zoom, pdfDoc, getCanvas }) {
  const { state, dispatch } = useEditor();
  const layerRef = useRef(null);
  const gestureRef = useRef(null);
  const previewRef = useRef(null);
  const lastClickRef = useRef({ time: 0, id: null });
  const [preview, setPreview] = useState(null);
  const [hoveredLineId, setHoveredLineId] = useState(null);
  const editTextBusyRef = useRef(false);
  const { layer: textLayerState, ensure: ensureTextLines } = usePageTextLines(
    pdfDoc,
    pageNumber
  );

  const pageElements = state.elements.filter((el) => el.page === pageNumber);

  const toPagePoint = (event) => {
    const rect = layerRef.current.getBoundingClientRect();
    return screenToPage(event.clientX - rect.left, event.clientY - rect.top, zoom);
  };

  /** Builds a textEdit element that patches an existing PDF text line. */
  const buildTextEditElement = (line) => {
    const sampled = sampleColorsFromCanvas(getCanvas?.(), line, zoom, {
      color: DEFAULTS.textColor,
      bgColor: DEFAULTS.textBgColor,
    });
    return {
      id: crypto.randomUUID(),
      type: "textEdit",
      page: pageNumber,
      x: line.x,
      y: line.y,
      width: Math.max(line.width, line.fontSize * 2),
      height: line.height,
      rotation: 0,
      content: line.text,
      originalText: line.text,
      baselineOffset: Math.min(line.height, Math.max(2, line.baselineOffset)),
      fontSize: line.fontSize,
      fontFamily: line.fontFamily ?? DEFAULTS.fontFamily,
      color: sampled.color,
      bgColor: sampled.bgColor,
      bold: false,
      italic: false,
      underline: false,
      align: "left",
    };
  };

  const handleEditTextClick = async (pt) => {
    if (editTextBusyRef.current) return;
    editTextBusyRef.current = true;
    try {
      // Clicking on (or very near) an existing patch always re-enters it —
      // never stack another patch over the same text.
      const patches = pageElements.filter((el) => el.type === "textEdit");
      for (let i = patches.length - 1; i >= 0; i--) {
        if (pointInElement(patches[i], pt.x, pt.y, EDIT_TEXT_HIT_PAD)) {
          dispatch({ type: "SET_SELECTED", id: patches[i].id });
          dispatch({ type: "SET_EDITING_TEXT", id: patches[i].id });
          return;
        }
      }

      const lines = (await ensureTextLines()) ?? [];
      const line =
        lines.find((l) => pointInElement(l, pt.x, pt.y, 2)) ?? null;
      if (!line) {
        dispatch({ type: "SET_SELECTED", id: null });
        return;
      }
      // If this line is already mostly covered by an earlier patch, edit that
      // patch again instead of creating a smaller overlapping duplicate.
      const overlapping = patches.filter(
        (el) => overlapRatio(line, el) > PATCH_OVERLAP_RATIO
      );
      if (overlapping.length) {
        const topmost = overlapping[overlapping.length - 1];
        dispatch({ type: "SET_SELECTED", id: topmost.id });
        dispatch({ type: "SET_EDITING_TEXT", id: topmost.id });
        return;
      }
      const element = buildTextEditElement(line);
      dispatch({ type: "ADD_ELEMENT", element });
      dispatch({ type: "SET_EDITING_TEXT", id: element.id });
    } finally {
      editTextBusyRef.current = false;
    }
  };

  const updatePreview = (element) => {
    previewRef.current = element;
    setPreview(element);
  };

  const buildCreatedElement = (tool, start, end, points) => {
    const base = { id: crypto.randomUUID(), page: pageNumber, rotation: 0 };
    switch (tool) {
      case TOOLS.DRAW: {
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const box = padBox(
          {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
          },
          DEFAULTS.strokeWidth
        );
        return {
          ...base,
          type: "drawing",
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          points,
          strokeColor: DEFAULTS.drawColor,
          strokeWidth: DEFAULTS.strokeWidth,
          opacity: 1,
        };
      }
      case TOOLS.LINE:
      case TOOLS.ARROW: {
        const box = boxFromDrag(start, end);
        return {
          ...base,
          type: tool,
          x: box.x,
          y: box.y,
          width: Math.max(box.width, 1),
          height: Math.max(box.height, 1),
          points: [start, end],
          strokeColor: DEFAULTS.strokeColor,
          strokeWidth: DEFAULTS.strokeWidth,
          opacity: 1,
        };
      }
      case TOOLS.HIGHLIGHT: {
        const box = boxFromDrag(start, end);
        return {
          ...base,
          type: "highlight",
          ...box,
          fillColor: DEFAULTS.highlightColor,
          opacity: DEFAULTS.highlightOpacity,
        };
      }
      case TOOLS.WHITEOUT: {
        const box = boxFromDrag(start, end);
        return { ...base, type: "whiteout", ...box, opacity: 1 };
      }
      case TOOLS.RECT:
      case TOOLS.ELLIPSE: {
        const box = boxFromDrag(start, end);
        return {
          ...base,
          type: tool,
          ...box,
          strokeColor: DEFAULTS.strokeColor,
          strokeWidth: DEFAULTS.strokeWidth,
          fillColor: DEFAULTS.fillColor === "none" ? undefined : DEFAULTS.fillColor,
          opacity: DEFAULTS.opacity,
        };
      }
      default:
        return null;
    }
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    // Let the caret/typing inside an active text editor work undisturbed.
    if (state.editingTextId && event.target.tagName === "TEXTAREA") return;

    const pt = toPagePoint(event);
    const tool = state.activeTool;

    if (tool === TOOLS.SELECT || tool === TOOLS.TEXT) {
      const now = Date.now();
      const hit = hitTest(pageElements, pt.x, pt.y);
      if (
        hit &&
        hit.type === "text" &&
        lastClickRef.current.id === hit.id &&
        now - lastClickRef.current.time < 400
      ) {
        dispatch({ type: "SET_TOOL", tool: TOOLS.SELECT });
        dispatch({ type: "SET_EDITING_TEXT", id: hit.id });
        lastClickRef.current = { time: 0, id: null };
        return;
      }
      lastClickRef.current = { time: now, id: hit?.id ?? null };
    }

    if (tool === TOOLS.SELECT) {
      const hit = hitTest(pageElements, pt.x, pt.y);
      dispatch({ type: "SET_SELECTED", id: hit?.id ?? null });
      if (hit) {
        gestureRef.current = {
          kind: "move",
          id: hit.id,
          start: pt,
          orig: structuredClone(hit),
          moved: false,
        };
        layerRef.current.setPointerCapture(event.pointerId);
      }
      return;
    }

    if (tool === TOOLS.TEXT) {
      const width = Math.min(200, Math.max(60, pageSize.width - pt.x - 12));
      const element = {
        id: crypto.randomUUID(),
        type: "text",
        page: pageNumber,
        x: pt.x,
        y: Math.max(0, pt.y - DEFAULTS.fontSize * 0.6),
        width,
        height: DEFAULTS.fontSize * 1.6,
        rotation: 0,
        content: "",
        fontSize: DEFAULTS.fontSize,
        fontFamily: DEFAULTS.fontFamily,
        color: DEFAULTS.textColor,
        bold: DEFAULTS.bold,
        italic: DEFAULTS.italic,
        underline: DEFAULTS.underline,
        align: DEFAULTS.align,
      };
      dispatch({ type: "ADD_ELEMENT", element });
      dispatch({ type: "SET_EDITING_TEXT", id: element.id });
      dispatch({ type: "SET_TOOL", tool: TOOLS.SELECT });
      return;
    }

    if (tool === TOOLS.EDIT_TEXT) {
      void handleEditTextClick(pt);
      return;
    }

    if (DRAG_TOOLS.has(tool)) {
      gestureRef.current =
        tool === TOOLS.DRAW
          ? { kind: "create", tool, start: pt, points: [pt], last: pt }
          : { kind: "create", tool, start: pt };
      layerRef.current.setPointerCapture(event.pointerId);
      updatePreview(buildCreatedElement(tool, pt, pt, tool === TOOLS.DRAW ? [pt] : undefined));
    }
  };

  const handlePointerMove = (event) => {
    if (!gestureRef.current && state.activeTool === TOOLS.EDIT_TEXT) {
      if (state.editingTextId) {
        setHoveredLineId(null);
      } else {
        const pt = toPagePoint(event);
        const line = textLayerState.lines.find((l) =>
          pointInElement(l, pt.x, pt.y, 2)
        );
        setHoveredLineId(line?.id ?? null);
      }
    }
    const g = gestureRef.current;
    if (!g) return;
    const pt = toPagePoint(event);

    if (g.kind === "move") {
      const dx = pt.x - g.start.x;
      const dy = pt.y - g.start.y;
      if (!g.moved && Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      g.moved = true;
      const patch = { x: g.orig.x + dx, y: g.orig.y + dy };
      if (Array.isArray(g.orig.points)) {
        patch.points = translatePoints(g.orig.points, dx, dy);
      }
      dispatch({ type: "PATCH_ELEMENT", id: g.id, patch, transient: true });
      return;
    }

    if (g.kind === "create") {
      if (g.tool === TOOLS.DRAW) {
        const dist = Math.hypot(pt.x - g.last.x, pt.y - g.last.y);
        if (dist > 1.2) {
          g.points.push(pt);
          g.last = pt;
        }
      }
      updatePreview(buildCreatedElement(g.tool, g.start, pt, g.points));
    }
  };

  const finishGesture = () => {
    const g = gestureRef.current;
    gestureRef.current = null;

    if (g?.kind === "move") {
      updatePreview(null);
      return;
    }

    if (g?.kind === "create" && previewRef.current) {
      const element = structuredClone(previewRef.current);
      const meaningful = element.points
        ? element.points.length >= 2 &&
          (element.width > 1 || element.height > 1 || element.points.length > 4)
        : element.width >= 3 && element.height >= 3;
      if (meaningful) {
        dispatch({ type: "ADD_ELEMENT", element });
      }
    }
    updatePreview(null);
  };

  const hoveredLine = textLayerState.lines.find((l) => l.id === hoveredLineId) ?? null;
  const cursor =
    state.activeTool === TOOLS.SELECT
      ? "default"
      : DRAG_TOOLS.has(state.activeTool) || state.activeTool === TOOLS.TEXT
        ? "crosshair"
        : state.activeTool === TOOLS.EDIT_TEXT
          ? "text"
          : "default";

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 z-10"
      style={{ cursor, touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      role="application"
      aria-label={`Page ${pageNumber} annotation surface`}>
      {hoveredLine && (
        <div
          className="absolute border border-dashed border-blue-500/70 bg-blue-500/5 pointer-events-none rounded-[2px]"
          style={{
            left: hoveredLine.x * zoom,
            top: hoveredLine.y * zoom,
            width: Math.max(hoveredLine.width * zoom, 2),
            height: Math.max(hoveredLine.height * zoom, 2),
          }}
        />
      )}
      {pageElements.map((el) => (
        <ElementView
          key={el.id}
          el={el}
          zoom={zoom}
          isSelected={state.selectedId === el.id}
          isEditing={state.editingTextId === el.id}
          onContentChange={(content) =>
            dispatch({
              type: "PATCH_ELEMENT",
              id: el.id,
              patch: { content },
              transient: true,
            })
          }
          onCommitEdit={() => dispatch({ type: "COMMIT_EDITING", id: el.id })}
        />
      ))}
      {preview && <ElementView el={preview} zoom={zoom} isSelected={false} />}
    </div>
  );
}
