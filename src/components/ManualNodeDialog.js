import React, { useState } from "react";

function ManualNodeDialog({ open, onClose, onAdd }) {
  const [newNodeTitle, setNewNodeTitle] = useState("");

  const handleAdd = () => {
    if (newNodeTitle.trim() === "") return;
    onAdd(newNodeTitle);
    setNewNodeTitle("");
    onClose();
  };

  if (!open) return null; // Don't render the dialog if it's not open

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Add New Node</h3>
        <input
          type="text"
          value={newNodeTitle}
          onChange={(e) => setNewNodeTitle(e.target.value)}
          placeholder="Enter node title"
        />
        <div className="dialog-actions">
          <button onClick={handleAdd}>Add Node</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ManualNodeDialog;
