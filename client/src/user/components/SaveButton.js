import React from "react";

const SaveButton = ({ onSave, isFormSaved, hasSubmitted }) => {
  return (
    <button
      onClick={onSave}
      disabled={isFormSaved || hasSubmitted}
      className={`btn btn-primary ${isFormSaved || hasSubmitted ? "disabled" : ""}`}
    >
      {hasSubmitted ? "Already Submitted" : "Save Form"}
    </button>
  );
};

export default SaveButton;