import React, { useState } from "react";

function ApiKeyDialog({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null; // Return nothing if the dialog is not open

  const handleSave = () => {
    if (apiKey.trim() === "") {
      alert("API key cannot be empty.");
      return;
    }
    onSave(apiKey);
    setApiKey(""); // Clear the input after saving
    onClose(); // Close the dialog
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Enter OpenAI API Key</h2>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your OpenAI API key here"
          className="api-key-input"
        />
        <div className="dialog-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyDialog;
