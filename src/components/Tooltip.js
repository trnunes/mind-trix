import React from "react";

import { FaQuestionCircle } from "react-icons/fa";

function Tooltip({ icon, text }) {
  return (
    <div className="tooltip-container">
      {icon}
      <span className="tooltip-text">{text}</span>
    </div>
  );
}

export default Tooltip;
