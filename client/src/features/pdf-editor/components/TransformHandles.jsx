import React, { useRef } from "react";
import { CopyIcon, RotateCwIcon, TrashIcon } from "lucide-react";
import { getElementCenter, resizeBox, scalePointsIntoBox } from "../utils/coordinates.js";

const HANDLES = [
  { id: "nw", style: { left: -6, top: -6, cursor: "nwse-resize" } },
  { id: "n", style: { left: "calc(50% - 5px)", top: -6, cursor: "ns-resize" } },
  { id: "ne", style: { right: -6, top: -6, cursor: "nesw-resize" } },
  { id: "e", style: { right: -6, top: "calc(50% - 5px)", cursor: "ew-resize" } },
  { id: "se", style: { right: -6, bottom: -6, cursor: "nwse-resize" } },
  { id: "s", style: { left: "calc(50% - 5px)", bottom: -6, cursor: "ns-resize" } },
  { id: "sw", style: { left: -6, bottom: -6, cursor: "nesw-resize" } },
  { id: "w", style: { left: -6, top: "calc(50% - 5px)", cursor: "ew-resize" } },
];

/**
 * Bounding-box chrome around the selected element: resize handles, a rotation
 * handle and duplicate/delete actions. Lives in screen coordinates and
 * inherits the element's rotation so the handles follow the box.
 */
export default function TransformHandles({ el, zoom, onDelete, onDuplicate, onPatch, onGestureStart }) {
  const gesture = useRef(null);

  const beginGesture = (event, kind, handleId) => {
    event.stopPropagation();
    event.preventDefault();
    const center = getElementCenter(el);
    gesture.current = {
      kind,
      handleId,
      startEl: structuredClone(el),
      startX: event.clientX,
      startY: event.clientY,
      startPointerAngle:
        Math.atan2(event.clientY - center.y * zoom, event.clientX - center.x * zoom) *
        (180 / Math.PI),
    };
    onGestureStart?.();
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const onMove = (event) => {
    const g = gesture.current;
    if (!g) return;
    const dxPage = (event.clientX - g.startX) / zoom;
    const dyPage = (event.clientY - g.startY) / zoom;

    if (g.kind === "resize") {
      const resized = resizeBox(g.startEl, g.handleId, dxPage, dyPage);
      const patch = {
        x: resized.x,
        y: resized.y,
        width: resized.width,
        height: resized.height,
      };
      if (Array.isArray(g.startEl.points)) {
        patch.points = scalePointsIntoBox(g.startEl.points, g.startEl, resized);
      }
      onPatch(g.startEl.id, patch);
    } else if (g.kind === "rotate") {
      const center = getElementCenter(g.startEl);
      const angle =
        Math.atan2(event.clientY - center.y * zoom, event.clientX - center.x * zoom) *
        (180 / Math.PI);
      let delta = angle - g.startPointerAngle;
      if (event.shiftKey) delta = Math.round(delta / 15) * 15;
      const rotation = ((((g.startEl.rotation ?? 0) + delta) % 360) + 360) % 360;
      onPatch(g.startEl.id, { rotation });
    }
  };

  const onUp = () => {
    gesture.current = null;
    document.removeEventListener("pointermove", onMove);
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: el.x * zoom,
        top: el.y * zoom,
        width: Math.max(el.width * zoom, 2),
        height: Math.max(el.height * zoom, 2),
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        transformOrigin: "center center",
        outline: "1.5px solid #3b82f6",
        outlineOffset: 0,
      }}>
      {/* Actions */}
      <div className="absolute -top-9 right-0 flex items-center gap-1 pointer-events-auto">
        <button
          title="Duplicate (Ctrl+D)"
          aria-label="Duplicate element"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate?.();
          }}
          className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
          <CopyIcon className="size-4" />
        </button>
        <button
          title="Delete (Del)"
          aria-label="Delete element"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors">
          <TrashIcon className="size-4" />
        </button>
      </div>

      {/* Resize handles */}
      {HANDLES.map((handle) => (
        <span
          key={handle.id}
          role="button"
          aria-label={`Resize ${handle.id}`}
          onPointerDown={(e) => beginGesture(e, "resize", handle.id)}
          className="absolute w-2.5 h-2.5 bg-white border-[1.5px] border-blue-500 rounded-[2px] shadow-sm pointer-events-auto"
          style={handle.style}
        />
      ))}

      {/* Rotation handle */}
      <button
        aria-label="Rotate element"
        title="Rotate (hold Shift to snap)"
        onPointerDown={(e) => beginGesture(e, "rotate")}
        className="absolute left-1/2 -translate-x-1/2 p-1 bg-white border-[1.5px] border-blue-500 rounded-full shadow-sm text-blue-600 pointer-events-auto"
        style={{ top: -34 }}>
        <RotateCwIcon className="size-3.5" />
      </button>
      <span
        aria-hidden="true"
        className="absolute left-1/2 w-px bg-blue-400 pointer-events-none"
        style={{ top: -22, height: 14 }}
      />
    </div>
  );
}
