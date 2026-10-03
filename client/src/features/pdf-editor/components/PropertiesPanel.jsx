import React, { useEffect, useState } from "react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CopyIcon,
  ItalicIcon,
  TrashIcon,
  UnderlineIcon,
  XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEditor } from "../state/editorContext.js";
import {
  FONT_FAMILIES,
  HIGHLIGHT_COLORS,
  STROKE_COLORS,
  TEXT_COLORS,
} from "../utils/constants.js";

const TYPE_LABEL = {
  text: "Text",
  textEdit: "Edited PDF text",
  image: "Image",
  signature: "Signature",
  drawing: "Freehand drawing",
  line: "Line",
  arrow: "Arrow",
  rect: "Rectangle",
  ellipse: "Circle",
  highlight: "Highlight",
  whiteout: "Whiteout",
};

function ColorSwatches({ colors, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          role="radio"
          aria-checked={value === color}
          aria-label={`${label} ${color}`}
          onClick={() => onChange(color)}
          className={`size-6 rounded-lg border-2 transition-transform ${
            value === color
              ? "border-blue-500 scale-110"
              : "border-slate-200 hover:scale-105"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs font-medium text-slate-500 shrink-0">{label}</span>
      <div className="flex items-center justify-end gap-1.5 min-w-0">{children}</div>
    </div>
  );
}

const FONT_SIZE_MIN = 6;
const FONT_SIZE_MAX = 96;

/**
 * Font-size field you can actually type in: the draft text is kept locally so
 * intermediate values ("1" on the way to "12") never snap to the clamp floor.
 * Complete in-range values (spinner arrows, full numbers) commit instantly;
 * anything else commits clamped-free on blur/Enter or reverts when invalid.
 */
function FontSizeInput({ value, onCommit }) {
  const [draft, setDraft] = useState(String(Math.round(value)));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(Math.round(value)));
  }, [value, focused]);

  const commit = (raw) => {
    const parsed = Number(raw);
    if (raw !== "" && Number.isFinite(parsed)) {
      const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(parsed)));
      if (clamped !== Math.round(value)) {
        onCommit(clamped);
        return;
      }
    }
    setDraft(String(Math.round(value)));
  };

  return (
    <input
      type="number"
      min={FONT_SIZE_MIN}
      max={FONT_SIZE_MAX}
      value={draft}
      aria-label="Font size"
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        // Spinner steps and fully typed values commit at once; partial drafts
        // wait for blur/Enter via commit().
        const parsed = Number(raw);
        if (
          raw !== "" &&
          e.target.validity?.valid &&
          Number.isFinite(parsed) &&
          parsed >= FONT_SIZE_MIN &&
          parsed <= FONT_SIZE_MAX
        ) {
          setDraft(String(Math.round(parsed)));
          onCommit(Math.round(parsed));
        }
      }}
      onBlur={() => {
        setFocused(false);
        commit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1.5 no-global-input"
    />
  );
}

export default function PropertiesPanel({ onClose }) {
  const { state, dispatch } = useEditor();
  const selected = state.elements.find((el) => el.id === state.selectedId);

  if (!selected) {
    return (
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-l border-slate-200 p-5 flex-col gap-3 overflow-y-auto">
        <h2 className="text-sm font-bold text-slate-700">Properties</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select an element on the page to edit its style, or pick a tool from
          the toolbar to add something new.
        </p>
        <ul className="text-[11px] text-slate-400 space-y-1.5 mt-2 leading-relaxed">
          <li><kbd className="font-semibold">Double-click</kbd> text to edit it</li>
          <li><kbd className="font-semibold">Del</kbd> removes selection</li>
          <li><kbd className="font-semibold">Ctrl+Z / Ctrl+Y</kbd> undo &amp; redo</li>
          <li><kbd className="font-semibold">Ctrl+S</kbd> save now</li>
          <li><kbd className="font-semibold">Esc</kbd> deselect</li>
        </ul>
      </aside>
    );
  }

  const patch = (p, transient = false) =>
    dispatch({ type: "PATCH_ELEMENT", id: selected.id, patch: p, transient });

  const isStrokeType = ["drawing", "line", "arrow"].includes(selected.type);
  const isFillShape = ["rect", "ellipse"].includes(selected.type);
  const isTextLike = selected.type === "text" || selected.type === "textEdit";
  const hasRotation =
    selected.type !== "highlight" && selected.type !== "whiteout";

  return (
    <aside className="fixed lg:static inset-y-0 right-0 z-40 lg:z-auto w-72 max-w-full lg:w-64 shrink-0 bg-white border-l border-slate-200 p-5 flex flex-col gap-1 overflow-y-auto shadow-2xl lg:shadow-none">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-700">
          {TYPE_LABEL[selected.type] ?? "Element"}
        </h2>
        <button
          onClick={onClose ?? (() => dispatch({ type: "SET_SELECTED", id: null }))}
          aria-label="Close properties"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
          <XIcon className="size-4" />
        </button>
      </div>

      {isTextLike && (
        <>
          <Row label="Font">
            <select
              value={selected.fontFamily}
              onChange={(e) => patch({ fontFamily: e.target.value })}
              aria-label="Font family"
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 font-medium">
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Size">
            <FontSizeInput
              value={selected.fontSize}
              onCommit={(fontSize) => patch({ fontSize })}
            />
          </Row>
          <Row label="Style">
            {[
              { icon: BoldIcon, key: "bold", label: "Bold" },
              { icon: ItalicIcon, key: "italic", label: "Italic" },
              { icon: UnderlineIcon, key: "underline", label: "Underline" },
            ].map(({ icon, key, label }) => {
              const Icon = icon;
              return (
                <button
                  key={key}
                  aria-label={label}
                  aria-pressed={!!selected[key]}
                  title={label}
                  onClick={() => patch({ [key]: !selected[key] })}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    selected[key]
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  <Icon className="size-4" />
                </button>
              );
            })}
          </Row>
          <Row label="Align">
            {[
              { icon: AlignLeftIcon, value: "left", label: "Align left" },
              { icon: AlignCenterIcon, value: "center", label: "Align center" },
              { icon: AlignRightIcon, value: "right", label: "Align right" },
            ].map(({ icon, value, label }) => {
              const Icon = icon;
              return (
                <button
                  key={value}
                  aria-label={label}
                  aria-pressed={selected.align === value}
                  title={label}
                  onClick={() => patch({ align: value })}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    selected.align === value
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  <Icon className="size-4" />
                </button>
              );
            })}
          </Row>
          <Row label="Color">
            <ColorSwatches
              colors={TEXT_COLORS}
              value={selected.color}
              onChange={(color) => patch({ color })}
              label="Text color"
            />
            <input
              type="color"
              value={selected.color}
              onChange={(e) => patch({ color: e.target.value })}
              aria-label="Custom text color"
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent no-global-input"
            />
          </Row>
          {selected.type === "textEdit" && (
            <>
              <Row label="Patch">
                <ColorSwatches
                  colors={["#ffffff", "#f8fafc", "#fef9c3", "#fee2e2"]}
                  value={selected.bgColor ?? "#ffffff"}
                  onChange={(bgColor) => patch({ bgColor })}
                  label="Patch background"
                />
                <input
                  type="color"
                  value={selected.bgColor ?? "#ffffff"}
                  onChange={(e) => patch({ bgColor: e.target.value })}
                  aria-label="Custom patch background"
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent no-global-input"
                />
              </Row>
              <p className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 leading-relaxed mt-1">
                The original glyphs are covered with the sampled background and
                your text is drawn on top — same size and color. Over photos or
                gradients, adjust the patch color for a seamless look.
              </p>
            </>
          )}
        </>
      )}

      {(isStrokeType || isFillShape) && (
        <>
          <Row label="Border">
            <ColorSwatches
              colors={STROKE_COLORS}
              value={selected.strokeColor ?? STROKE_COLORS[0]}
              onChange={(strokeColor) => patch({ strokeColor })}
              label="Border color"
            />
            <input
              type="color"
              value={selected.strokeColor ?? "#000000"}
              onChange={(e) => patch({ strokeColor: e.target.value })}
              aria-label="Custom border color"
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent no-global-input"
            />
          </Row>
          {isFillShape && (
            <Row label="Fill">
              <ColorSwatches
                colors={["#dbeafe", "#fee2e2", "#dcfce7", "#fef9c3"]}
                value={selected.fillColor ?? ""}
                onChange={(fillColor) => patch({ fillColor })}
                label="Fill color"
              />
              <button
                onClick={() => patch({ fillColor: undefined })}
                aria-pressed={!selected.fillColor}
                title="No fill"
                className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                NONE
              </button>
            </Row>
          )}
          <Row label="Width">
            <input
              type="range"
              min={0.5}
              max={12}
              step={0.5}
              value={selected.strokeWidth ?? 2}
              onFocus={() => dispatch({ type: "PUSH_HISTORY" })}
              onChange={(e) => patch({ strokeWidth: Number(e.target.value) }, true)}
              aria-label="Border width"
              className="w-28 accent-blue-600"
            />
            <span className="text-xs tabular-nums text-slate-600 w-8">
              {Number(selected.strokeWidth ?? 2).toFixed(1).replace(/\.0$/, "")}
            </span>
          </Row>
        </>
      )}

      {selected.type === "highlight" && (
        <Row label="Color">
          <ColorSwatches
            colors={HIGHLIGHT_COLORS}
            value={selected.fillColor}
            onChange={(fillColor) => patch({ fillColor })}
            label="Highlight color"
          />
        </Row>
      )}

      {selected.type === "whiteout" && (
        <p className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 leading-relaxed mt-1">
          Whiteout covers content visually in the exported file. It does{" "}
          <strong>not</strong> permanently remove the underlying text — for
          sensitive data, delete the content in the source document instead.
        </p>
      )}

      {(hasRotation || selected.type === "image" || selected.type === "signature") &&
        selected.type !== "textEdit" && (
        <Row label="Opacity">
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={selected.opacity ?? 1}
            onFocus={() => dispatch({ type: "PUSH_HISTORY" })}
            onChange={(e) => patch({ opacity: Number(e.target.value) }, true)}
            aria-label="Opacity"
            className="w-24 accent-blue-600"
          />
          <span className="text-xs tabular-nums text-slate-600 w-9">
            {Math.round((selected.opacity ?? 1) * 100)}%
          </span>
        </Row>
      )}

      <Row label="Rotation">
        <input
          type="range"
          min={0}
          max={359}
          value={Math.round(((selected.rotation ?? 0) % 360 + 360) % 360)}
          onFocus={() => dispatch({ type: "PUSH_HISTORY" })}
          onChange={(e) => patch({ rotation: Number(e.target.value) }, true)}
          aria-label="Rotation degrees"
          className="w-24 accent-blue-600"
        />
        <span className="text-xs tabular-nums text-slate-600 w-9">
          {Math.round(((selected.rotation ?? 0) % 360 + 360) % 360)}°
        </span>
      </Row>

      <div className="flex-1" />

      <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-100">
        <button
          onClick={() => dispatch({ type: "DUPLICATE_ELEMENT", id: selected.id })}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
          <CopyIcon className="size-3.5" /> Duplicate
        </button>
        <button
          onClick={() => {
            dispatch({ type: "DELETE_ELEMENT", id: selected.id });
            toast.success(`${TYPE_LABEL[selected.type] ?? "Element"} deleted`);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
          <TrashIcon className="size-3.5" /> Delete
        </button>
      </div>
    </aside>
  );
}
