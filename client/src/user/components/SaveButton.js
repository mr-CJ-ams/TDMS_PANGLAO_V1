import React from "react";

const SaveButton = ({ onSave, isFormSaved, hasSubmitted, isFutureMonth, isCurrentMonth }) => {
  return (
    <button
      onClick={onSave}
      disabled={isFormSaved || hasSubmitted || isFutureMonth || isCurrentMonth}
      className={`px-4 py-2 rounded text-white font-bold ${
        isFormSaved || hasSubmitted || isFutureMonth || isCurrentMonth
          ? "bg-gray-400 cursor-not-allowed" // Disabled state
          : "bg-cyan-500 hover:bg-cyan-600" // Enabled state
      }`}
    >
      {hasSubmitted ? "Already Submitted" : "Save Form"}
    </button>
  );
};

export default SaveButton;