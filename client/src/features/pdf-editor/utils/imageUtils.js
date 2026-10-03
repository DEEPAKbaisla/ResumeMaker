import { IMAGE_MAX_DIMENSION } from "./constants.js";

/** Reads an image File into an HTMLImageElement (object URLs cleaned up). */
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be read."));
    };
    img.src = url;
  });
}

function canvasToDataUrl(canvas, preferPng) {
  if (preferPng) return canvas.toDataURL("image/png");
  const jpeg = canvas.toDataURL("image/jpeg", 0.85);
  // Only keep JPEG when it is actually smaller (no transparency benefits).
  const png = canvas.toDataURL("image/png");
  return jpeg.length < png.length ? jpeg : png;
}

/**
 * Converts any browser-supported image file into a PNG/JPEG data URL that
 * pdf-lib can embed, downscaling very large images to keep state payloads
 * small.
 */
export async function fileToEmbeddableDataUrl(file) {
  const img = await loadImageFile(file);
  const scale = Math.min(
    1,
    IMAGE_MAX_DIMENSION / Math.max(img.naturalWidth || 1, img.naturalHeight || 1)
  );
  const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const isPngOrWebp = /image\/(png|webp)/.test(file.type);
  if (!isPngOrWebp) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);
  return { dataUrl: canvasToDataUrl(canvas, isPngOrWebp), width: img.naturalWidth, height: img.naturalHeight };
}

/** Crops fully transparent margins from a canvas (signature cleanup). */
export function trimTransparent(canvas) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let top = height;
  let left = width;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (y < top) top = y;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right <= left || bottom <= top) return canvas;
  const pad = 6;
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(width - 1, right + pad);
  bottom = Math.min(height - 1, bottom + pad);
  const out = document.createElement("canvas");
  out.width = right - left + 1;
  out.height = bottom - top + 1;
  out.getContext("2d").drawImage(canvas, left, top, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** Renders text in a handwriting-style font onto a transparent PNG. */
export function typedSignatureToDataUrl(text, color = "#111827") {
  const fontSize = 64;
  const font = `${fontSize}px "Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive`;
  const measure = document.createElement("canvas").getContext("2d");
  measure.font = font;
  const metrics = measure.measureText(text);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(metrics.width) + 24;
  canvas.height = fontSize * 1.8;
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, canvas.height / 2);
  return trimTransparent(canvas).toDataURL("image/png");
}
