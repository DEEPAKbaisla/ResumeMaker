import React from "react";
import {
  ArrowUpRightIcon,
  CircleIcon,
  EraserIcon,
  HighlighterIcon,
  ImagePlusIcon,
  MinusIcon,
  MousePointer2Icon,
  PencilIcon,
  PenLineIcon,
  SquareIcon,
  TextCursorInputIcon,
  TypeIcon,
} from "lucide-react";
import { TOOL_LIST, TOOLS } from "../utils/constants.js";
import { useEditor } from "../state/editorContext.js";

const ICONS = {
  select: MousePointer2Icon,
  text: TypeIcon,
  editText: TextCursorInputIcon,
  signature: PenLineIcon,
  image: ImagePlusIcon,
  draw: PencilIcon,
  highlight: HighlighterIcon,
  whiteout: EraserIcon,
  rect: SquareIcon,
  ellipse: CircleIcon,
  line: MinusIcon,
  arrow: ArrowUpRightIcon,
};

const GROUP_BREAKS_AFTER = new Set([
  TOOLS.SELECT,
  TOOLS.EDIT_TEXT,
  TOOLS.IMAGE,
  TOOLS.DRAW,
  TOOLS.WHITEOUT,
]);

export default function Toolbar({ onSignatureClick, onImageClick }) {
  const { state, dispatch } = useEditor();

  return (
    <div
      role="toolbar"
      aria-label="Editing tools"
      className="flex lg:flex-col items-center gap-1 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 px-2 py-1.5 lg:py-3 overflow-x-auto lg:overflow-y-auto shrink-0"
    >
      {TOOL_LIST.map((tool) => {
        const Icon = ICONS[tool.icon];
        const isActive = state.activeTool === tool.id;
        const isInsert = tool.id === TOOLS.SIGNATURE || tool.id === TOOLS.IMAGE;
        const title =
          tool.id === TOOLS.EDIT_TEXT
            ? "Edit existing text: click any text on the page"
            : isInsert
              ? `${tool.label}: insert a new ${tool.id}`
              : tool.label;
        return (
          <React.Fragment key={tool.id}>
            <button
              onClick={() => {
                dispatch({ type: "SET_TOOL", tool: tool.id });
                if (tool.id === TOOLS.SIGNATURE) onSignatureClick?.();
                if (tool.id === TOOLS.IMAGE) onImageClick?.();
              }}
              title={title}
              aria-label={tool.label}
              aria-pressed={isActive}
              className={`p-2.5 rounded-xl shrink-0 transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <Icon className="size-5" />
            </button>
            {GROUP_BREAKS_AFTER.has(tool.id) && (
              <>
                <span className="hidden lg:block w-6 h-px bg-slate-200 my-1" aria-hidden="true" />
                <span className="lg:hidden w-px self-stretch bg-slate-200" aria-hidden="true" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
