import React, { useState } from "react";

function ApiKeyDialog({ isOpen, onClose, onSave, isSaving = false, errorMessage }) {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null; // Return nothing if the dialog is not open

  const handleSave = async () => {
    if (apiKey.trim() === "") {
      alert("API key cannot be empty.");
      return;
    }
    try {
      await onSave(apiKey);
      setApiKey(""); // Clear the input after saving
    } catch (error) {
      console.error("Unable to persist API key:", error);
      throw error;
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Enter OpenAI API Key</h2>
        <p className="dialog-subtext">
          Keys are stored encrypted per account. Paste a new key to update it.
        </p>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your OpenAI API key here"
          className="api-key-input"
        />
        {errorMessage && (
          <p className="dialog-error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="dialog-actions">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyDialog;
