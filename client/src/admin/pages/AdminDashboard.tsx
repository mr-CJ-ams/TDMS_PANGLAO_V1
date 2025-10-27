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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserApproval from "./UserApproval";
import SubmissionOverview from "./SubmissionOverview";
import MainDashboard from "./MainDashboard";
import AdminSidebar from "../components/AdminSidebar";
import '../../components/MenuButton.css';

interface User {
  user_id: string;
  company_name: string | null;
  email: string;
  phone_number: string;
  registered_owner: string;
  tin: string;
  region: string | null;
  province: string | null;
  municipality: string | null;
  barangay: string | null;
  date_established: string | null;
  accommodation_type: string;
  accommodation_code: string;
  number_of_rooms: number;
  is_approved: boolean;
  is_active: boolean;
}

interface Submission {
  submission_id: string;
  user_id: string;
  company_name: string;
  month: number;
  year: number;
  submitted_at: string;
  deadline: string;
  penalty?: boolean;
  receipt_number?: string;
  accommodation_type?: string;
  number_of_rooms: number;
  days: DayData[];
  nationalityCounts?: Record<string, number>;
}

interface DayData {
  day: number;
  guests: Guest[];
  check_ins?: number;
  overnight?: number;
  occupied?: number;
}

interface Guest {
  room_number: number;
  isCheckIn: boolean;
  gender: string;
  age: string;
  status: string;
  nationality: string;
}

// In both AdminDashboard.tsx and SubmissionOverview.tsx
interface Metrics {
  totalCheckIns: number;
  totalOvernight: number;
  totalOccupied: number;
  averageGuestNights: number;  // Changed from string to number
  averageRoomOccupancyRate: number;  // Changed from string to number
  averageGuestsPerRoom: number;  // Changed from string to number
}



const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [declineMessage, setDeclineMessage] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
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
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get<User[]>(`${API_BASE_URL}/api/admin/users`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }); 
        setUsers(data);
      } catch (err) { 
        console.error("Error fetching users:", err); 
      } 
    };
    
    fetchUsers();
  }, [activeSection, API_BASE_URL]);

  // Fetch all submissions (for Submission Overview section)
  useEffect(() => { 
    const fetchSubmissions = async () => { 
      try { 
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get<{ submissions: Submission[] }>(`${API_BASE_URL}/api/admin/submissions`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }); 
        setSubmissions(data.submissions);
      } catch (err) { 
        console.error("Error fetching submissions:", err); 
      } 
    };
    
    fetchSubmissions();
  }, [API_BASE_URL]);

  // Fetch submission details
  const fetchSubmissionDetails = async (submissionId: string) => {
    try { 
      const token = sessionStorage.getItem("token");
      const { data } = await axios.get<Submission>(`${API_BASE_URL}/api/submissions/details/${submissionId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSelectedSubmission(data); 
      setShowSubmissionModal(true);
    } catch (err) { 
      console.error("Error fetching submission details:", err); 
    }
  };

  // Approve User
  const approveUser = async (userId: string) => {
    try { 
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/admin/approve/${userId}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_approved: true } : u));
    } catch (err) { 
      console.error("Error approving user:", err); 
    }
  };

  // Decline User
  const declineUser = async (userId: string) => {
    try { 
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/admin/decline/${userId}`, { message: declineMessage }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUsers(users.filter(u => u.user_id !== userId)); 
      setSelectedUserId(null); 
      setDeclineMessage("");
    } catch (err) { 
      console.error("Error declining user:", err); 
    }
  };



  // Calculate metrics and totals for submissions
  const calculateMetrics = (submission: Submission | null): Metrics => {
    if (!submission || !submission.days) return { 
      totalCheckIns: 0, 
      totalOvernight: 0, 
      totalOccupied: 0, 
      averageGuestNights: 0, 
      averageRoomOccupancyRate: 0, 
      averageGuestsPerRoom: 0 
    };

    
 const { days, number_of_rooms } = submission;
  const totalCheckIns = days.reduce((a, d) => a + (d.check_ins || 0), 0);
  const totalOvernight = days.reduce((a, d) => a + (d.overnight || 0), 0);
  const totalOccupied = days.reduce((a, d) => a + (d.occupied || 0), 0);
  
  // Convert string averages to numbers using parseFloat
  const averageGuestNights = totalCheckIns > 0 ? 
    parseFloat((totalOvernight / totalCheckIns).toFixed(2)) : 0;
  
  const averageRoomOccupancyRate = number_of_rooms > 0 ? 
    parseFloat(((totalOccupied / (number_of_rooms * days.length)) * 100).toFixed(2)) : 0;
  
  const averageGuestsPerRoom = totalOccupied > 0 ? 
    parseFloat((totalOvernight / totalOccupied).toFixed(2)) : 0;
    
    return { 
      totalCheckIns, 
      totalOvernight, 
      totalOccupied, 
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

  const isSubmissionLate = (submission: Submission): boolean => 
    new Date(submission.submitted_at) > new Date(submission.deadline);

  // Handle penalty payment
  const handlePenaltyPayment = async (submissionId: string, penaltyStatus: boolean) => {
    try { 
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/submissions/penalty/${submissionId}`, { penalty: penaltyStatus }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSubmissions(submissions.map(s => s.submission_id === submissionId ? { ...s, penalty: penaltyStatus } : s));
    } catch (err) { 
      console.error("Error updating penalty status:", err); 
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
            {activeSection === "dashboard" && <MainDashboard user={{ role: "admin" }} />}
            {activeSection === "user-approval" && (
              <UserApproval
                users={users}
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
