import React, { useState } from "react";

function WizardDialog({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [mainTopic, setMainTopic] = useState("");
  const [description, setDescription] = useState("");
  const [subtopicCount, setSubtopicCount] = useState(3);
  const [selectedOption, setSelectedOption] = useState("mainTopic");

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      const payload =
        selectedOption === "mainTopic"
          ? { type: "mainTopic", mainTopic, subtopicCount }
          : { type: "description", description, subtopicCount };
      onComplete(payload);
      resetWizard();
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setMainTopic("");
    setDescription("");
    setSubtopicCount(3);
    setSelectedOption("mainTopic");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay behind the wizard */}
      <div className="wizard-overlay" onClick={onClose}></div>

      <div className={`wizard-dialog ${isOpen ? "open" : ""}`}>
        <h2>Create New Mind Map</h2>
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
                  <p>
                    Enter a main topic and automatically generate subtopics.
                  </p>
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

        <div className="wizard-buttons">
          {step > 1 && (
            <button className="wizard-button back" onClick={handleBack}>
              Back
            </button>
          )}
          <button className="wizard-button next" onClick={handleNext}>
            {step === 2 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}

export default WizardDialog;
