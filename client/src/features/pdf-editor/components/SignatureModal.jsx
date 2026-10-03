import React, { useRef, useState } from "react";
import { EraserIcon, KeyboardIcon, TypeIcon, UploadCloudIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  fileToEmbeddableDataUrl,
  typedSignatureToDataUrl,
} from "../utils/imageUtils.js";
import { MAX_IMAGE_MB } from "../utils/constants.js";

const TABS = [
  { id: "draw", label: "Draw", icon: KeyboardIcon },
  { id: "type", label: "Type", icon: TypeIcon },
  { id: "upload", label: "Upload", icon: UploadCloudIcon },
];

const PEN_COLORS = ["#111827", "#1d4ed8", "#b91c1c"];

/**
 * Signature creation modal with three modes: freehand drawing on a canvas,
 * typing a name rendered in a handwriting-style font, or uploading an image.
 * All modes produce a trimmed transparent PNG data URL.
 */
export default function SignatureModal({ onClose, onInsert }) {
  const [tab, setTab] = useState("draw");
  const [color, setColor] = useState("#111827");
  const [typed, setTyped] = useState("");
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);
  const drawingRef = useRef(null);

  const pointFromEvent = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvasRef.current.width,
      y: ((event.clientY - rect.top) / rect.height) * canvasRef.current.height,
    };
  };

  const strokeSegment = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const startDraw = (event) => {
    event.preventDefault();
    drawingRef.current = pointFromEvent(event);
    setHasInk(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDraw = (event) => {
    if (!drawingRef.current) return;
    const to = pointFromEvent(event);
    strokeSegment(drawingRef.current, to);
    drawingRef.current = to;
  };

  const endDraw = () => {
    drawingRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      toast.error("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be ${MAX_IMAGE_MB} MB or smaller.`);
      return;
    }
    setBusy(true);
    try {
      const { dataUrl } = await fileToEmbeddableDataUrl(file);
      onInsert(dataUrl);
      onClose();
    } catch (error) {
      toast.error(error.message || "That image could not be used.");
    }
    setBusy(false);
  };

  const insert = () => {
    let dataUrl = null;
    if (tab === "draw") {
      if (!hasInk) {
        toast.error("Draw your signature first.");
        return;
      }
      dataUrl = canvasRef.current.toDataURL("image/png");
    } else if (tab === "type") {
      if (!typed.trim()) {
        toast.error("Type your name first.");
        return;
      }
      dataUrl = typedSignatureToDataUrl(typed.trim(), color);
    }
    if (!dataUrl) return;
    onInsert(dataUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create your signature">
      <div
        className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close signature dialog"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <XIcon className="size-4" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Create your signature</h2>
        <p className="text-sm text-slate-500 mb-5">
          It will be placed on the current page and included in the exported PDF.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4" role="tablist" aria-label="Signature mode">
          {TABS.map(({ id, label, icon }) => {
            const Icon = icon;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                  tab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                <Icon className="size-4" /> {label}
              </button>
            );
          })}
        </div>

        {tab === "draw" && (
          <>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-[linear-gradient(transparent_calc(100%-1px),rgba(148,163,184,.4)_0)] bg-[length:100%_2.4rem] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={640}
                height={240}
                className="w-full touch-none cursor-crosshair"
                style={{ touchAction: "none" }}
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
                aria-label="Signature drawing area"
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Pen color">
                {PEN_COLORS.map((pen) => (
                  <button
                    key={pen}
                    role="radio"
                    aria-checked={color === pen}
                    aria-label={`Pen color ${pen}`}
                    onClick={() => setColor(pen)}
                    className={`size-7 rounded-full border-2 transition-transform ${
                      color === pen ? "border-blue-500 scale-110" : "border-white shadow"
                    }`}
                    style={{ backgroundColor: pen }}
                  />
                ))}
              </div>
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <EraserIcon className="size-3.5" /> Clear
              </button>
            </div>
          </>
        )}

        {tab === "type" && (
          <div className="space-y-4">
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type your full name"
              aria-label="Signature text"
              maxLength={60}
              className="no-global-input w-full px-4 py-3 border border-slate-200 rounded-xl text-lg focus:border-blue-400"
            />
            <div className="h-28 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden px-4">
              {typed.trim() ? (
                <span
                  className="text-4xl truncate"
                  style={{
                    fontFamily:
                      '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive',
                    color,
                  }}>
                  {typed.trim()}
                </span>
              ) : (
                <span className="text-xs text-slate-300">Live preview</span>
              )}
            </div>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Text color">
              {PEN_COLORS.map((pen) => (
                <button
                  key={pen}
                  role="radio"
                  aria-checked={color === pen}
                  aria-label={`Text color ${pen}`}
                  onClick={() => setColor(pen)}
                  className={`size-7 rounded-full border-2 transition-transform ${
                    color === pen ? "border-blue-500 scale-110" : "border-white shadow"
                  }`}
                  style={{ backgroundColor: pen }}
                />
              ))}
            </div>
          </div>
        )}

        {tab === "upload" && (
          <label className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
            <UploadCloudIcon className="size-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <p className="text-sm font-medium text-slate-600">
              {busy ? "Processing…" : "Choose a signature image"}
            </p>
            <p className="text-xs text-slate-400">PNG, JPG or WebP · max {MAX_IMAGE_MB} MB</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                handleUploadFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        )}

        {tab !== "upload" && (
          <button
            onClick={insert}
            disabled={busy}
            className="mt-5 w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md disabled:opacity-60">
            Insert Signature
          </button>
        )}
      </div>
    </div>
  );
}
