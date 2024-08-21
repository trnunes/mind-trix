import React, { useRef } from "react";

function Header({ onCreateNewMindMap, onExportMindMap, onImportMindMap }) {
  const fileInputRef = useRef();

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <header className="header">
      <h1>Generative Mind Map</h1>
      <div className="header-buttons">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef} // Use ref to access this element
          style={{ display: "none" }}
          onChange={onImportMindMap}
        />
      </div>
    </header>
  );
}

export default Header;
