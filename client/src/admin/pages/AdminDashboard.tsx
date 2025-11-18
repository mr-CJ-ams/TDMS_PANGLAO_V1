/**
 * AdminDashboard.tsx
 * 
 * Panglao Tourist Data Management System - Admin Dashboard Page (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component serves as the main dashboard for administrators in the Panglao TDMS frontend.
 * It provides navigation and access to all major admin features, including user approval, submission overview, and Panglao statistics.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches and manages lists of users and submissions from the backend for admin review and management.
 * - Handles sidebar navigation and active section state for switching between dashboard features.
 * - Renders the appropriate page/component based on the selected sidebar section (dashboard, user approval, submission overview).
 * - Supports user approval and decline workflows, including messaging and state updates.
 * - Displays submission details, calculates metrics, and manages penalty status for late submissions.
 * - Handles admin logout and session management.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Responsive sidebar navigation for switching between admin dashboard sections.
 * - Integrates with backend authentication via JWT stored in sessionStorage.
 * - Modular rendering of admin features: MainDashboard (statistics), UserApproval, SubmissionOverview.
 * - Uses axios for API communication and React Router for navigation.
 * - Helper functions for calculating metrics, handling penalties, and formatting dates.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed by authenticated administrators after login.
 * - Provides the main interface for admins to manage users, review submissions, and view system-wide statistics.
 * - Allows admins to approve/decline users, review and manage monthly submissions, and handle penalties.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Add new admin dashboard sections by updating the sidebar and main content render logic.
 * - Ensure backend endpoints are protected and return the necessary admin data.
 * - For user-only features, restrict access or hide sections as needed.
 * - Update the sidebar and activeSection logic to support new admin features.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/components/AdminSidebar.tsx         (sidebar navigation)
 * - src/admin/pages/MainDashboard.tsx             (Panglao statistics)
 * - src/admin/pages/UserApproval.tsx              (user approval workflow)
 * - src/admin/pages/SubmissionOverview.tsx        (submission management)
 * - server/controllers/adminController.js         (backend admin logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

// FILE: client\src\admin\pages\AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, submissionsAPI } from "../../services/api";
import UserApproval from "./UserApproval";
import SubmissionOverview from "./SubmissionOverview";
import MainDashboard from "./MainDashboard";
import AdminSidebar from "../components/AdminSidebar";
import '../../components/MenuButton.css';
import { User, Submission, DayData, Guest, Metrics } from "../../types";

// Use the base interfaces from types, extend only where necessary
interface AdminUser extends Omit<User, 'user_id'> {
  user_id: number; // Keep as number for API
  phone_number: string;
  registered_owner: string;
  tin: string;
  company_address: string;
  accommodation_type: string;
  accommodation_code: string;
  date_established: string | null;
  room_names?: string[];
  company_name: string;
}

interface AdminSubmission extends Submission {
  deadline: string;
  company_name: string;
  accommodation_type?: string;
  nationalityCounts?: Record<string, number>;
  // Ensure these properties exist
  number_of_rooms: number;
  days: DayData[];
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [declineMessage, setDeclineMessage] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  
  const navigate = useNavigate();

  // Helper function to get month name
  const getMonthName = (m: number): string => { 
    const d = new Date(); 
    d.setMonth(m - 1); 
    return d.toLocaleString("default", { month: "long" }); 
  };

  // Fetch users only when needed
  useEffect(() => { 
    if (activeSection !== "user-approval") return;
    
    const fetchUsers = async () => { 
      try { 
        setLoading(true);
        setError(null);
        const data = await adminAPI.getUsers();
        // Transform the data to ensure compatibility
        const transformedUsers: AdminUser[] = data.map((user: any) => ({
          ...user,
          company_name: user.company_name || user.establishment_name || "N/A"
        }));
        setUsers(transformedUsers);
      } catch (err: any) { 
        console.error("Error fetching users:", err);
        setError(err.response?.data?.error || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [activeSection]);

  // Fetch all submissions (for Submission Overview section)
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const userData = sessionStorage.getItem("user");
        if (userData) {
          setCurrentAdmin(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Error fetching current admin:", err);
      }
    };
    
    fetchCurrentAdmin();
  }, []);

  // Fetch submission details
  const fetchSubmissionDetails = async (submissionId: string) => {
    try { 
      setLoading(true);
      setError(null);
      const data = await submissionsAPI.getSubmissionDetails(parseInt(submissionId));
      setSelectedSubmission(data); 
      setShowSubmissionModal(true);
    } catch (err: any) { 
      console.error("Error fetching submission details:", err);
      setError(err.response?.data?.error || "Failed to fetch submission details");
    } finally {
      setLoading(false);
    }
  };

  // Approve User
  const approveUser = async (userId: string) => {
    try { 
      setError(null);
      await adminAPI.approveUser(parseInt(userId));
      setUsers(users.map(u => u.user_id === parseInt(userId) ? { ...u, is_approved: true } : u));
    } catch (err: any) { 
      console.error("Error approving user:", err);
      setError(err.response?.data?.error || "Failed to approve user");
    }
  };

  // Decline User
  const declineUser = async (userId: string) => {
    try { 
      setError(null);
      await adminAPI.declineUser(parseInt(userId), declineMessage);
      setUsers(users.filter(u => u.user_id !== parseInt(userId))); 
      setSelectedUserId(null); 
      setDeclineMessage("");
    } catch (err: any) { 
      console.error("Error declining user:", err);
      setError(err.response?.data?.error || "Failed to decline user");
    }
  };

  // Calculate metrics and totals for submissions
  const calculateMetrics = (submission: Submission | null): Metrics & { averageLengthOfStay: number } => {
    if (!submission || !submission.days) return { 
      totalCheckIns: 0, 
      totalOvernight: 0, 
      totalOccupied: 0, 
      averageLengthOfStay: 0,
      averageGuestNights: 0, 
      averageRoomOccupancyRate: 0, 
      averageGuestsPerRoom: 0 
    };

    const { days, number_of_rooms } = submission;
    const totalCheckIns = days.reduce((a, d) => a + (d.check_ins || 0), 0);
    const totalOvernight = days.reduce((a, d) => a + (d.overnight || 0), 0);
    const totalOccupied = days.reduce((a, d) => a + (d.occupied || 0), 0);

    const averageLengthOfStay = totalCheckIns > 0 ? parseFloat((totalOvernight / totalCheckIns).toFixed(2)) : 0;
    const averageGuestNights = averageLengthOfStay; // for compatibility
    const averageRoomOccupancyRate = number_of_rooms > 0 ? parseFloat(((totalOccupied / (number_of_rooms * days.length)) * 100).toFixed(2)) : 0;
    const averageGuestsPerRoom = totalOccupied > 0 ? parseFloat((totalOvernight / totalOccupied).toFixed(2)) : 0;

    return { 
      totalCheckIns, 
      totalOvernight, 
      totalOccupied, 
      averageLengthOfStay,
      averageGuestNights, 
      averageRoomOccupancyRate, 
      averageGuestsPerRoom 
    };
  };

  // Logout function
  const handleLogout = () => { 
    sessionStorage.removeItem("token"); 
    sessionStorage.removeItem("user"); 
    navigate("/login"); 
  };

  const isSubmissionLate = (submission: Submission): boolean => {
    if (!submission.submitted_at) return false;
    
    // For AdminSubmission with deadline, use it. Otherwise calculate based on submission date
    const submissionDate = new Date(submission.submitted_at);
    const deadlineDate = (submission as any).deadline 
      ? new Date((submission as any).deadline)
      : new Date(submissionDate.getFullYear(), submissionDate.getMonth(), 10, 23, 59, 59); // Default to 10th of month
    
    return submissionDate > deadlineDate;
  };

  // Handle penalty payment
  const handlePenaltyPayment = async (submissionId: string, penaltyStatus: boolean) => {
    try { 
      setError(null);
      await submissionsAPI.applyPenalty(submissionId, penaltyStatus);
      setSubmissions(submissions.map(s => s.submission_id === submissionId ? { ...s, penalty: penaltyStatus } : s));
    } catch (err: any) { 
      console.error("Error updating penalty status:", err);
      setError(err.response?.data?.error || "Failed to update penalty status");
    }
  };

  return (
    <div className="container-fluid">
      {/* Header with hamburger and title */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
        <button
          className="menu-toggle-btn d-md-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: 32, color: '#00BCD4' }}></i>
        </button>
        
        {/* Error Display */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show ms-3" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="ms-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>

      <div className="row">
        {/* Sidebar */}
        <AdminSidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          handleLogout={handleLogout} 
        />
        
        {/* Main Content */}
        <div className="col-md-9">
          <div className="p-4">
            {activeSection === "dashboard" && (<MainDashboard user={currentAdmin || { role: "admin" }} />)}
            {activeSection === "user-approval" && (
              <UserApproval
                users={users.map(user => ({
                  ...user,
                  user_id: user.user_id.toString() // Convert number to string for UserApproval
                }))}
                selectedUserId={selectedUserId}
                declineMessage={declineMessage}
                approveUser={approveUser}
                setSelectedUserId={setSelectedUserId}
                declineUser={declineUser}
                setDeclineMessage={setDeclineMessage}
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