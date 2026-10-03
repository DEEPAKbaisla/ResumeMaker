import * as pdfjsLib from "pdfjs-dist";

/**
 * Extracts editable text runs from a PDF page using pdf.js and groups them
 * into clickable line boxes in the editor's page space (PDF points, top-left
 * origin, scale-1 viewport) so they line up with overlay elements.
 */

const MAX_FONT_SIZE = 96;
const MIN_FONT_SIZE = 6;

/** Maps a pdf.js generic/real font family name to an embeddable standard font. */
function mapFontFamily(rawFamily) {
  const value = String(rawFamily ?? "").toLowerCase();
  if (/mono|courier|consol|prestige|typewriter/.test(value)) return "Courier";
  if (/(^|[^s])serif|times|georgia|garamond|roman|book antiqua|palatino/.test(value)) {
    return "Times";
  }
  return "Helvetica";
}

/** True if the run is essentially axis-aligned (skew under ~8 degrees). */
function isAxisAligned(tx) {
  const angle = Math.atan2(tx[1], tx[0]);
  return Math.abs(angle) < 0.14;
}

/**
 * Converts one pdf.js text item into a page-space box + metrics.
 * Returns null for items we cannot offer editing for (empty, rotated...).
 */
function itemToRun(item, style, viewportTransform) {
  if (!item.str || !item.str.trim()) return null;
  const tx = pdfjsLib.Util.transform(viewportTransform, item.transform);
  if (!isAxisAligned(tx)) return null;

  const fontSize = Math.hypot(tx[2], tx[3]);
  if (!Number.isFinite(fontSize) || fontSize < 1) return null;

  const ascent = Number.isFinite(style?.ascent) ? style.ascent : 0.8;
  const descent = Number.isFinite(style?.descent)
    ? Math.min(0, Math.abs(style.descent))
    : -0.2;
  const baselineY = tx[5];
  const box = {
    x: tx[4],
    y: baselineY - ascent * fontSize,
    width: Math.max(item.width ?? 0, fontSize * 0.4),
    height: (ascent - descent) * fontSize,
  };
  return {
    text: item.str,
    box,
    baselineY,
    fontSize,
    fontFamily: mapFontFamily(style?.fontFamily),
  };
}

const SAME_LINE_Y_TOLERANCE_FACTOR = 0.35;
const WORD_GAP_FACTOR = 0.22;
const LINE_BREAK_GAP_FACTOR = 2.2;

/** Greedily merges consecutive runs that share a baseline into line boxes. */
export function groupRunsIntoLines(runs) {
  const lines = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    const x = Math.min(...current.runs.map((r) => r.box.x));
    const right = Math.max(...current.runs.map((r) => r.box.x + r.box.width));
    const top = Math.min(...current.runs.map((r) => r.box.y));
    const bottom = Math.max(
      ...current.runs.map((r) => r.box.y + r.box.height)
    );
    lines.push({
      id: `line-${lines.length}`,
      text: current.text,
      x,
      y: top,
      width: Math.max(right - x, 1),
      height: Math.max(bottom - top, 1),
      fontSize: current.fontSize,
      fontFamily: current.fontFamily,
      baselineOffset: current.baselineY - top,
    });
    current = null;
  };

  for (const run of runs) {
    if (!current) {
      current = {
        runs: [run],
        text: run.text,
        fontSize: run.fontSize,
        fontFamily: run.fontFamily,
        baselineY: run.baselineY,
        lastRight: run.box.x + run.box.width,
      };
      continue;
    }
    const yTol = Math.max(
      2,
      Math.max(run.fontSize, current.fontSize) * SAME_LINE_Y_TOLERANCE_FACTOR
    );
    const sameBaseline = Math.abs(run.baselineY - current.baselineY) <= yTol;
    const gap = run.box.x - current.lastRight;
    const sameLine =
      sameBaseline &&
      gap < Math.max(run.fontSize, current.fontSize) * LINE_BREAK_GAP_FACTOR;

    if (sameLine) {
      const needsSpace =
        gap >= Math.max(run.fontSize, current.fontSize) * WORD_GAP_FACTOR;
      current.text += needsSpace ? ` ${run.text}` : run.text;
      current.runs.push(run);
      current.lastRight = run.box.x + run.box.width;
      current.fontSize = Math.max(current.fontSize, run.fontSize);
    } else {
      flush();
      current = {
        runs: [run],
        text: run.text,
        fontSize: run.fontSize,
        fontFamily: run.fontFamily,
        baselineY: run.baselineY,
        lastRight: run.box.x + run.box.width,
      };
    }
  }
  flush();
  return lines;
}

/**
 * Extracts grouped, editable text lines for one page.
 * @param {object} pageProxy pdf.js PDFPageProxy
 * @returns {Promise<Array>} line descriptors in scale-1 page space
 */
export async function extractTextLines(pageProxy) {
  const viewport = pageProxy.getViewport({ scale: 1 });
  const textContent = await pageProxy.getTextContent();

  const runs = [];
  for (const item of textContent.items) {
    if (typeof item.str !== "string") continue;
    const style = textContent.styles?.[item.fontName];
    const run = itemToRun(item, style, viewport.transform);
    if (run) runs.push(run);
  }

  return groupRunsIntoLines(runs)
    .map((line) => ({
      ...line,
      fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, line.fontSize)),
    }))
    .filter((line) => line.width >= 2 && line.height >= 2);
}
