import React, { useState } from "react";
import { generateChildrenUsingGPT } from "../api/chatgpt";

function MindMapCreationDialog({ isOpen, onClose, onCreate }) {
  const [selectedOption, setSelectedOption] = useState("single-topic");
  const [singleTopic, setSingleTopic] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateMindMap = async () => {
    setIsLoading(true);

    if (selectedOption === "single-topic") {
      if (!singleTopic) {
        alert("Please enter a topic.");
        setIsLoading(false);
        return;
      }

      // Generate subtopics for the single topic using OpenAI API
      try {
        const generatedSubtopics = await generateChildrenUsingGPT(
          singleTopic,
          [],
          process.env.REACT_APP_OPENAI_API_KEY
        );
        const newMap = {
          id: `map-${Math.random().toString(36).substr(2, 9)}`,
          title: singleTopic,
          children: generatedSubtopics.map((title) => ({
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            title,
            children: [],
            notes: [],
          })),
        };

        onCreate(newMap); // Pass the created mind map to the parent
        onClose(); // Close the dialog
      } catch (error) {
        console.error("Error generating subtopics:", error);
        alert("There was an issue generating subtopics. Please try again.");
      }
    } else if (selectedOption === "description") {
      if (!textDescription) {
        alert("Please enter a description.");
        setIsLoading(false);
        return;
      }

      // Generate a mind map structure from the description using OpenAI API
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Use your API key
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a mind map generation assistant. Given a textual description, generate a structured mind map represented as an array of nodes with subtopics.",
                },
                {
                  role: "user",
                  content: `Create a mind map from the following description: "${textDescription}"`,
                },
              ],
              max_tokens: 300,
            }),
          }
        );

        const data = await response.json();
        const mindMapStructure = JSON.parse(
          data.choices[0].message.content.trim()
        );

        const newMap = {
          id: `map-${Math.random().toString(36).substr(2, 9)}`,
          title: mindMapStructure.title,
          children: mindMapStructure.children.map((child) => ({
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            title: child.title,
            children: child.children || [],
            notes: [],
          })),
        };

        onCreate(newMap); // Pass the created mind map to the parent
        onClose(); // Close the dialog
      } catch (error) {
        console.error("Error generating mind map from description:", error);
        alert("There was an issue generating the mind map. Please try again.");
      }
    }

    setIsLoading(false);
  };

  return isOpen ? (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Create New Mind Map</h2>
        <div className="options">
          <label>
            <input
              type="radio"
              name="option"
              value="single-topic"
              checked={selectedOption === "single-topic"}
              onChange={() => setSelectedOption("single-topic")}
            />
            Start with a Single Topic
          </label>
          <label>
            <input
              type="radio"
              name="option"
              value="description"
              checked={selectedOption === "description"}
              onChange={() => setSelectedOption("description")}
            />
            Start with a Textual Description
          </label>
        </div>

        {selectedOption === "single-topic" && (
          <input
            type="text"
            placeholder="Enter a single topic..."
            value={singleTopic}
            onChange={(e) => setSingleTopic(e.target.value)}
            className="input-field"
          />
        )}

        {selectedOption === "description" && (
          <textarea
            placeholder="Enter a textual description of your mind map..."
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            className="textarea-field"
          ></textarea>
        )}

        <div className="dialog-actions">
          <button onClick={handleCreateMindMap} disabled={isLoading}>
            {isLoading ? "Generating..." : "Create"}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  ) : null;
}

export default MindMapCreationDialog;
