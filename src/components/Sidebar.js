import React from "react";

function Sidebar({ mindMaps, selectedMapId, onSelectMap }) {
  return (
    <div className="sidebar">
      <h2>Your Mind Maps</h2>
      <ul>
        {mindMaps.map((map) => (
          <li
            key={map.id}
            className={map.id === selectedMapId ? "selected" : ""}
            onClick={() => onSelectMap(map.id)} // Trigger the correct map selection
          >
            {map.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
