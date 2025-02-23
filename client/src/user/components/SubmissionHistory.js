import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SubmissionHistory = ({ user }) => {
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";


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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissionHistory(response.data);
    } catch (err) {
      console.error("Error fetching submission history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div>
      <h3>Submission History</h3>
      {loadingHistory ? (
        <p>Loading submission history...</p>
      ) : submissionHistory.length === 0 ? (
        <p>No submission history found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Average Guest-Nights</th>
                <th>Average Room Occupancy Rate</th>
                <th>Average Guests per Room</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissionHistory.map((submission) => (
                <tr key={submission.submission_id}>
                  <td>{new Date(0, submission.month - 1).toLocaleString("default", { month: "long" })}</td>
                  <td>{submission.year}</td>
                  <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                  <td>
                    {submission.is_late ? (
                      <span style={{ color: "red" }}>Late</span>
                    ) : (
                      <span style={{ color: "green" }}>On-Time</span>
                    )}
                  </td>
                  <td>{submission.average_guest_nights}</td>
                  <td>{submission.average_room_occupancy_rate}%</td>
                  <td>{submission.average_guests_per_room}</td>
                  <td>
                    {submission.is_late ? (
                      submission.penalty ? (
                        <span style={{ color: "green" }}>Paid</span>
                      ) : (
                        <span style={{ color: "red" }}>Unpaid</span>
                      )
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/submission-details/${submission.submission_id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;