import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import TourismLogo from "../components/img/1738398998646-Tourism_logo.png"// Import the image
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
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
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
    const fetchDrafts = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/submissions/drafts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDrafts(response.data);
      } catch (err) {
        console.error("Error fetching drafts:", err);
      }
    };

    if (activeSection === "drafts") {
      fetchDrafts();
    }
  }, [activeSection]);

  // View draft details
  const viewDraftDetails = async (draftId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/submissions/draft/${draftId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedDraft(response.data);
      setShowDraftModal(true);
    } catch (err) {
      console.error("Error fetching draft details:", err);
    }
  };

   // Calculate metrics for draft
   const calculateDraftMetrics = (draft) => {
    if (!draft || !draft.days) return {};
    
    const totalCheckIns = draft.days.reduce((sum, day) => sum + day.check_ins, 0);
    const totalOvernight = draft.days.reduce((sum, day) => sum + day.overnight, 0);
    const totalOccupied = draft.days.reduce((sum, day) => sum + day.occupied, 0);
    
    const averageGuestNights = totalCheckIns > 0 
      ? (totalOvernight / totalCheckIns).toFixed(2) 
      : 0;
      
    const averageRoomOccupancyRate = draft.number_of_rooms > 0
      ? ((totalOccupied / (draft.number_of_rooms * draft.days.length))) * 100
      : 0;
      
    const averageGuestsPerRoom = totalOccupied > 0
      ? (totalOvernight / totalOccupied).toFixed(2)
      : 0;

    return {
      totalCheckIns,
      totalOvernight,
      totalOccupied,
      averageGuestNights,
      averageRoomOccupancyRate,
      averageGuestsPerRoom
    };
  };

  // const navItems = [
  //   {
  //     title: "Main Dashboard",
  //     section: "dashboard",
  //     icon: <LayoutDashboard />
  //   },
  //   {
  //     title: "User Approval",
  //     section: "user-approval",
  //     icon: <UserCheck />
  //   },
  //   {
  //     title: "Submission Overview",
  //     section: "submission-overview",
  //     icon: <FileText />
  //   },
  //   {
  //     title: "In-Progress Submissions",
  //     section: "drafts",
  //     icon: <ClipboardEdit />
  //   }
  // ];

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
    <div
      className="col-md-3 sidebar"
      style={{
        backgroundColor: "#E0F7FA", // Light cyan background
        minHeight: "50vh", // Full height
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
        padding: "20px 0", // Add padding for spacing
      }}
    >
      <div className="sidebar-sticky">
        {/* Display the Tourism Logo */}
        <div
          className="text-center mb-4"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={TourismLogo} // Use the imported image
            alt="Tourism Logo"
            style={{
              width: "100px",
              height: "auto",
              // borderRadius: "50%",
              // border: "3px solid #0288D1", // Accent border
              padding: "5px", // Add padding for a polished look
            }}
          />
        </div>

    {/* Sidebar Heading */}
    <h4
      className="sidebar-heading mb-4"
      style={{
        color: "#37474F", // Dark gray text
        fontWeight: "600", // Semi-bold
        textAlign: "center",
        fontSize: "1.25rem", // Slightly larger font
        letterSpacing: "0.5px", // Subtle letter spacing
      }}
    >
      Panglao Tourist Data Management System
    </h4>

    {/* Navigation Links */}
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link
          to="#"
          className={`nav-link ${
            activeSection === "dashboard" ? "active" : ""
          }`}
          style={{
            color: "#37474F", // Dark gray text
            padding: "12px 20px", // Increased padding
            transition: "all 0.3s ease", // Smooth transition
            backgroundColor: activeSection === "dashboard" ? "#00BCD4" : "transparent", // Active state
            color: activeSection === "dashboard" ? "#FFFFFF" : "#37474F", // Active state
            borderRadius: "8px", // Rounded corners
            margin: "4px 0", // Spacing between links
            display: "block", // Ensure full width
          }}
          onClick={() => setActiveSection("dashboard")}
        >
          Main Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="#"
          className={`nav-link ${
            activeSection === "user-approval" ? "active" : ""
          }`}
          style={{
            color: "#37474F", // Dark gray text
            padding: "12px 20px", // Increased padding
            transition: "all 0.3s ease", // Smooth transition
            backgroundColor: activeSection === "user-approval" ? "#00BCD4" : "transparent", // Active state
            color: activeSection === "user-approval" ? "#FFFFFF" : "#37474F", // Active state
            borderRadius: "8px", // Rounded corners
            margin: "4px 0", // Spacing between links
            display: "block", // Ensure full width
          }}
          onClick={() => setActiveSection("user-approval")}
        >
          User Approval
        </Link>
      </li>
      <li className="nav-item">
        <Link
          to="#"
          className={`nav-link ${
            activeSection === "submission-overview" ? "active" : ""
          }`}
          style={{
            color: "#37474F", // Dark gray text
            padding: "12px 20px", // Increased padding
            transition: "all 0.3s ease", // Smooth transition
            backgroundColor: activeSection === "submission-overview" ? "#00BCD4" : "transparent", // Active state
            color: activeSection === "submission-overview" ? "#FFFFFF" : "#37474F", // Active state
            borderRadius: "8px", // Rounded corners
            margin: "4px 0", // Spacing between links
            display: "block", // Ensure full width
          }}
          onClick={() => setActiveSection("submission-overview")}
        >
          Submission Overview
        </Link>
      </li>
    </ul>

    {/* Logout Button */}
    <div className="mt-4 p-3">
      <button
        className="btn w-100"
        style={{
          backgroundColor: "#FF6F00", // Amber color for logout
          color: "#FFFFFF",
          border: "none",
          padding: "12px", // Increased padding
          borderRadius: "8px", // Rounded corners
          cursor: "pointer",
          transition: "all 0.3s ease", // Smooth transition
          fontWeight: "600", // Semi-bold
          fontSize: "1rem", // Slightly larger font
          letterSpacing: "0.5px", // Subtle letter spacing
        }}
        onClick={handleLogout}
      >
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

