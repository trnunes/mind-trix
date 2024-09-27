// src/components/Sidebar.js

import React from "react";
import PropTypes from "prop-types";

function Sidebar({
  user,
  mindMaps,
  selectedMapId,
  onSelectMap,
  onCreateNewMindMap,
  onDeleteMindMap,
  onShowAuthPage,
}) {
  const handleCreateNewMindMap = () => {
    if (user) {
      onCreateNewMindMap();
    } else {
      // Redirect to login page with option to create a new account
      onShowAuthPage();
    }
  };

  return (
    <div className="sidebar">
      {/* Circular Create New Mind Map Button */}
      <div className="create-mindmap-container">
        <button className="circular-create-button" onClick={handleCreateNewMindMap}>
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
            className={`mindmap-item ${map.id === selectedMapId ? "selected" : ""}`}
          >
            <span onClick={() => onSelectMap(map.id)}>{map.title}</span>
            <button
              className="delete-mindmap-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling up to onSelectMap
                onDeleteMindMap(map.id); // Triggers the confirmation dialog
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  user: PropTypes.object, // The authenticated user object
  mindMaps: PropTypes.array.isRequired,
  selectedMapId: PropTypes.string,
  onSelectMap: PropTypes.func.isRequired,
  onCreateNewMindMap: PropTypes.func.isRequired,
  onDeleteMindMap: PropTypes.func.isRequired,
  onShowAuthPage: PropTypes.func.isRequired,
};

export default Sidebar;
