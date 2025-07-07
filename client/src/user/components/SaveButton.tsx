import { useState } from "react";
import DolphinSpinner from "./DolphinSpinner";

interface SaveButtonProps {
  onSave: () => Promise<void>;
  isFormSaved: boolean;
  hasSubmitted: boolean;
  isFutureMonth: boolean;
  isCurrentMonth: boolean;
}

const SaveButton = ({ 
  onSave, 
  isFormSaved, 
  hasSubmitted, 
  isFutureMonth, 
  isCurrentMonth 
}: SaveButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const SUBMISSION_TIMEOUT = 30000;

  const handleClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      alert("Submission is taking longer than expected. Please try again.");
    }, SUBMISSION_TIMEOUT);
    try { 
      await onSave(); 
    } 
    finally { 
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
        isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600"
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