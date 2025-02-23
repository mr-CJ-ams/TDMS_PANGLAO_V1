import React, { useState, useEffect } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import axios from "axios";
import NationalityCountsModal from "./NationalityCountsModal";

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
  const [loadingPenalty, setLoadingPenalty] = useState({}); // Track loading state for each submission
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";


  // Fetch submissions with filters
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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1); // Reset to first page when filters change
  };

  // Handle penalty payment status
  const handlePenaltyPayment = async (submissionId, penaltyStatus) => {
    // Show confirmation dialog
    const confirmUpdate = window.confirm(
      "Are you sure you want to mark this penalty as Paid?"
    );
    if (!confirmUpdate) return; // Exit if the user cancels

    setLoadingPenalty((prev) => ({ ...prev, [submissionId]: true })); // Set loading state

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/submissions/penalty/${submissionId}`,
        { penalty: penaltyStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the submissions list
      const updatedSubmissions = submissions.map((submission) =>
        submission.submission_id === submissionId
          ? { ...submission, penalty: penaltyStatus }
          : submission
      );
      setSubmissions(updatedSubmissions);
    } catch (err) {
      console.error("Error updating penalty status:", err);
    } finally {
      setLoadingPenalty((prev) => ({ ...prev, [submissionId]: false })); // Clear loading state
    }
  };

  return (
    <div>
      <h2>Submission Overview</h2>

      {/* Filter and Search Controls */}
      <div className="mb-4">
        <select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          className="form-control mb-2"
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="year"
          placeholder="Year"
          value={filters.year}
          onChange={handleFilterChange}
          className="form-control mb-2"
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="form-control mb-2"
        >
          <option value="">Select Status</option>
          <option value="Late">Late</option>
          <option value="On-Time">On-Time</option>
        </select>

        <select
          name="penaltyStatus"
          value={filters.penaltyStatus}
          onChange={handleFilterChange}
          className="form-control mb-2"
        >
          <option value="">Select Penalty Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        <input
          type="text"
          name="search"
          placeholder="Search by Company Name"
          value={filters.search}
          onChange={handleFilterChange}
          className="form-control mb-2"
        />
      </div>

      {/* Submissions Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Submission ID</th>
            <th>User ID</th>
            <th>Company Name</th>
            <th>Month</th>
            <th>Year</th>
            <th>Submitted At</th>
            <th>Status</th>
            <th>Penalty Amount</th>
            <th>Penalty Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.submission_id}>
              <td>{submission.submission_id}</td>
              <td>{submission.user_id}</td>
              <td>{submission.company_name}</td>
              <td>{getMonthName(submission.month)}</td>
              <td>{submission.year}</td>
              <td>{new Date(submission.submitted_at).toLocaleString()}</td>
              <td>
                {isSubmissionLate(submission) ? (
                  <span style={{ color: "red" }}>Late</span>
                ) : (
                  <span style={{ color: "green" }}>On-Time</span>
                )}
              </td>
              <td>{submission.penalty_amount}</td>
              <td>
              {isSubmissionLate(submission) && (
                 <button
                 className={`btn btn-sm ${submission.penalty ? "btn-success" : "btn-warning"}`}
                 onClick={() => handlePenaltyPayment(submission.submission_id, !submission.penalty)}
                 disabled={submission.penalty || loadingPenalty[submission.submission_id]} // Disable if paid or loading
               >
                 {submission.penalty ? "Paid" : "Unpaid"}
               </button>
              )}
            </td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => fetchSubmissionDetails(submission.submission_id)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4">
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="mx-3">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(total / limit)}
        >
          Next
        </button>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <Modal
          show={showSubmissionModal}
          onHide={() => setShowSubmissionModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Submission Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Month: {getMonthName(selectedSubmission.month)}</h5>
            <h5>Year: {selectedSubmission.year}</h5>
            <h5>Submitted At: {new Date(selectedSubmission.submitted_at).toLocaleString()}</h5>

            {/* Totals Section */}
            <div className="mt-4">
              <h4>Totals</h4>
              <div className="row">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Total Check-Ins</h5>
                      <p className="card-text">{calculateMetrics(selectedSubmission).totalCheckIns}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Total Overnight</h5>
                      <p className="card-text">{calculateMetrics(selectedSubmission).totalOvernight}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Total Occupied</h5>
                      <p className="card-text">{calculateMetrics(selectedSubmission).totalOccupied}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Averages Section */}
            <div className="mt-4">
              <h4>Averages</h4>
              <div className="row">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Average Guest-Nights</h5>
                      <p className="card-text">{calculateMetrics(selectedSubmission).averageGuestNights}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Average Room Occupancy Rate</h5>
                      <p className="card-text">{calculateMetrics(selectedSubmission).averageRoomOccupancyRate}%</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Average Guests per Room</h5>
                      <p className="card-text">{calculateMetrics(selectedSubmission).averageGuestsPerRoom}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Metrics Table */}
            <h4 className="mt-4">Daily Metrics</h4>
            {selectedSubmission.days?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Check Ins</th>
                      <th>Overnight</th>
                      <th>Occupied</th>
                      <th>Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSubmission.days.map((day) => (
                      <tr key={day.day}>
                        <td>{day.day}</td>
                        <td>{day.check_ins}</td>
                        <td>{day.overnight}</td>
                        <td>{day.occupied}</td>
                        <td>
                          <ul>
                            {day.guests?.map((guest, index) => (
                              <li key={index}>
                                Room {guest.room_number}, {guest.gender}, {guest.age}, {guest.status}, {guest.nationality}
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
              <p>No data available for this submission.</p>
            )}

            {/* View Nationality Counts Button */}
            <div className="mt-4">
              <button
                className="btn btn-info"
                onClick={() => setShowNationalityCountsModal(true)}
              >
                View Nationality Counts
              </button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowSubmissionModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Nationality Counts Modal */}
      {selectedSubmission && (
        <NationalityCountsModal
          show={showNationalityCountsModal}
          onHide={() => setShowNationalityCountsModal(false)}
          nationalityCounts={selectedSubmission.nationalityCounts || {}}
        />
      )}
    </div>
  );
};

export default SubmissionOverview;