import React, { useState } from "react";

function WizardDialog({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [mainTopic, setMainTopic] = useState("");
  const [description, setDescription] = useState("");
  const [subtopicCount, setSubtopicCount] = useState(3);
  const [selectedOption, setSelectedOption] = useState("mainTopic");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle "Next" button click
  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle "Back" button click
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  // Validate the first step (main topic or description input)
  const validateStep1 = () => {
    if (selectedOption === "mainTopic" && mainTopic.trim() === "") {
      setError("Please enter a main topic.");
      return false;
    }
    if (selectedOption === "description" && description.trim() === "") {
      setError("Please provide a description.");
      return false;
    }
    setError("");
    return true;
  };

  // Handle the final form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    const payload =
      selectedOption === "mainTopic"
        ? { type: "mainTopic", mainTopic, subtopicCount }
        : { type: "description", description, subtopicCount };

    // Simulate an API call or any async task
    try {
      await onComplete(payload); // Pass payload back to parent
    } catch (error) {
      console.error("Error completing wizard:", error);
    } finally {
      resetWizard();
      setIsLoading(false);
      onClose();
    }
  };

  // Reset wizard state
  const resetWizard = () => {
    setStep(1);
    setMainTopic("");
    setDescription("");
    setSubtopicCount(3);
    setSelectedOption("mainTopic");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay behind the wizard */}
      <div className="wizard-overlay" onClick={onClose}></div>

      <div className={`wizard-dialog ${isOpen ? "open" : ""}`}>
        <h2>Create New Mind Map</h2>

        {/* Step 1: Select Method */}
        {step === 1 && (
          <div className="wizard-step active">
            <p>Choose how you'd like to start:</p>
            <div className="custom-selects">
              <div
                className={`select-option ${
                  selectedOption === "mainTopic" ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedOption("mainTopic");
                  setDescription("");
                }}
              >
                <div className="select-circle">
                  {selectedOption === "mainTopic" && (
                    <div className="circle-filled"></div>
                  )}
                </div>
                <div className="select-label">
                  <h4>Start with a Topic</h4>
                  <p>Enter a main topic and automatically generate subtopics.</p>
                </div>
              </div>

              <div
                className={`select-option ${
                  selectedOption === "description" ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedOption("description");
                  setMainTopic("");
                }}
              >
                <div className="select-circle">
                  {selectedOption === "description" && (
                    <div className="circle-filled"></div>
                  )}
                </div>
                <div className="select-label">
                  <h4>Describe Your Map</h4>
                  <p>
                    Provide a description and generate a mind map based on it.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Inputs for step 1 */}
            {selectedOption === "description" && (
              <textarea
                className="fancy-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your mind map..."
              />
            )}
            {selectedOption === "mainTopic" && (
              <input
                type="text"
                value={mainTopic}
                onChange={(e) => setMainTopic(e.target.value)}
                placeholder="Enter the main topic"
                className="fancy-input"
              />
            )}
          </div>
        )}

        {/* Step 2: Confirm number of subtopics */}
        {step === 2 && (
          <div className="wizard-step active">
            <p>Confirm the number of subtopics to generate:</p>
            <input
              type="number"
              value={subtopicCount}
              onChange={(e) => setSubtopicCount(Number(e.target.value))}
              min="1"
              max="10"
              className="fancy-input"
            />
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="wizard-buttons">
          {step > 1 && (
            <button className="wizard-button back" onClick={handleBack}>
              Back
            </button>
          )}
          <button
            className="wizard-button next"
            onClick={handleNext}
            disabled={isLoading}
          >
            {step === 2 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}

export default WizardDialog;
