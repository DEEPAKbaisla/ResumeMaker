import React, { useEffect, useRef } from "react";
import { FONT_CSS } from "../utils/constants.js";

function arrowHeadLines(points) {
  const [from, to] = points;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const length = Math.max(7, 3.5 * 2);
  const spread = Math.PI / 7;
  return [
    {
      x2: to.x - length * Math.cos(angle - spread),
      y2: to.y - length * Math.sin(angle - spread),
    },
    {
      x2: to.x - length * Math.cos(angle + spread),
      y2: to.y - length * Math.sin(angle + spread),
    },
  ];
}

function StrokeSvg({ el }) {
  const w = Math.max(el.width, 1);
  const h = Math.max(el.height, 1);
  const rel = el.points.map((p) => ({ x: p.x - el.x, y: p.y - el.y }));
  const common = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    opacity: el.opacity ?? 1,
    fill: "none",
  };
  return (
    <svg
      className="absolute inset-0 overflow-visible"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true">
      {rel.length === 2 ? (
        <>
          <line x1={rel[0].x} y1={rel[0].y} x2={rel[1].x} y2={rel[1].y} {...common} />
          {el.type === "arrow" &&
            arrowHeadLines(rel).map((head, i) => (
              <line key={i} x1={rel[1].x} y1={rel[1].y} x2={head.x2} y2={head.y2} {...common} />
            ))}
        </>
      ) : (
        <polyline
          points={rel.map((p) => `${p.x},${p.y}`).join(" ")}
          {...common}
        />
      )}
    </svg>
  );
}

/** Renders one editor element in SCREEN coordinates (already scaled by zoom). */
function ElementContent({ el, zoom, editing, onContentChange, onCommitEdit }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const node = textareaRef.current;
      // preventScroll: focusing must never jump the page under the cursor.
      node.focus({ preventScroll: true });
      // Place the caret at the end; auto select() would let a single stray
      // keystroke wipe the whole original text.
      const end = node.value.length;
      node.setSelectionRange(end, end);
    }
  }, [editing]);

  const base = "absolute inset-0";

  switch (el.type) {
    case "text":
    case "textEdit": {
      // Distance from the box top to the browser's first-line baseline
      // (half-leading 0.125em + ascent ≈ 0.8em for line-height 1.25).
      const baselinePad =
        Math.max(
          (el.baselineOffset ?? el.fontSize * 0.85) - el.fontSize * 0.925,
          0
        ) * zoom;
      const textStyle = {
        fontFamily: FONT_CSS[el.fontFamily] ?? FONT_CSS.Helvetica,
        fontSize: el.fontSize * zoom,
        lineHeight: 1.25,
        color: el.color,
        fontWeight: el.bold ? 700 : 400,
        fontStyle: el.italic ? "italic" : "normal",
        textDecoration: el.underline ? "underline" : "none",
        textAlign: el.align,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      };
      const cover =
        el.type === "textEdit" ? (
          <div
            className={`${base} pointer-events-none`}
            style={{ backgroundColor: el.bgColor ?? "#ffffff" }}
          />
        ) : null;
      if (editing) {
        return (
          <>
            {cover}
            <textarea
              ref={textareaRef}
              className={`${base} resize-none overflow-hidden outline-none`}
              style={{
                ...textStyle,
                padding: `${baselinePad}px 0 0`,
                border: "none",
                background: "transparent",
                // Line boxes from extraction can be shorter than one CSS line;
                // guarantee full first-line height so glyphs aren't clipped.
                minHeight: Math.ceil(el.fontSize * zoom * 1.25 + baselinePad),
              }}
              value={el.content}
              aria-label="Edit text"
              onChange={(e) => onContentChange?.(e.target.value)}
              onBlur={() => onCommitEdit?.()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCommitEdit?.();
                }
              }}
            />
          </>
        );
      }
      if (el.type === "textEdit") {
        return (
          <>
            {cover}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: baselinePad, ...textStyle }}>
              {el.content || " "}
            </div>
          </>
        );
      }
      return (
        <div className={`${base} overflow-visible`} style={textStyle}>
          {el.content || " "}
        </div>
      );
    }
    case "image":
    case "signature":
      return (
        <img
          src={el.src}
          alt={el.type === "signature" ? "Signature" : "Image"}
          draggable={false}
          className={`${base} select-none pointer-events-none`}
          style={{ opacity: el.opacity ?? 1 }}
        />
      );
    case "rect":
      return (
        <div
          className={base}
          style={{
            border: el.strokeColor ? `${el.strokeWidth * zoom}px solid ${el.strokeColor}` : undefined,
            background: el.fillColor ?? "transparent",
            opacity: el.fillColor ? (el.opacity ?? 1) : (el.opacity ?? 1),
            boxSizing: "border-box",
          }}
        />
      );
    case "ellipse":
      return (
        <div
          className={base}
          style={{
            borderRadius: "50%",
            border: el.strokeColor ? `${el.strokeWidth * zoom}px solid ${el.strokeColor}` : undefined,
            background: el.fillColor ?? "transparent",
            opacity: el.opacity ?? 1,
            boxSizing: "border-box",
          }}
        />
      );
    case "highlight":
      return (
        <div
          className={base}
          style={{
            background: el.fillColor,
            opacity: el.opacity ?? 0.35,
            mixBlendMode: "multiply",
          }}
        />
      );
    case "whiteout":
      return (
        <div
          className={`${base} bg-white`}
          style={{ boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.45)" }}
        />
      );
    case "line":
    case "arrow":
    case "drawing":
      return <StrokeSvg el={el} />;
    default:
      return null;
  }
}

export default function ElementView({ el, zoom, isSelected, isEditing, onContentChange, onCommitEdit }) {
  return (
    <div
      data-element-id={el.id}
      className={`absolute ${isSelected ? "" : ""}`}
      style={{
        left: el.x * zoom,
        top: el.y * zoom,
        width: Math.max(el.width * zoom, 2),
        height: Math.max(el.height * zoom, 2),
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        transformOrigin: "center center",
      }}>
      <ElementContent
        el={el}
        zoom={zoom}
        editing={isEditing}
        onContentChange={onContentChange}
        onCommitEdit={onCommitEdit}
      />
    </div>
  );
}