{activeSection === "drafts" && (
        <div className="p-4">
          <h3>In-Progress Submissions</h3>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Establishment</th>
                  <th>Month/Year</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(draft => (
                  <tr key={draft.draft_id}>
                    <td>{draft.company_name}</td>
                    <td>{`${getMonthName(draft.month)} ${draft.year}`}</td>
                    <td>{new Date(draft.last_updated).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => viewDraftDetails(draft.draft_id)}
                        className="btn btn-info btn-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

            
          </div>
        </div>

         {/* Draft Details Modal */}
    <Modal 
      show={showDraftModal} 
      onHide={() => setShowDraftModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Draft Submission - {selectedDraft?.company_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedDraft && (
          <div>
            <h5>
              {getMonthName(selectedDraft.month)} {selectedDraft.year}
            </h5>
            
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Total Check-Ins</h6>
                    <p className="card-text display-6">
                      {calculateDraftMetrics(selectedDraft).totalCheckIns}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Total Overnight</h6>
                    <p className="card-text display-6">
                      {calculateDraftMetrics(selectedDraft).totalOvernight}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Occupied Rooms</h6>
                    <p className="card-text display-6">
                      {calculateDraftMetrics(selectedDraft).totalOccupied}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h5>Daily Data</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Check-Ins</th>
                    <th>Overnight</th>
                    <th>Occupied</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDraft.days.map(day => (
                    <tr key={day.day}>
                      <td>{day.day}</td>
                      <td>{day.check_ins}</td>
                      <td>{day.overnight}</td>
                      <td>{day.occupied}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => setShowDraftModal(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>

      </div>
    </div>
  );
};

export default AdminDashboard;