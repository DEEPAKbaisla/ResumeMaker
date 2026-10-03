/**
 * Samples the dominant text and background colors for a box on a rendered
 * PDF page canvas. Used to make "edit existing text" match the original
 * look (same color, same background) when the replacement text is drawn.
 */

function toHex(r, g, b) {
  const part = (v) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * @param {HTMLCanvasElement|null} canvas rendered page canvas
 * @param {{x:number,y:number,width:number,height:number}} bbox page-space box
 * @param {number} zoom current editor zoom (canvas pixels = points * zoom)
 * @returns {{color:string, bgColor:string}}
 */
export function sampleColorsFromCanvas(
  canvas,
  bbox,
  zoom,
  fallbacks = { color: "#111827", bgColor: "#ffffff" }
) {
  try {
    if (!canvas || !(zoom > 0)) return fallbacks;

    const sx = Math.max(0, Math.floor(bbox.x * zoom));
    const sy = Math.max(0, Math.floor(bbox.y * zoom));
    const sw = Math.min(
      Math.ceil(bbox.width * zoom),
      canvas.width - sx
    );
    const sh = Math.min(
      Math.ceil(bbox.height * zoom),
      canvas.height - sy
    );
    if (sw < 2 || sh < 2) return fallbacks;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const { data } = ctx.getImageData(sx, sy, sw, sh);

    // Sample every other pixel; boxes are usually wide and short.
    const lumas = [];
    const pixels = [];
    const step = sw > 160 ? 4 : 2;
    for (let y = 0; y < sh; y += 1) {
      for (let x = 0; x < sw; x += step) {
        const i = (y * sw + x) * 4;
        if (data[i + 3] < 128) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        lumas.push(luminance(r, g, b));
        pixels.push([r, g, b]);
      }
    }
    if (pixels.length < 8) return fallbacks;

    const sorted = [...lumas].sort((a, b) => a - b);
    const percentile = (p) =>
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
    const darkLuma = percentile(0.08);
    const lightLuma = percentile(0.92);
    const threshold = (darkLuma + lightLuma) / 2;

    let fgR = 0;
    let fgG = 0;
    let fgB = 0;
    let fgN = 0;
    let bgR = 0;
    let bgG = 0;
    let bgB = 0;
    let bgN = 0;
    for (let idx = 0; idx < pixels.length; idx += 1) {
      const [r, g, b] = pixels[idx];
      // Weight the darkest quarter of foreground pixels most — anti-aliased
      // edge pixels blend toward the background and would wash the color out.
      if (lumas[idx] <= threshold) {
        const core = lumas[idx] <= darkLuma + (threshold - darkLuma) * 0.5;
        const w = core ? 3 : 1;
        fgR += r * w;
        fgG += g * w;
        fgB += b * w;
        fgN += w;
      } else {
        bgR += r;
        bgG += g;
        bgB += b;
        bgN += 1;
      }
    }

    if (!fgN || !bgN) return fallbacks;

    const color = toHex(fgR / fgN, fgG / fgN, fgB / fgN);
    const bgColor = toHex(bgR / bgN, bgG / bgN, bgB / bgN);
    // If the "text" barely contrasts with the background the sample is
    // meaningless (e.g. selection happened over an image) — keep fallback.
    if (Math.abs(lightLuma - darkLuma) < 40) return fallbacks;
    return { color, bgColor };
  } catch {
    return fallbacks;
  }
}
