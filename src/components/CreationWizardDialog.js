import React, { useState } from "react";
import { generateChildrenUsingGPT } from "../api/chatgpt";

function CreationWizardDialog({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [singleTopic, setSingleTopic] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => setStep(step + 1);
  const handlePreviousStep = () => setStep(step - 1);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    handleNextStep();
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      let generatedChildren = [];
      if (selectedOption === "single-topic") {
        generatedChildren = await generateChildrenUsingGPT(singleTopic, []);
      } else if (selectedOption === "detailed-description") {
        generatedChildren = await generateChildrenUsingGPT(
          detailedDescription,
          [],
          true // A flag for detailed map generation
        );
      }
      const newMap = createMindMap(
        selectedOption === "single-topic" ? singleTopic : "Generated Map"
      );
      newMap.children = generatedChildren.map((title) => ({
        id: `node-${Math.random().toString(36).substr(2, 9)}`,
        title,
        children: [],
        notes: [],
      }));
      onComplete(newMap); // Complete the wizard and pass the new map to App.js
    } catch (error) {
      console.error("Error generating mind map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog wizard-dialog">
        <h2>Create a New Mind Map</h2>
        {step === 1 && (
          <>
            <p>Select the creation method:</p>
            <div className="wizard-options">
              <button
                className="wizard-option-button"
                onClick={() => handleOptionSelect("single-topic")}
              >
                Single Topic (Generate Subtopics)
              </button>
              <button
                className="wizard-option-button"
                onClick={() => handleOptionSelect("detailed-description")}
              >
                Detailed Description (Generate Full Map)
              </button>
            </div>
          </>
        )}
        {step === 2 && selectedOption === "single-topic" && (
          <>
            <p>Enter the main topic for your mind map:</p>
            <input
              type="text"
              value={singleTopic}
              onChange={(e) => setSingleTopic(e.target.value)}
              placeholder="Enter a topic"
              className="fancy-input"
            />
            <div className="wizard-navigation">
              <button onClick={handlePreviousStep}>Back</button>
              <button
                onClick={handleFinish}
                disabled={singleTopic.trim() === ""}
              >
                Finish
              </button>
            </div>
          </>
        )}
        {step === 2 && selectedOption === "detailed-description" && (
          <>
            <p>Provide a detailed description of your mind map:</p>
            <textarea
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              placeholder="Describe the map..."
              className="fancy-textarea"
            />
            <div className="wizard-navigation">
              <button onClick={handlePreviousStep}>Back</button>
              <button
                onClick={handleFinish}
                disabled={detailedDescription.trim() === ""}
              >
                Finish
              </button>
            </div>
          </>
        )}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreationWizardDialog;
