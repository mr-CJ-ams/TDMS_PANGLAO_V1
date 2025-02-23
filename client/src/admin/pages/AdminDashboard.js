import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import TourismLogo from "./1738398998646-Tourism_logo.png"; // Import the image
import { Modal, Button, ListGroup } from "react-bootstrap"; // Import Modal and Button
import UserApproval from "./UserApproval";
import SubmissionOverview from "./SubmissionOverview";
import MainDashboard from "./MainDashboard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [declineMessage, setDeclineMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submissions, setSubmissions] = useState([]); // State for submissions
  const [selectedSubmission, setSelectedSubmission] = useState(null); // State for selected submission details
  const [showSubmissionModal, setShowSubmissionModal] = useState(false); // State for submission modal
  const [showNationalityModal, setShowNationalityModal] = useState(false); // State for nationality modal
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  

  const navigate = useNavigate();

  // Helper function to get month name
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1); // Subtract 1 because months are 0-indexed in JavaScript
    return date.toLocaleString("default", { month: "long" });
  };

  // Fetch all users (for User Approval section)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (activeSection === "user-approval") {
      fetchUsers();
    }
  }, [activeSection]);

  // Fetch all submissions (for Submission Overview section)
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/admin/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(response.data.submissions);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    };

    fetchSubmissions();
  }, []);

  // Fetch submission details
  const fetchSubmissionDetails = async (submissionId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/submissions/details/${submissionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedSubmission(response.data);
      setShowSubmissionModal(true);
    } catch (err) {
      console.error("Error fetching submission details:", err);
    }
  };

  // Approve User
  const approveUser = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/admin/approve/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the user list
      const updatedUsers = users.map((user) =>
        user.user_id === userId ? { ...user, is_approved: true } : user
      );
      setUsers(updatedUsers);
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  // Decline User
  const declineUser = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/admin/decline/${userId}`,
        { message: declineMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove the declined user from the list
      const updatedUsers = users.filter((user) => user.user_id !== userId);
      setUsers(updatedUsers);
      setSelectedUserId(null); // Close the modal
      setDeclineMessage(""); // Clear the decline message
    } catch (err) {
      console.error("Error declining user:", err);
    }
  };

  // Delete User
  const deleteUser = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/admin/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted user from the list
      const updatedUsers = users.filter((user) => user.user_id !== userId);
      setUsers(updatedUsers);
      setShowDeleteModal(false); // Close the delete confirmation modal
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (userId) => {
    setUserToDelete(userId); // Set the user to delete
    setShowDeleteModal(true); // Show the delete confirmation modal
  };

  // Calculate metrics and totals
  const calculateMetrics = (submission) => {
    if (!submission || !submission.days) {
      return {
        totalCheckIns: 0,
        totalOvernight: 0,
        totalOccupied: 0,
        averageGuestNights: 0,
        averageRoomOccupancyRate: 0,
        averageGuestsPerRoom: 0,
      };
    }
  
    const { days, number_of_rooms } = submission;
  
    // Calculate totals
    const totalCheckIns = days.reduce((acc, day) => acc + (day.check_ins || 0), 0);
    const totalOvernight = days.reduce((acc, day) => acc + (day.overnight || 0), 0);
    const totalOccupied = days.reduce((acc, day) => acc + (day.occupied || 0), 0);
  
    // Calculate averages
    const averageGuestNights = totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : 0;
    const averageRoomOccupancyRate =
      number_of_rooms > 0 ? ((totalOccupied / (number_of_rooms * days.length)) * 100).toFixed(2) : 0;
    const averageGuestsPerRoom = totalOccupied > 0 ? (totalOvernight / totalOccupied).toFixed(2) : 0;
  
    return {
      totalCheckIns,
      totalOvernight,
      totalOccupied,
      averageGuestNights,
      averageRoomOccupancyRate,
      averageGuestsPerRoom,
    };
  };

  // Calculate nationality counts
  const calculateNationalityCounts = (submission) => {
    if (!submission || !submission.days) {
      return {};
    }

    const nationalityCounts = {};
    submission.days.forEach((day) => {
      day.guests.forEach((guest) => {
        if (guest.isCheckIn) {
          const nationality = guest.nationality;
          if (nationalityCounts[nationality]) {
            nationalityCounts[nationality]++;
          } else {
            nationalityCounts[nationality] = 1;
          }
        }
      });
    });

    return nationalityCounts;
  };

  // Sort nationalities alphabetically
  const getSortedNationalities = (nationalityCounts) => {
    return Object.keys(nationalityCounts).sort((a, b) => a.localeCompare(b));
  };

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("token"); // Clear the token from sessionStorage
    sessionStorage.removeItem("user"); // Clear user details
    navigate("/admin/login"); // Redirect to the admin login page
  };

  const isSubmissionLate = (submission) => {
    const deadline = new Date(submission.deadline);
    const submittedAt = new Date(submission.submitted_at);
    return submittedAt > deadline;
  };

  // Add this function to handle penalty payment
  const handlePenaltyPayment = async (submissionId, penaltyStatus) => {
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
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 bg-light sidebar">
          <div className="sidebar-sticky">
            {/* Display the Tourism Logo */}
            <div className="text-center mt-3">
              <img
                src={TourismLogo} // Use the imported image
                alt="Tourism Logo"
                style={{ width: "100px", height: "auto" }} // Adjust size as needed
              />
            </div>

            <h4 className="sidebar-heading p-3">Admin Dashboard</h4>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link
                  to="#"
                  className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveSection("dashboard")}
                >
                  Main Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="#"
                  className={`nav-link ${activeSection === "user-approval" ? "active" : ""}`}
                  onClick={() => setActiveSection("user-approval")}
                >
                  User Approval
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="#"
                  className={`nav-link ${activeSection === "submission-overview" ? "active" : ""}`}
                  onClick={() => setActiveSection("submission-overview")}
                >
                  Submission Overview
                </Link>
              </li>
            </ul>

            {/* Logout Button */}
            <div className="mt-4 p-3">
              <button className="btn btn-danger w-100" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="p-4">
            {/* Display content based on active section */}
            {activeSection === "dashboard" && <MainDashboard />}

            {activeSection === "user-approval" && (
              <UserApproval
                users={users}
                selectedUserId={selectedUserId}
                declineMessage={declineMessage}
                showDeleteModal={showDeleteModal}
                userToDelete={userToDelete}
                approveUser={approveUser}
                setSelectedUserId={setSelectedUserId}
                declineUser={declineUser}
                setDeclineMessage={setDeclineMessage}
                handleDeleteClick={handleDeleteClick}
                deleteUser={deleteUser}
                setShowDeleteModal={setShowDeleteModal}
              />
            )}

            {activeSection === "submission-overview" && (
              <SubmissionOverview
                submissions={submissions}
                setSubmissions={setSubmissions} // Pass setSubmissions as a prop
                getMonthName={getMonthName}
                isSubmissionLate={isSubmissionLate}
                fetchSubmissionDetails={fetchSubmissionDetails}
                handlePenaltyPayment={handlePenaltyPayment}
                selectedSubmission={selectedSubmission}
                showSubmissionModal={showSubmissionModal}
                setShowSubmissionModal={setShowSubmissionModal}
                calculateMetrics={calculateMetrics}
                setShowNationalityModal={setShowNationalityModal}
                activeSection={activeSection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;