import { MAX_ZOOM, MIN_ZOOM } from "./constants.js";

/**
 * All editor geometry lives in "page space": PDF points with a TOP-LEFT
 * origin, measured against the scale-1 viewport of each page. Screen
 * position is simply pagePos * zoom, which keeps every interaction
 * zoom-independent and makes the server-side export conversion trivial.
 */

export function screenToPage(x, y, zoom) {
  return { x: x / zoom, y: y / zoom };
}

export function pageToScreen(x, y, zoom) {
  return { x: x * zoom, y: y * zoom };
}

/** Rotates a point about a center (top-origin space, clockwise positive). */
export function rotatePoint(px, py, cx, cy, degCw) {
  const rad = (degCw * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

export function getElementCenter(el) {
  return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
}

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

/**
 * Resizes an element box by dragging `handle`; the opposite corner/edge stays
 * fixed and sizes are clamped to minSize.
 */
export function resizeBox(el, handle, dx, dy, minSize = 8) {
  let { x, y, width: w, height: h } = el;
  if (!HANDLES.includes(handle)) return el;

  if (handle.includes("w")) {
    const nx = Math.min(x + dx, x + w - minSize);
    w += x - nx;
    x = nx;
  }
  if (handle.includes("e")) {
    w = Math.max(minSize, w + dx);
  }
  if (handle.includes("n")) {
    const ny = Math.min(y + dy, y + h - minSize);
    h += y - ny;
    y = ny;
  }
  if (handle.includes("s")) {
    h = Math.max(minSize, h + dy);
  }
  return { ...el, x, y, width: w, height: h };
}

/**
 * Maps absolute points from one bounding box into another proportionally —
 * used when moving/resizing drawings, lines and arrows.
 */
export function scalePointsIntoBox(points, fromBox, toBox) {
  const sx = fromBox.width === 0 ? 1 : toBox.width / fromBox.width;
  const sy = fromBox.height === 0 ? 1 : toBox.height / fromBox.height;
  return points.map((p) => ({
    x: toBox.x + (p.x - fromBox.x) * sx,
    y: toBox.y + (p.y - fromBox.y) * sy,
  }));
}

/** Translates absolute points by (dx, dy). */
export function translatePoints(points, dx, dy) {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

/** Normalizes a start/end drag into a top-left origin box. */
export function boxFromDrag(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

/** True if a page-space point is inside an element's bounding box. */
export function pointInElement(el, px, py, tolerance = 4) {
  return (
    px >= el.x - tolerance &&
    px <= el.x + el.width + tolerance &&
    py >= el.y - tolerance &&
    py <= el.y + el.height + tolerance
  );
}

/** Topmost element under a point (later elements render on top). */
export function hitTest(elements, px, py) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.points && el.type !== "rect" && el.type !== "ellipse") {
      // Point-based elements: test their computed bbox for a usable hit area.
      if (pointInElement(el, px, py, Math.max(8, el.strokeWidth ?? 2))) return el;
      continue;
    }
    if (pointInElement(el, px, py)) return el;
  }
  return null;
}

export function clampZoom(zoom) {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function fitWidthZoom(containerWidth, pageWidth, gutter = 48) {
  return clampZoom((containerWidth - gutter) / pageWidth);
}

export function fitPageZoom(containerWidth, containerHeight, pageWidth, pageHeight) {
  const z = Math.min(
    (containerWidth - 64) / pageWidth,
    (containerHeight - 96) / pageHeight
  );
  return clampZoom(z);
}
