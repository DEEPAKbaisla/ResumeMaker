import React from "react";
import { createRoot } from "react-dom/client";
import { EditorProvider } from "./features/pdf-editor/state/EditorContext.jsx";
import { useEditor } from "./features/pdf-editor/state/editorContext.js";
import PageViewport from "./features/pdf-editor/components/PageViewport.jsx";
import PropertiesPanel from "./features/pdf-editor/components/PropertiesPanel.jsx";
import { createPdfDocumentProxy } from "./features/pdf-editor/utils/pdfjs.js";
import { extractTextLines } from "./features/pdf-editor/utils/textLayer.js";
import { TOOLS } from "./features/pdf-editor/utils/constants.js";

let latestState = null;
let setToolDispatch = null;

function Probe() {
  const { state, dispatch } = useEditor();
  latestState = state;
  if (!setToolDispatch) {
    setToolDispatch = (tool) => dispatch({ type: "SET_TOOL", tool });
  }
  return null;
}

async function main() {
  const res = await fetch("/__fixture.pdf");
  const bytes = await res.arrayBuffer();
  const pdfDoc = await createPdfDocumentProxy(bytes);

  const page = await pdfDoc.getPage(1);
  window.__lines = await extractTextLines(page);
  console.log("[harness] extracted lines:", JSON.stringify(window.__lines));

  const host = document.getElementById("page-host");
  const root = createRoot(host);
  root.render(
    <EditorProvider>
      <PageViewport
        pdfDoc={pdfDoc}
        pageNumber={1}
        size={{ width: 595, height: 842 }}
        zoom={1}
        registerRef={() => {}}
      />
      <div style={{ position: "fixed", top: 0, right: 0, width: 260 }}>
        <PropertiesPanel />
      </div>
      <Probe />
    </EditorProvider>
  );
  window.__state = () => latestState;
  window.__setTool = (tool) => setToolDispatch(tool ?? TOOLS.EDIT_TEXT);
}

main();
