import React from "react";

function Sidebar({
  mindMaps,
  selectedMapId,
  onSelectMap,
  onCreateNewMindMap,
  onDeleteMindMap, // New prop for deleting a mind map
}) {
  return (
    <div className="sidebar">
      {/* Circular Create New Mind Map Button */}
      <div className="create-mindmap-container">
        <button className="circular-create-button" onClick={onCreateNewMindMap}>
          <i className="fas fa-magic"></i>
        </button>
        <span className="create-label">New Map</span>
      </div>

      {/* Separator and Title */}
      <hr className="sidebar-separator" />
      <h3 className="mindmaps-title">Available Mind Maps</h3>

      {/* Mind Maps List */}
      <div className="mindmaps-list">
        {mindMaps.map((map) => (
          <div
            key={map.id}
            className={`mindmap-item ${
              map.id === selectedMapId ? "selected" : ""
            }`}
          >
            <span onClick={() => onSelectMap(map.id)}>{map.title}</span>
            <button
              className="delete-mindmap-button"
              onClick={() => onDeleteMindMap(map.id)} // This triggers the confirmation dialog
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
