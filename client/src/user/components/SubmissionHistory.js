import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, ExternalLink } from "lucide-react";
import SubmissionDetailsModal from "./SubmissionDetailsModal";
const SubmissionHistory = ({ user }) => {
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    if (user) {
      fetchSubmissionHistory();
    }
  }, [user]);
  const fetchSubmissionHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/submissions/history/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSubmissionHistory(response.data);
    } catch (err) {
      console.error("Error fetching submission history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewClick = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubmissionId(null);
  };
  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-cyan-500" size={24} />
          <h3 className="text-2xl font-semibold text-gray-800">
            Submission History
          </h3>
        </div>
        {loadingHistory ? (
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
                  <th className="px-4 py-3 text-left font-medium">
                    Submitted At
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Ave. Guest-Nights
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Ave. Room Occupancy Rate
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Ave. Guests/Room
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Note</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissionHistory.map((submission) => (
                  <tr
                    key={submission.submission_id}
                    className="hover:bg-cyan-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {new Date(0, submission.month - 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        },
                      )}
                    </td>
                    <td className="px-4 py-3">{submission.year}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(submission.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {submission.is_late ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          On-Time
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {submission.average_guest_nights}
                    </td>
                    <td className="px-4 py-3">
                      {submission.average_room_occupancy_rate}%
                    </td>
                    <td className="px-4 py-3">
                      {submission.average_guests_per_room}
                    </td>
                    <td className="px-4 py-3">
                      {submission.is_late ? (
                        submission.penalty ? (
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
                        onClick={() => handleViewClick(submission.submission_id)}
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
        onHide={handleCloseModal}
        submissionId={selectedSubmissionId}
      />
    </div>
  );
};
export default SubmissionHistory;
