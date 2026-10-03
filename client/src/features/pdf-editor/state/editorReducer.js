import { HISTORY_LIMIT } from "../utils/constants.js";

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const initialState = {
  documentId: null,
  fileName: "",
  pagesMeta: [],
  elements: [],
  selectedId: null,
  editingTextId: null,
  activeTool: "select",
  history: { past: [], future: [] },
  dirty: false,
};

function snapshot(state) {
  return {
    past: [...state.history.past, structuredClone(state.elements)].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function selectToolState(state, tool) {
  const drawingTools = [
    "text",
    "editText",
    "draw",
    "rect",
    "ellipse",
    "line",
    "arrow",
    "highlight",
    "whiteout",
  ];
  return {
    ...state,
    activeTool: tool,
    // Drawing tools start fresh gestures; keep selection for the select tool.
    selectedId: drawingTools.includes(tool) ? null : state.selectedId,
    editingTextId: null,
  };
}

export function editorReducer(state, action) {
  switch (action.type) {
    case "LOAD_DOCUMENT":
      return {
        ...initialState,
        documentId: action.documentId,
        fileName: action.fileName,
        pagesMeta: action.pagesMeta,
        elements: action.elements ?? [],
      };

    case "RESET_EDITOR":
      return { ...initialState };

    case "SET_TOOL":
      return selectToolState(state, action.tool);

    case "SET_SELECTED":
      return { ...state, selectedId: action.id, editingTextId: null };

    case "SET_EDITING_TEXT":
      return { ...state, editingTextId: action.id, selectedId: action.id ?? state.selectedId };

    // A textarea blur may arrive after another edit already started; only
    // close the editor if it still belongs to the element that blurred.
    case "COMMIT_EDITING":
      return state.editingTextId === action.id
        ? { ...state, editingTextId: null }
        : state;

    case "PUSH_HISTORY":
      return { ...state, history: snapshot(state), dirty: true };

    case "ADD_ELEMENT": {
      const element = Array.isArray(action.element) ? action.element : [action.element];
      return {
        ...state,
        history: snapshot(state),
        elements: [...state.elements, ...element],
        selectedId:
          element.length === 1 && !action.keepSelection ? element[0].id : state.selectedId,
        dirty: true,
      };
    }

    case "PATCH_ELEMENT": {
      const exists = state.elements.some((el) => el.id === action.id);
      if (!exists) return state;
      return {
        ...state,
        history: action.transient ? state.history : snapshot(state),
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.patch } : el
        ),
        dirty: true,
      };
    }

    case "DELETE_ELEMENT": {
      const exists = state.elements.some((el) => el.id === action.id);
      if (!exists) return state;
      return {
        ...state,
        history: snapshot(state),
        elements: state.elements.filter((el) => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        editingTextId: state.editingTextId === action.id ? null : state.editingTextId,
        dirty: true,
      };
    }

    case "DUPLICATE_ELEMENT": {
      const source = state.elements.find((el) => el.id === action.id);
      if (!source) return state;
      const clone = structuredClone(source);
      clone.id = makeId();
      clone.x += 16;
      clone.y += 16;
      if (Array.isArray(clone.points)) {
        clone.points = clone.points.map((p) => ({ x: p.x + 16, y: p.y + 16 }));
      }
      return {
        ...state,
        history: snapshot(state),
        elements: [...state.elements, clone],
        selectedId: clone.id,
        dirty: true,
      };
    }

    case "UNDO": {
      if (!state.history.past.length) return state;
      const past = [...state.history.past];
      const previous = past.pop();
      return {
        ...state,
        elements: previous,
        history: {
          past,
          future: [structuredClone(state.elements), ...state.history.future].slice(0, HISTORY_LIMIT),
        },
        selectedId: null,
        editingTextId: null,
        dirty: true,
      };
    }

    case "REDO": {
      if (!state.history.future.length) return state;
      const future = [...state.history.future];
      const next = future.shift();
      return {
        ...state,
        elements: next,
        history: {
          past: [...state.history.past, structuredClone(state.elements)].slice(-HISTORY_LIMIT),
          future,
        },
        selectedId: null,
        editingTextId: null,
        dirty: true,
      };
    }

    case "MARK_SAVED":
      return { ...state, dirty: false };

    default:
      return state;
  }
}
