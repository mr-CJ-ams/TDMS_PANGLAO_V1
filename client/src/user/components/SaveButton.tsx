import { useState } from "react";
import DolphinSpinner from "./DolphinSpinner";

interface SaveButtonProps {
  onSave: () => Promise<void>;
  isFormSaved: boolean;
  hasSubmitted: boolean;
  isFutureMonth: boolean;
  isCurrentMonth: boolean;
  disabled?: boolean;
}

const SaveButton = ({ 
  onSave, 
  isFormSaved, 
  hasSubmitted, 
  isFutureMonth, 
  isCurrentMonth,
  disabled = false
}: SaveButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const SUBMISSION_TIMEOUT = 30000;

  const handleClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setShowTimeoutModal(true);
    }, SUBMISSION_TIMEOUT);
    try { 
      await onSave(); 
    } 
    finally { 
      clearTimeout(timeoutId); 
      setIsSubmitting(false); 
    }
  };

  const isDisabled = isFormSaved || hasSubmitted || isFutureMonth || isCurrentMonth || isSubmitting || disabled;

  return (
    <>
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
          "Submitted"
        ) : (
          "Submit"
        )}
      </button>
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-rose-700 mb-4">Submission Timeout</h3>
            <p className="mb-6 text-gray-700">
              Submission is taking longer than expected. Please try again.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTimeoutModal(false)}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveButton;