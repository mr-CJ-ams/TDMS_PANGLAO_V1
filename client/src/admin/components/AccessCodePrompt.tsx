/**
 * AccessCodePrompt.tsx
 * 
 * Panglao Tourist Data Management System - Access Code & Receipt Number Prompt Modal (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component renders a modal dialog for administrators to enter an access code and receipt number when confirming penalty payments for accommodation submissions.
 * It is used in the admin dashboard during the penalty payment workflow to securely verify admin actions and record official receipt numbers.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Collects the receipt number and access code from the admin via secure input fields.
 * - Validates that both fields are filled before allowing submission.
 * - Calls the provided onConfirm callback with the entered access code and receipt number.
 * - Allows cancellation via the onCancel callback, closing the modal without action.
 * - Prevents accidental closure by requiring explicit cancel or submit actions.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Modal UI with overlay for focus and security.
 * - Responsive and accessible form layout using Tailwind CSS classes.
 * - Password input for access code to hide sensitive data.
 * - Customizable via props for integration with parent components.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the admin dashboard's SubmissionOverview page when marking a penalty as paid.
 * - Ensures only authorized admins can confirm penalty payments and record receipt numbers.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The parent component must provide onConfirm and onCancel handlers for proper workflow integration.
 * - Extend this component to support additional verification fields or logic if needed.
 * - Update styling or validation as business requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/pages/SubmissionOverview.tsx      (invokes AccessCodePrompt for penalty confirmation)
 * - server/controllers/adminController.js       (handles backend penalty logic)
 * - server/routes/admin.js                      (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

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
