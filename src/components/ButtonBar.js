import React from "react";

function ButtonBar({ onExportMindMap, onImportMindMap }) {
  return (
    <div className="button-bar">
      <button className="button-bar-item" onClick={onExportMindMap}>
        Save Map
      </button>
      <input
        type="file"
        id="import-file"
        style={{ display: "none" }}
        accept=".json"
        onChange={onImportMindMap}
      />
      <button
        className="button-bar-item"
        onClick={() => document.getElementById("import-file").click()}
      >
        Open Map
      </button>
    </div>
  );
}

export default ButtonBar;
