export const TOOLS = {
  SELECT: "select",
  TEXT: "text",
  EDIT_TEXT: "editText",
  SIGNATURE: "signature",
  IMAGE: "image",
  DRAW: "draw",
  RECT: "rect",
  ELLIPSE: "ellipse",
  LINE: "line",
  ARROW: "arrow",
  HIGHLIGHT: "highlight",
  WHITEOUT: "whiteout",
};

export const TOOL_LIST = [
  { id: TOOLS.SELECT, label: "Select", icon: "select" },
  { id: TOOLS.TEXT, label: "Text", icon: "text" },
  { id: TOOLS.EDIT_TEXT, label: "Edit existing text", icon: "editText" },
  { id: TOOLS.SIGNATURE, label: "Signature", icon: "signature" },
  { id: TOOLS.IMAGE, label: "Image", icon: "image" },
  { id: TOOLS.DRAW, label: "Draw", icon: "draw" },
  { id: TOOLS.HIGHLIGHT, label: "Highlight", icon: "highlight" },
  { id: TOOLS.WHITEOUT, label: "Whiteout", icon: "whiteout" },
  { id: TOOLS.RECT, label: "Rectangle", icon: "rect" },
  { id: TOOLS.ELLIPSE, label: "Circle", icon: "ellipse" },
  { id: TOOLS.LINE, label: "Line", icon: "line" },
  { id: TOOLS.ARROW, label: "Arrow", icon: "arrow" },
];

// Tools whose gesture creates an element by dragging on the page.
export const DRAG_TOOLS = new Set([
  TOOLS.DRAW,
  TOOLS.RECT,
  TOOLS.ELLIPSE,
  TOOLS.LINE,
  TOOLS.ARROW,
  TOOLS.HIGHLIGHT,
  TOOLS.WHITEOUT,
]);

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.15;
export const HISTORY_LIMIT = 50;
export const AUTOSAVE_DELAY = 1500;

export const MAX_UPLOAD_MB = 10;
export const MAX_IMAGE_MB = 4;
export const IMAGE_MAX_DIMENSION = 1600;

export const FONT_FAMILIES = [
  { value: "Helvetica", label: "Arial (Helvetica)" },
  { value: "Times", label: "Times New Roman" },
  { value: "Courier", label: "Courier New" },
];

export const FONT_CSS = {
  Helvetica: 'Helvetica, Arial, sans-serif',
  Times: "'Times New Roman', Times, serif",
  Courier: "'Courier New', Courier, monospace",
};

export const TEXT_COLORS = ["#111827", "#dc2626", "#2563eb", "#059669", "#d97706"];
export const STROKE_COLORS = ["#dc2626", "#2563eb", "#059669", "#111827", "#f59e0b"];
export const HIGHLIGHT_COLORS = ["#fde047", "#86efac", "#93c5fd", "#fda4af", "#e9d5ff"];

export const DEFAULTS = {
  fontSize: 16,
  fontFamily: "Helvetica",
  textColor: "#111827",
  textBgColor: "#ffffff",
  bold: false,
  italic: false,
  underline: false,
  align: "left",
  strokeWidth: 2,
  strokeColor: "#dc2626",
  fillColor: "none",
  opacity: 1,
  drawColor: "#059669",
  highlightColor: "#fde047",
  highlightOpacity: 0.35,
};

export const PAGE_GUTTER = 24;
