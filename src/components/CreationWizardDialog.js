import React, { useState } from "react";
import { generateChildrenUsingGPT } from "../api/chatgpt";

function CreationWizardDialog({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [singleTopic, setSingleTopic] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Navigate to the next step
  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  // Navigate to the previous step
  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Handle selection of generation type (single-topic or detailed-description)
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setErrorMessage(""); // Clear any existing errors
    handleNextStep();
  };

  // Handle the final submission of the wizard
  const handleFinish = async () => {
    if (!selectedOption) {
      setErrorMessage("Please select a generation method.");
      return;
    }

    if (
      (selectedOption === "single-topic" && !singleTopic.trim()) ||
      (selectedOption === "detailed-description" && !detailedDescription.trim())
    ) {
      setErrorMessage("Please provide the required input.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

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

      // Create the new map structure
      const newMap = {
        id: `map-${Math.random().toString(36).substr(2, 9)}`,
        title: selectedOption === "single-topic" ? singleTopic : "Generated Map",
        children: generatedChildren.map((title) => ({
          id: `node-${Math.random().toString(36).substr(2, 9)}`,
          title,
          children: [],
          notes: [],
        })),
      };

      // Complete the wizard and pass the new map to the parent
      onComplete(newMap);
    } catch (error) {
      console.error("Error generating mind map:", error);
      setErrorMessage("An error occurred while generating the mind map.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog wizard-dialog">
        <h2>Create a New Mind Map</h2>

        {/* Step 1: Select the generation method */}
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

        {/* Step 2: Single Topic Input */}
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

        {/* Step 2: Detailed Description Input */}
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default CreationWizardDialog;
