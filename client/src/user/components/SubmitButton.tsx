/**
 * SaveButton.tsx
 * 
 * Panglao Tourist Data Management System - Save/Submit Button Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component renders a styled button for submitting or saving monthly accommodation forms and guest data.
 * It manages submission state, disables itself under certain conditions, and provides user feedback for long-running submissions.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Handles click events to trigger the provided onSave function asynchronously.
 * - Manages internal loading state and disables the button during submission or when form conditions are not met.
 * - Displays a spinner and "Processing..." text while submission is in progress.
 * - Shows a timeout modal if the submission takes longer than the defined threshold.
 * - Updates button text and style based on submission status (submitted, saved, disabled).
 * 
 * =========================
 * Key Features:
 * =========================
 * - Prevents duplicate submissions by disabling the button during processing.
 * - Timeout modal alerts users if submission exceeds 30 seconds.
 * - Responsive styling using Tailwind CSS classes.
 * - Integrates with DolphinSpinner for visual feedback.
 * - Supports multiple disabling conditions: already saved, already submitted, future/current month, manual disable, or loading.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in monthly submission forms and guest data entry workflows.
 * - Allows users to submit or save their accommodation data, with clear feedback and error handling.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The onSave prop must be an async function that handles form submission logic.
 * - Extend this component to support additional feedback or custom timeout logic if needed.
 * - Update disabling conditions as business rules change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/components/DolphinSpinner.jsx   (spinner component for loading state)
 * - src/user/pages/SubmissionDetails.jsx     (uses SaveButton for submission actions)
 * - server/controllers/submissionsController.js (handles backend submission logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

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

const SubmitButton = ({ 
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

export default SubmitButton;
