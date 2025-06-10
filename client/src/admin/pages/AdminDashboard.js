import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import TourismLogo from "../components/img/1738398998646-Tourism_logo.png";
import UserApproval from "./UserApproval";
import SubmissionOverview from "./SubmissionOverview";
import MainDashboard from "./MainDashboard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]), [activeSection, setActiveSection] = useState("dashboard"),
    [selectedUserId, setSelectedUserId] = useState(null), [declineMessage, setDeclineMessage] = useState(""),
    [showDeleteModal, setShowDeleteModal] = useState(false), [userToDelete, setUserToDelete] = useState(null),
    [submissions, setSubmissions] = useState([]), [selectedSubmission, setSelectedSubmission] = useState(null),
    [showSubmissionModal, setShowSubmissionModal] = useState(false),
    API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", navigate = useNavigate();

  // Helper function to get month name
  const getMonthName = m => { const d = new Date(); d.setMonth(m - 1); return d.toLocaleString("default", { month: "long" }); };

  // Fetch users only when needed
  useEffect(() => { if (activeSection !== "user-approval") return;
    (async () => { try { const token = sessionStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }); setUsers(data);
    } catch (err) { console.error("Error fetching users:", err); } })();
  }, [activeSection, API_BASE_URL]);

  // Fetch all submissions (for Submission Overview section)
  useEffect(() => { (async () => { try { const token = sessionStorage.getItem("token");
    const { data } = await axios.get(`${API_BASE_URL}/admin/submissions`, { headers: { Authorization: `Bearer ${token}` } }); setSubmissions(data.submissions);
  } catch (err) { console.error("Error fetching submissions:", err); } })();
  }, [API_BASE_URL]);

  // Fetch submission details
  const fetchSubmissionDetails = async submissionId => {
    try { const token = sessionStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/api/submissions/details/${submissionId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedSubmission(data); setShowSubmissionModal(true);
    } catch (err) { console.error("Error fetching submission details:", err); }
  };

  // Approve User
  const approveUser = async userId => {
    try { const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/admin/approve/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_approved: true } : u));
    } catch (err) { console.error("Error approving user:", err); }
  };

  // Decline User
  const declineUser = async userId => {
    try { const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/admin/decline/${userId}`, { message: declineMessage }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u.user_id !== userId)); setSelectedUserId(null); setDeclineMessage("");
    } catch (err) { console.error("Error declining user:", err); }
  };

  // Delete User
  const deleteUser = async userId => {
    try { const token = sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/admin/delete/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u.user_id !== userId)); setShowDeleteModal(false);
    } catch (err) { console.error("Error deleting user:", err); }
  };

  // Handle delete button click
  const handleDeleteClick = userId => { setUserToDelete(userId); setShowDeleteModal(true); };

  // Calculate metrics and totals for submissions
  const calculateMetrics = submission => {
    if (!submission || !submission.days) return { totalCheckIns: 0, totalOvernight: 0, totalOccupied: 0, averageGuestNights: 0, averageRoomOccupancyRate: 0, averageGuestsPerRoom: 0 };
    const { days, number_of_rooms } = submission,
      totalCheckIns = days.reduce((a, d) => a + (d.check_ins || 0), 0),
      totalOvernight = days.reduce((a, d) => a + (d.overnight || 0), 0),
      totalOccupied = days.reduce((a, d) => a + (d.occupied || 0), 0),
      averageGuestNights = totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : 0,
      averageRoomOccupancyRate = number_of_rooms > 0 ? ((totalOccupied / (number_of_rooms * days.length)) * 100).toFixed(2) : 0,
      averageGuestsPerRoom = totalOccupied > 0 ? (totalOvernight / totalOccupied).toFixed(2) : 0;
    return { totalCheckIns, totalOvernight, totalOccupied, averageGuestNights, averageRoomOccupancyRate, averageGuestsPerRoom };
  };

  // Logout function
  const handleLogout = () => { sessionStorage.removeItem("token"); sessionStorage.removeItem("user"); navigate("/admin/login"); };

  const isSubmissionLate = submission => new Date(submission.submitted_at) > new Date(submission.deadline);

  // Handle penalty payment
  const handlePenaltyPayment = async (submissionId, penaltyStatus) => {
    try { const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/submissions/penalty/${submissionId}`, { penalty: penaltyStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmissions(submissions.map(s => s.submission_id === submissionId ? { ...s, penalty: penaltyStatus } : s));
    } catch (err) { console.error("Error updating penalty status:", err); }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 sidebar" style={{ backgroundColor: "#E0F7FA", minHeight: "50vh", boxShadow: "2px 0 8px rgba(0,0,0,0.1)", padding: "20px 0" }}>
          <div className="sidebar-sticky">
            {/* Logo */}
            <div className="text-center mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={TourismLogo} alt="Tourism Logo" style={{ width: "100px", height: "auto", padding: "5px" }} />
            </div>
            {/* Sidebar Heading */}
            <h4 className="sidebar-heading mb-4" style={{ color: "#37474F", fontWeight: "600", textAlign: "center", fontSize: "1.25rem", letterSpacing: "0.5px" }}>
              Panglao Tourist Data Management System
            </h4>
            {/* Navigation Links */}
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link
                  to="#"
                  className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
                  style={{
                    padding: "12px 20px",
                    transition: "all 0.3s ease",
                    backgroundColor: activeSection === "dashboard" ? "#00BCD4" : "transparent",
                    color: activeSection === "dashboard" ? "#FFFFFF" : "#37474F",
                    borderRadius: "8px",
                    margin: "4px 0",
                    display: "block",
                  }}
                  onClick={() => setActiveSection("dashboard")}
                >
                  Main Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="#"
                  className={`nav-link ${activeSection === "user-approval" ? "active" : ""}`}
                  style={{
                    padding: "12px 20px",
                    transition: "all 0.3s ease",
                    backgroundColor: activeSection === "user-approval" ? "#00BCD4" : "transparent",
                    color: activeSection === "user-approval" ? "#FFFFFF" : "#37474F",
                    borderRadius: "8px",
                    margin: "4px 0",
                    display: "block",
                  }}
                  onClick={() => setActiveSection("user-approval")}
                >
                  User Approval
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="#"
                  className={`nav-link ${activeSection === "submission-overview" ? "active" : ""}`}
                  style={{
                    padding: "12px 20px",
                    transition: "all 0.3s ease",
                    backgroundColor: activeSection === "submission-overview" ? "#00BCD4" : "transparent",
                    color: activeSection === "submission-overview" ? "#FFFFFF" : "#37474F",
                    borderRadius: "8px",
                    margin: "4px 0",
                    display: "block",
                  }}
                  onClick={() => setActiveSection("submission-overview")}
                >
                  Submission Overview
                </Link>
              </li>
            </ul>
            {/* Logout Button */}
            <div className="mt-4 p-3">
              <button className="btn w-100" style={{
                backgroundColor: "#FF6F00", color: "#FFFFFF", border: "none", padding: "12px",
                borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease", fontWeight: "600", fontSize: "1rem", letterSpacing: "0.5px"
              }} onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="col-md-9">
          <div className="p-4">
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
                setSubmissions={setSubmissions}
                getMonthName={getMonthName}
                isSubmissionLate={isSubmissionLate}
                fetchSubmissionDetails={fetchSubmissionDetails}
                handlePenaltyPayment={handlePenaltyPayment}
                selectedSubmission={selectedSubmission}
                showSubmissionModal={showSubmissionModal}
                setShowSubmissionModal={setShowSubmissionModal}
                calculateMetrics={calculateMetrics}
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