import React, { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Filter,
} from "lucide-react";
import axios from "axios";
import NationalityCountsModal from "./NationalityCountsModal";
import AccessCodePrompt from "../components/AccessCodePrompt"; // Import the new component

const SubmissionOverview = ({
  submissions,
  setSubmissions,
  getMonthName,
  isSubmissionLate,
  fetchSubmissionDetails,
  selectedSubmission,
  showSubmissionModal,
  setShowSubmissionModal,
  calculateMetrics,
  setShowNationalityModal,
  activeSection,
}) => {
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    status: "",
    penaltyStatus: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [showNationalityCountsModal, setShowNationalityCountsModal] = useState(false);
  const [loadingPenalty, setLoadingPenalty] = useState({});
  const [showAccessCodePrompt, setShowAccessCodePrompt] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const ACCESS_CODE = process.env.REACT_APP_ACCESS_CODE;

  const fetchFilteredSubmissions = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters, page, limit },
      });
      setSubmissions(response.data.submissions);
      setTotal(response.data.total);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    if (activeSection === "submission-overview") {
      fetchFilteredSubmissions();
    }
  }, [filters, page, activeSection]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const handlePenaltyPayment = async (submissionId, penaltyStatus) => {
    setCurrentSubmissionId(submissionId);
    setShowAccessCodePrompt(true);
  };

  const confirmPenaltyPayment = async (accessCode) => {
    if (accessCode !== ACCESS_CODE) {
      alert("Invalid access code");
      return;
    }

    setShowAccessCodePrompt(false);
    setLoadingPenalty((prev) => ({ ...prev, [currentSubmissionId]: true }));

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/submissions/penalty/${currentSubmissionId}`,
        { penalty: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedSubmissions = submissions.map((submission) =>
        submission.submission_id === currentSubmissionId
          ? { ...submission, penalty: true }
          : submission
      );
      setSubmissions(updatedSubmissions);
    } catch (err) {
      console.error("Error updating penalty status:", err);
    } finally {
      setLoadingPenalty((prev) => ({ ...prev, [currentSubmissionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-8">
      <h2 className="text-3xl font-semibold text-sky-900 mb-8">
        Submission Overview
      </h2>
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">
              Month & Year
            </label>
            <div className="flex gap-2">
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              >
                <option value="">Select Month</option>
                {Array.from(
                  {
                    length: 12,
                  },
                  (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ),
                )}
              </select>
              <input
                type="text"
                name="year"
                placeholder="Year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-24 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">
              Status Filters
            </label>
            <div className="flex gap-2">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              >
                <option value="">Select Status</option>
                <option value="Late">Late</option>
                <option value="On-Time">On-Time</option>
              </select>
              <select
                name="penaltyStatus"
                value={filters.penaltyStatus}
                onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              >
                <option value="">Select Penalty Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Search</label>
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search by Company Name"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              <th className="p-4 text-left font-medium">Submission ID</th>
              <th className="p-4 text-left font-medium">User ID</th>
              <th className="p-4 text-left font-medium">Company Name</th>
              <th className="p-4 text-left font-medium">Month</th>
              <th className="p-4 text-left font-medium">Year</th>
              <th className="p-4 text-left font-medium">Submitted At</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Penalty Status</th>
              <th className="p-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {submissions.map((submission) => (
              <tr
                key={submission.submission_id}
                className="hover:bg-sky-50 transition-colors"
              >
                <td className="p-4">{submission.submission_id}</td>
                <td className="p-4">{submission.user_id}</td>
                <td className="p-4 font-medium">{submission.company_name}</td>
                <td className="p-4">{getMonthName(submission.month)}</td>
                <td className="p-4">{submission.year}</td>
                <td className="p-4">
                  {new Date(submission.submitted_at).toLocaleString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${isSubmissionLate(submission) ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {isSubmissionLate(submission) ? "Late" : "On-Time"}
                  </span>
                </td>
                <td className="p-4">
                  {isSubmissionLate(submission) && (
                    <button
                      onClick={() =>
                        handlePenaltyPayment(
                          submission.submission_id,
                          !submission.penalty,
                        )
                      }
                      disabled={
                        submission.penalty ||
                        loadingPenalty[submission.submission_id]
                      }
                      className={`px-4 py-2 rounded transition-colors ${submission.penalty ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                    >
                      {submission.penalty ? "Paid" : "Unpaid"}
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() =>
                      fetchSubmissionDetails(submission.submission_id)
                    }
                    className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Enhanced Pagination */}
      <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <span className="text-sky-900">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(total / limit)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
      {/* Enhanced Modal */}
      {selectedSubmission && showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-sky-900">
                  Submission Details
                </h3>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              {/* Submission Info */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-sky-50 p-4 rounded-lg">
                  <div className="text-sm text-sky-700">Month</div>
                  <div className="text-lg font-medium">
                    {getMonthName(selectedSubmission.month)}
                  </div>
                </div>
                <div className="bg-sky-50 p-4 rounded-lg">
                  <div className="text-sm text-sky-700">Year</div>
                  <div className="text-lg font-medium">
                    {selectedSubmission.year}
                  </div>
                </div>
                <div className="bg-sky-50 p-4 rounded-lg">
                  <div className="text-sm text-sky-700">Submitted At</div>
                  <div className="text-lg font-medium">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Totals Section */}
                <div className="bg-gradient-to-br from-sky-100 to-white p-6 rounded-xl shadow-sm">
                  <h5 className="text-lg font-semibold text-sky-900 mb-4">
                    Totals
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-sky-700">
                        Total No. of Guest Check-Ins
                      </div>
                      <div className="text-2xl font-medium">
                        {calculateMetrics(selectedSubmission).totalCheckIns}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-sky-700">
                        Total No. Guest Staying Overnight
                      </div>
                      <div className="text-2xl font-medium">
                        {calculateMetrics(selectedSubmission).totalOvernight}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-sky-700">Total No. of Occupied Rooms</div>
                      <div className="text-2xl font-medium">
                        {calculateMetrics(selectedSubmission).totalOccupied}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Averages Section */}
                <div className="bg-gradient-to-br from-emerald-100 to-white p-6 rounded-xl shadow-sm">
                  <h5 className="text-lg font-semibold text-emerald-900 mb-4">
                    Averages
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-emerald-700">
                        Ave. Guest-Nights
                      </div>
                      <div className="text-2xl font-medium">
                        {
                          calculateMetrics(selectedSubmission)
                            .averageGuestNights
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-emerald-700">
                        Ave. Room Occupancy Rate
                      </div>
                      <div className="text-2xl font-medium">
                        {
                          calculateMetrics(selectedSubmission)
                            .averageRoomOccupancyRate
                        }
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-emerald-700">
                        Ave. Guests per Room
                      </div>
                      <div className="text-2xl font-medium">
                        {
                          calculateMetrics(selectedSubmission)
                            .averageGuestsPerRoom
                        }
                      </div>
                    </div>
                  </div>
                </div>
                {/* Actions Section */}
                <div className="bg-gradient-to-br from-amber-100 to-white p-6 rounded-xl shadow-sm">
                  <h5 className="text-lg font-semibold text-amber-900 mb-4">
                    Top Markets Ranking
                  </h5>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowNationalityCountsModal(true)}
                      className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      View Nationality Counts
                    </button>
                  </div>
                </div>
              </div>
              {/* Daily Metrics Table */}
              <div className="mt-8">
                <h4 className="text-xl font-semibold text-sky-900 mb-4">
                  Daily Metrics
                </h4>
                {selectedSubmission.days?.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-sky-50">
                          <th className="p-3 text-left text-sm font-medium text-sky-900">
                            Day
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-sky-900">
                            Check Ins
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-sky-900">
                            Overnight
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-sky-900">
                            Occupied
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-sky-900">
                            Guests
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedSubmission.days.map((day) => (
                          <tr key={day.day} className="hover:bg-sky-50">
                            <td className="p-3">{day.day}</td>
                            <td className="p-3">{day.check_ins}</td>
                            <td className="p-3">{day.overnight}</td>
                            <td className="p-3">{day.occupied}</td>
                            <td className="p-3">
                              <ul className="space-y-1">
                                {day.guests?.map((guest, index) => (
                                  <li key={index} className="text-sm">
                                    Room {guest.room_number} • {guest.gender} •{" "}
                                    {guest.age} • {guest.status} •{" "}
                                    {guest.nationality}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No data available for this submission.
                  </p>
                )}
                
              </div>
            </div>
          </div>
          <NationalityCountsModal
            show={showNationalityCountsModal}
            onHide={() => setShowNationalityCountsModal(false)}
            nationalityCounts={selectedSubmission?.nationalityCounts || {}}
          />
        </div>
      )}
      {/* Access Code Prompt Modal */}
      {showAccessCodePrompt && (
        <AccessCodePrompt
          onConfirm={confirmPenaltyPayment}
          onCancel={() => setShowAccessCodePrompt(false)}
        />
      )}
    </div>
  );
};
export default SubmissionOverview;