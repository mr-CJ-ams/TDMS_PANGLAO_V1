import React from "react";

const MaintenanceModal = ({ open, onClose, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md md:max-w-lg text-center mx-2"
        style={{ wordBreak: "break-word" }}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-2 text-amber-600">
          System Maintenance Notice
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed text-gray-800 whitespace-pre-line">
          {message}
        </p>
        <button
          onClick={onClose}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-base font-medium transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MaintenanceModal;