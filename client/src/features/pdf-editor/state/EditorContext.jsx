import { useMemo, useReducer } from "react";
import { EditorContext } from "./editorContext.js";
import { initialState, editorReducer } from "./editorReducer.js";

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
