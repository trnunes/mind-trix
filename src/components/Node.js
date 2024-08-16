import React, { useState } from "react";
import { FaTrashAlt, FaEdit, FaStickyNote, FaPlusCircle } from "react-icons/fa";
import ManualNodeDialog from "./ManualNodeDialog";

function Node({ node, onAddChild, onEdit, onDelete, onAddManualChild }) {
  const [isNotesVisible, setIsNotesVisible] = useState(
    node.notes && node.notes.length > 0
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsNotesVisible(false);
    }
    setIsExpanded(!isExpanded);
  };

  const handleToggleNotesVisibility = () => {
    setIsNotesVisible(!isNotesVisible);
  };

  const handleAddNote = () => {
    if (newNoteContent.trim() === "") return;

    const newNote = {
      id: `note-${Math.random().toString(36).substr(2, 9)}`,
      content: newNoteContent,
    };

    node.notes = [...node.notes, newNote];
    setNewNoteContent("");
    setIsAddingNote(false);
    setIsNotesVisible(true);
  };

  const handleAddManualNode = (title) => {
    onAddManualChild(node, title);
    setDialogOpen(false); // Close the dialog after adding
  };

  const handleDeleteNote = (noteId) => {
    node.notes = node.notes.filter((note) => note.id !== noteId);
    setNewNoteContent("");

    if (node.notes.length === 0) {
      setIsNotesVisible(false);
    }
  };

  const handleDeleteNode = () => {
    if (onDelete) onDelete(node);
  };

  return (
    <div className="node">
      <div className="node-header">
        <button onClick={handleToggleExpand} className="expand-collapse-button">
          {isExpanded ? "▼" : "▶"}
        </button>
        <span>{node.title}</span>
        <button
          onClick={handleToggleNotesVisibility}
          className="toggle-notes-button"
        >
          <FaStickyNote title="Toggle Notes" />{" "}
        </button>
        <button onClick={() => onEdit(node)} className="edit-button">
          <FaEdit title="Edit Node" />
        </button>
        <button onClick={() => onAddChild(node)} className="generate-button">
          <i className="fas fa-magic" title="Generate Subtopics"></i>
        </button>
        <button
          onClick={() => setDialogOpen(true)}
          className="manual-add-button"
        >
          <FaPlusCircle
            title="Add Node Manually"
            style={{ color: "#4CAF50" }}
          />{" "}
        </button>
        <button onClick={handleDeleteNode}>
          <FaTrashAlt title="Delete Node" />
        </button>
      </div>

      {isExpanded && isNotesVisible && (
        <div className="notes-section">
          <h4>Notes:</h4>
          <ul>
            {node.notes &&
              node.notes.map((note) => (
                <li key={note.id} className="note-item">
                  <span>{note.content}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="delete-note"
                  >
                    <FaTrashAlt />
                  </button>
                </li>
              ))}
          </ul>
          {isAddingNote ? (
            <div className="add-note-form">
              <input
                type="text"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter your note"
              />
              <button onClick={handleAddNote}>Add Note</button>
              <button onClick={() => setIsAddingNote(false)}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNote(true)}
              className="add-note-button"
            >
              <FaPlusCircle style={{ color: "#4CAF50" }} /> Add Note{" "}
            </button>
          )}
        </div>
      )}

      {isExpanded && node.children && node.children.length > 0 && (
        <div className="children">
          {node.children.map((child) => (
            <div key={child.id} className="child-node-wrapper">
              <div className="vertical-line"></div>{" "}
              {/* Vertical line for hierarchy */}
              <Node
                node={child}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddManualChild={onAddManualChild}
              />
            </div>
          ))}
        </div>
      )}

      {/* Manual Node Dialog */}
      <ManualNodeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddManualNode}
      />
    </div>
  );
}

export default Node;
