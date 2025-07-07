import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import NationalityCountsModal from "./NationalityCountsModal";
import AccessCodePrompt from "../components/AccessCodePrompt";

const SubmissionOverview = ({
  submissions, setSubmissions, getMonthName, isSubmissionLate,
  fetchSubmissionDetails, selectedSubmission, showSubmissionModal,
  setShowSubmissionModal, calculateMetrics, activeSection,
}) => {
  const [filters, setFilters] = useState({ month: "", year: "", status: "", penaltyStatus: "", search: "" });
  const [page, setPage] = useState(1), [total, setTotal] = useState(0), limit = 20;
  const [showNationalityCountsModal, setShowNationalityCountsModal] = useState(false);
  const [loadingPenalty, setLoadingPenalty] = useState({});
  const [showAccessCodePrompt, setShowAccessCodePrompt] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE;

  useEffect(() => {
    if (activeSection !== "submission-overview") return;
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/admin/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...filters, page, limit },
        });
        setSubmissions(data.submissions); setTotal(data.total);
      } catch (err) { console.error("Error fetching submissions:", err); }
    })();
  }, [filters, page, activeSection, API_BASE_URL, setSubmissions]);

  const handleFilterChange = e => { setFilters(f => ({ ...f, [e.target.name]: e.target.value })); setPage(1); };

  const handlePenaltyPayment = submissionId => { setCurrentSubmissionId(submissionId); setShowAccessCodePrompt(true); };

  const confirmPenaltyPayment = async accessCode => {
    if (accessCode !== ACCESS_CODE) return alert("Invalid access code");
    setShowAccessCodePrompt(false);
    setLoadingPenalty(p => ({ ...p, [currentSubmissionId]: true }));
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/submissions/penalty/${currentSubmissionId}`, { penalty: true }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmissions(submissions.map(s => s.submission_id === currentSubmissionId ? { ...s, penalty: true } : s));
    } catch (err) { console.error("Error updating penalty status:", err); }
    finally { setLoadingPenalty(p => ({ ...p, [currentSubmissionId]: false })); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-8">
      <h2 className="text-3xl font-semibold text-sky-900 mb-8">Submission Overview</h2>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Month & Year</label>
            <div className="flex gap-2">
              <select name="month" value={filters.month} onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500">
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
              <input type="text" name="year" placeholder="Year" value={filters.year} onChange={handleFilterChange}
                className="w-24 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Status Filters</label>
            <div className="flex gap-2">
              <select name="status" value={filters.status} onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500">
                <option value="">Select Status</option>
                <option value="Late">Late</option>
                <option value="On-Time">On-Time</option>
              </select>
              <select name="penaltyStatus" value={filters.penaltyStatus} onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500">
                <option value="">Select Penalty Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Search</label>
            <div className="relative">
              <input type="text" name="search" placeholder="Search by Company Name" value={filters.search} onChange={handleFilterChange}
                className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500" />
            </div>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              {["Submission ID", "User ID", "Company Name", "Month", "Year", "Submitted At", "Status", "Penalty Status", "Actions"].map(h => (
                <th key={h} className="p-4 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {submissions.map(submission => (
              <tr key={submission.submission_id} className="hover:bg-sky-50 transition-colors">
                <td className="p-4">{submission.submission_id}</td>
                <td className="p-4">{submission.user_id}</td>
                <td className="p-4 font-medium">{submission.company_name}</td>
                <td className="p-4">{getMonthName(submission.month)}</td>
                <td className="p-4">{submission.year}</td>
                <td className="p-4">{new Date(submission.submitted_at).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${isSubmissionLate(submission) ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {isSubmissionLate(submission) ? "Late" : "On-Time"}
                  </span>
                </td>
                <td className="p-4">
                  {isSubmissionLate(submission) && (
                    <button
                      onClick={() => handlePenaltyPayment(submission.submission_id)}
                      disabled={submission.penalty || loadingPenalty[submission.submission_id]}
                      className={`px-4 py-2 rounded transition-colors ${submission.penalty ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                      {submission.penalty ? "Paid" : "Unpaid"}
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => fetchSubmissionDetails(submission.submission_id)}
                    className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft size={20} />Previous
        </button>
        <span className="text-sky-900">Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Next<ChevronRight size={20} />
        </button>
      </div>
      {/* Modal */}
      {selectedSubmission && showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-sky-900">Submission Details</h3>
                <button onClick={() => setShowSubmissionModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              {/* Submission Info */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {["Month", "Year", "Submitted At"].map((label, i) => (
                  <div key={label} className="bg-sky-50 p-4 rounded-lg">
                    <div className="text-sm text-sky-700">{label}</div>
                    <div className="text-lg font-medium">
                      {i === 0 ? getMonthName(selectedSubmission.month) : i === 1 ? selectedSubmission.year : new Date(selectedSubmission.submitted_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Totals */}
                <div className="bg-gradient-to-br from-sky-100 to-white p-6 rounded-xl shadow-sm">
                  <h5 className="text-lg font-semibold text-sky-900 mb-4">Totals</h5>
                  {["totalCheckIns", "totalOvernight", "totalOccupied"].map((k, i) => (
                    <div key={k}>
                      <div className="text-sm text-sky-700">
                        {["Total No. of Guest Check-Ins", "Total No. Guest Staying Overnight", "Total No. of Occupied Rooms"][i]}
                      </div>
                      <div className="text-2xl font-medium">{calculateMetrics(selectedSubmission)[k]}</div>
                    </div>
                  ))}
                </div>
                {/* Averages */}
                <div className="bg-gradient-to-br from-emerald-100 to-white p-6 rounded-xl shadow-sm">
                  <h5 className="text-lg font-semibold text-emerald-900 mb-4">Averages</h5>
                  {["averageGuestNights", "averageRoomOccupancyRate", "averageGuestsPerRoom"].map((k, i) => (
                    <div key={k}>
                      <div className="text-sm text-emerald-700">
                        {["Ave. Guest-Nights", "Ave. Room Occupancy Rate", "Ave. Guests per Room"][i]}
                      </div>
                      <div className="text-2xl font-medium">
                        {calculateMetrics(selectedSubmission)[k]}{i === 1 ? "%" : ""}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Actions */}
                <div className="bg-gradient-to-br from-amber-100 to-white p-6 rounded-xl shadow-sm">
                  <h5 className="text-lg font-semibold text-amber-900 mb-4">Top Markets Ranking</h5>
                  <button onClick={() => setShowNationalityCountsModal(true)}
                    className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    View Nationality Counts
                  </button>
                </div>
              </div>
              {/* Daily Metrics Table */}
              <div className="mt-8">
                <h4 className="text-xl font-semibold text-sky-900 mb-4">Daily Metrics</h4>
                {selectedSubmission.days?.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-sky-50">
                          {["Day", "Check Ins", "Overnight", "Occupied", "Guests"].map(h => (
                            <th key={h} className="p-3 text-left text-sm font-medium text-sky-900">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedSubmission.days.map(day => (
                          <tr key={day.day} className="hover:bg-sky-50">
                            <td className="p-3">{day.day}</td>
                            <td className="p-3">{day.check_ins}</td>
                            <td className="p-3">{day.overnight}</td>
                            <td className="p-3">{day.occupied}</td>
                            <td className="p-3">
                              <ul className="space-y-1">
                                {day.guests?.map((guest, idx) => (
                                  <li key={idx} className="text-sm">
                                    Room {guest.room_number} • {guest.gender} • {guest.age} • {guest.status} • {guest.nationality}
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
                  <p className="text-gray-500">No data available for this submission.</p>
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