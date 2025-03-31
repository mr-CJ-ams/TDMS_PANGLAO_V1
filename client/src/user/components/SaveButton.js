import React, { useState } from "react";
import DolphinSpinner from "./DolphinSpinner"; // Import the spinner

const SaveButton = ({ 
  onSave, 
  isFormSaved, 
  hasSubmitted, 
  isFutureMonth, 
  isCurrentMonth 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Standard timeout duration (30 seconds)
  const SUBMISSION_TIMEOUT = 30000;

  const handleClick = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Set a timeout to automatically stop loading if the request hangs
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      alert("Submission is taking longer than expected. Please try again.");
    }, SUBMISSION_TIMEOUT);

    try {
      await onSave();
    } catch (error) {
      console.error("Submission error:", error);
      // Error handling is done in the parent component
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const isDisabled = isFormSaved || hasSubmitted || isFutureMonth || isCurrentMonth || isSubmitting;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`px-4 py-2 rounded text-white font-bold flex items-center justify-center gap-2 ${
        isDisabled
          ? "bg-gray-400 cursor-not-allowed" // Disabled state
          : "bg-cyan-500 hover:bg-cyan-600" // Enabled state
      }`}
    >
      {isSubmitting ? (
        <>
          <DolphinSpinner size="sm" />
          Processing...
        </>
      ) : hasSubmitted ? (
        "Already Submitted"
      ) : (
        "Save Form"
      )}
    </button>
  );
};

export default SaveButton;