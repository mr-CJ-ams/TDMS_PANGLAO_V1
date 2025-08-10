import React, { useState, FormEvent } from "react";

interface AccessCodePromptProps {
  onConfirm: (accessCode: string, receiptNumber: string) => void;
  onCancel: () => void;
}

const AccessCodePrompt: React.FC<AccessCodePromptProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [accessCode, setAccessCode] = useState<string>("");
  const [receiptNumber, setReceiptNumber] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm(accessCode, receiptNumber);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-2xl font-semibold text-sky-900 mb-4">
          Enter Receipt Number
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500 mb-4"
            placeholder="Receipt Number"
            required
          />
          <h3 className="text-xl font-semibold text-sky-900 mb-2">
            Enter Access Code
          </h3>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500 mb-4"
            placeholder="Access Code"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessCodePrompt;