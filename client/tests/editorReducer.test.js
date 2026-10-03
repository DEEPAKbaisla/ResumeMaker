import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { editorReducer, initialState, makeId } from "../src/features/pdf-editor/state/editorReducer.js";
import { HISTORY_LIMIT } from "../src/features/pdf-editor/utils/constants.js";

const textEl = (overrides = {}) => ({
  id: "el-1",
  type: "text",
  page: 1,
  x: 100,
  y: 100,
  width: 200,
  height: 30,
  rotation: 0,
  content: "Hello",
  fontSize: 16,
  fontFamily: "Helvetica",
  color: "#111111",
  bold: false,
  italic: false,
  underline: false,
  align: "left",
  ...overrides,
});

const loaded = (elements = []) =>
  editorReducer(initialState, {
    type: "LOAD_DOCUMENT",
    documentId: "doc-1",
    fileName: "test.pdf",
    pagesMeta: [{ width: 612, height: 792 }],
    elements,
  });

describe("editorReducer", () => {
  test("LOAD_DOCUMENT resets state with document data", () => {
    const state = loaded([textEl()]);
    assert.equal(state.documentId, "doc-1");
    assert.equal(state.elements.length, 1);
    assert.equal(state.dirty, false);
  });

  test("ADD_ELEMENT appends, selects and records undo history", () => {
    const s0 = loaded();
    const s1 = editorReducer(s0, { type: "ADD_ELEMENT", element: textEl() });
    assert.equal(s1.elements.length, 1);
    assert.equal(s1.selectedId, "el-1");
    assert.equal(s1.dirty, true);
    assert.equal(s1.history.past.length, 1);

    const undone = editorReducer(s1, { type: "UNDO" });
    assert.equal(undone.elements.length, 0);
    assert.equal(undone.history.future.length, 1);
  });

  test("REDO restores what UNDO removed", () => {
    let s = loaded();
    s = editorReducer(s, { type: "ADD_ELEMENT", element: textEl() });
    s = editorReducer(s, { type: "PATCH_ELEMENT", id: "el-1", patch: { content: "World" } });
    s = editorReducer(s, { type: "UNDO" });
    assert.equal(s.elements[0].content, "Hello");
    s = editorReducer(s, { type: "REDO" });
    assert.equal(s.elements[0].content, "World");
  });

  test("transient patches do not grow history; non-transient ones do", () => {
    let s = loaded([textEl()]);
    const depthAfterLoad = s.history.past.length;
    s = editorReducer(s, {
      type: "PATCH_ELEMENT",
      id: "el-1",
      patch: { x: 150 },
      transient: true,
    });
    assert.equal(s.history.past.length, depthAfterLoad);
    s = editorReducer(s, {
      type: "PATCH_ELEMENT",
      id: "el-1",
      patch: { y: 42 },
      transient: false,
    });
    assert.equal(s.history.past.length, depthAfterLoad + 1);
  });

  test("DELETE_ELEMENT removes it and clears selection", () => {
    let s = loaded([textEl()]);
    s = editorReducer(s, { type: "SET_SELECTED", id: "el-1" });
    s = editorReducer(s, { type: "DELETE_ELEMENT", id: "el-1" });
    assert.equal(s.elements.length, 0);
    assert.equal(s.selectedId, null);
  });

  test("DUPLICATE_ELEMENT clones with new id and an offset", () => {
    let s = loaded([textEl({ points: undefined })]);
    s = editorReducer(s, { type: "DUPLICATE_ELEMENT", id: "el-1" });
    assert.equal(s.elements.length, 2);
    const clone = s.elements[1];
    assert.notEqual(clone.id, "el-1");
    assert.equal(clone.x, 116);
    assert.equal(clone.y, 116);
    assert.equal(s.selectedId, clone.id);
  });

  test("DUPLICATE_ELEMENT translates point arrays too", () => {
    const draw = {
      ...textEl({ id: "d-1", type: "drawing", width: 50, height: 40 }),
      points: [
        { x: 10, y: 10 },
        { x: 60, y: 50 },
      ],
      strokeColor: "#000000",
      strokeWidth: 2,
      opacity: 1,
    };
    let s = loaded([draw]);
    s = editorReducer(s, { type: "DUPLICATE_ELEMENT", id: "d-1" });
    assert.deepEqual(
      s.elements[1].points.map((p) => [p.x, p.y]),
      [[26, 26], [76, 66]]
    );
  });

  test("history snapshots are deep copies (later edits never corrupt undo)", () => {
    let s = loaded([textEl()]);
    s = editorReducer(s, { type: "ADD_ELEMENT", element: textEl({ id: "el-2" }) });
    // Mutate the live array directly to try to poison the snapshot.
    s.elements[0].content = "MUTATED";
    const undone = editorReducer(s, { type: "UNDO" });
    // Undo restores the state before el-2 was added; el-1 must be untouched.
    assert.equal(undone.elements[0].content, "Hello");
  });

  test("history is capped at HISTORY_LIMIT entries", () => {
    let s = loaded();
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
      s = editorReducer(s, {
        type: "ADD_ELEMENT",
        element: textEl({ id: makeId(), content: `v${i}` }),
      });
    }
    assert.ok(s.history.past.length <= HISTORY_LIMIT);
    // Oldest snapshots were dropped; newest still undoable.
    for (let i = 0; i < HISTORY_LIMIT; i++) s = editorReducer(s, { type: "UNDO" });
    assert.equal(s.elements.length, HISTORY_LIMIT + 20 - HISTORY_LIMIT);
    assert.equal(s.history.past.length, 0);
  });

  test("SET_TOOL clears selection when entering drawing tools", () => {
    let s = loaded([textEl()]);
    s = editorReducer(s, { type: "SET_SELECTED", id: "el-1" });
    s = editorReducer(s, { type: "SET_TOOL", tool: "rect" });
    assert.equal(s.selectedId, null);
    s = editorReducer(s, { type: "SET_SELECTED", id: "el-1" });
    s = editorReducer(s, { type: "SET_TOOL", tool: "select" });
    assert.equal(s.selectedId, "el-1");
  });

  test("UNDO/REDO on empty stacks are no-ops", () => {
    const s = loaded();
    assert.equal(editorReducer(s, { type: "UNDO" }), s);
    assert.equal(editorReducer(s, { type: "REDO" }), s);
  });
});
