/**
 * SubmissionHistory.jsx
 * 
 * Panglao Tourist Data Management System - Submission History Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays a table of the authenticated user's monthly accommodation submission history.
 * It provides a summary of each submission, including metrics, status, penalty information, and actions to view detailed data.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches submission history data from the backend API for the logged-in user.
 * - Renders a responsive table listing all submissions with key metrics and status indicators.
 * - Shows loading, empty, and error states for improved user experience.
 * - Allows users to view detailed information for each submission via a modal dialog.
 * - Displays penalty status for late submissions and highlights paid/unpaid penalties.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Responsive table layout with color-coded status and penalty indicators.
 * - Integrates SubmissionDetailsModal for viewing detailed submission data.
 * - Utilizes Lucide icons for visual cues and improved UX.
 * - Modular design for easy integration into the user dashboard.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the user dashboard to review and manage monthly submission history.
 * - Allows users to track submission status, penalties, and access detailed records.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for fetching submission history is:
 *     GET /api/submissions/history/:userId
 * - Update this component if table columns, metrics, or penalty logic change.
 * - Extend modal logic or table rendering for new analytics or reporting features.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/UserDashboard.jsx         (renders SubmissionHistory)
 * - src/user/components/SubmissionDetailsModal.jsx (shows detailed submission info)
 * - server/controllers/submissionsController.js (handles backend history logic)
 * - server/routes/submissions.js                (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */
import React, { useEffect, useState } from "react";
import { submissionsAPI } from "../../services/api";
import { Loader2, ExternalLink } from "lucide-react";
import SubmissionDetailsModal from "../components/SubmissionDetailsModal";

const SubmissionHistory = ({ user }) => {
  const [submissionHistory, setSubmissionHistory] = useState([]),
    [loading, setLoading] = useState(false),
    [showModal, setShowModal] = useState(false),
    [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    submissionsAPI.getSubmissionHistory(user.user_id)
      .then((data) => setSubmissionHistory(data))
      .catch((err) => console.error("Error fetching submission history:", err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Submission History</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        ) : submissionHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No submission history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
                  <th className="px-4 py-3 text-left font-medium">Month</th>
                  <th className="px-4 py-3 text-left font-medium">Year</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted At</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Note</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissionHistory.map((sub) => (
                  <tr key={sub.submission_id} className="hover:bg-cyan-50 transition-colors">
                    <td className="px-4 py-3">
                      {new Date(0, sub.month - 1).toLocaleString("default", { month: "long" })}
                    </td>
                    <td className="px-4 py-3">{sub.year}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.is_late ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {sub.is_late ? "Late" : "On-Time"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sub.is_late ? (
                        sub.penalty ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Penalty Unpaid
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedSubmissionId(sub.submission_id);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-md hover:opacity-90 transition-opacity"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <SubmissionDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedSubmissionId(null);
        }}
        submissionId={selectedSubmissionId}
      />
    </div>
  );
};

export default SubmissionHistory;
